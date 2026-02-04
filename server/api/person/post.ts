import { Res } from "~/types";
import { PersonPO, PersonRes } from "~/types/person";
import { utilsQuery } from "~/server/utils/query";
import { safeJsonParse } from "~/server/utils/parse";
import { utilsTransaction } from "~/server/utils/query";

export default defineEventHandler(async (event): Promise<Res<PersonRes[]>> => {
  try {
    // 获取并解析POST请求体
    const reqBody = await readBody<PersonPO>(event);
    if (!reqBody) {
      throw new Error(`请求体不能为空`);
    }

    // 基础参数校验
    const personName = (reqBody.name || "").trim();
    if (!personName) {
      throw new Error(`人员姓名不能为空`);
    }
    if (reqBody.gender && typeof reqBody.gender !== "string") {
      throw new Error(`性别必须为字符串格式`);
    }

    // 分类ID格式处理
    let classifyArray: number[] = [];
    if (reqBody.classifyIds && Array.isArray(reqBody.classifyIds)) {
      classifyArray = reqBody.classifyIds
        .map((id) => Number(id))
        .filter((id) => !isNaN(id) && id > 0 && Number.isInteger(id));
    }

    // 安全解析JSON字段
    const credential = safeJsonParse(reqBody.credential || "[]", []);
    const contact = safeJsonParse(reqBody.contact || "[]", []);
    const address = safeJsonParse(reqBody.address || "[]", []);

    // 事务执行新增操作
    const newPersonId = await utilsTransaction(async (conn) => {
      // 插入人员主表
      const insertPersonSql = `
        INSERT INTO person (
          name, 
          gender, 
          credential, 
          contact, 
          address, 
          created_time, 
          updated_time, 
          deleted_time
        ) VALUES (?, ?, ?, ?, ?, NOW(), NOW(), NULL)
      `;
      const [insertPersonResult] = await conn.execute(insertPersonSql, [
        personName,
        reqBody.gender || "",
        JSON.stringify(credential),
        JSON.stringify(contact),
        JSON.stringify(address),
      ]);

      // 获取新增ID
      const personId =
        (insertPersonResult as any).insertId ||
        (insertPersonResult as any).lastInsertId;
      if (!personId || isNaN(Number(personId))) {
        throw new Error(`新增人员主表失败，未获取到人员ID`);
      }

      // 插入分类关联
      if (classifyArray.length > 0) {
        const insertClassifySql = `
          INSERT INTO classify2person (
            person_id, 
            classify_id, 
            created_time, 
            updated_time, 
            deleted_time
          ) VALUES (?, ?, NOW(), NOW(), NULL)
        `;
        for (const classifyId of classifyArray) {
          await conn.execute(insertClassifySql, [Number(personId), classifyId]);
        }
      }

      return Number(personId);
    });

    // 查询新增后的完整信息
    const personSql = `
      SELECT 
        CAST(p.id AS UNSIGNED) as id,
        p.name,
        p.gender,
        p.credential,
        p.contact,
        p.address,
        p.created_time,
        p.updated_time,
        p.deleted_time
      FROM person p
      WHERE p.id = ? AND p.deleted_time IS NULL
    `;

    const classifySql = `
      SELECT 
        CASE 
          WHEN COUNT(c.name) = 0 THEN JSON_ARRAY()
          WHEN COUNT(c.name) = 1 THEN JSON_ARRAY(MAX(c.name))
          ELSE JSON_ARRAYAGG(c.name)
        END as classify
      FROM classify2person pc
      LEFT JOIN classify c ON pc.classify_id = c.id AND c.deleted_time IS NULL
      WHERE pc.person_id = ? AND pc.deleted_time IS NULL
      AND c.name IS NOT NULL
    `;

    const recordsSql = `
      SELECT 
        CAST(r.id AS UNSIGNED) as id,
        r.content,
        r.created_time,
        r.updated_time,
        r.deleted_time,
        COALESCE(
          JSON_ARRAYAGG(
            JSON_OBJECT(
              'id', CAST(t.id AS UNSIGNED),
              'name', t.name,
              'created_time', t.created_time,
              'updated_time', t.updated_time,
              'deleted_time', t.deleted_time
            )
          ),
          JSON_ARRAY()
        ) as tag
      FROM person2record pr
      LEFT JOIN record r ON pr.record_id = r.id AND r.deleted_time IS NULL
      LEFT JOIN record2tag rt ON r.id = rt.record_id AND rt.deleted_time IS NULL
      LEFT JOIN tag t ON rt.tag_id = t.id AND t.deleted_time IS NULL
      WHERE pr.person_id = ? AND pr.deleted_time IS NULL
      GROUP BY r.id, r.content, r.created_time, r.updated_time, r.deleted_time
      ORDER BY r.created_time DESC
    `;

    // 执行查询
    const [personResult, classifyResult, recordsResult] = await Promise.all([
      utilsQuery(personSql, [newPersonId]),
      utilsQuery(classifySql, [newPersonId]),
      utilsQuery(recordsSql, [newPersonId]),
    ]);

    if (personResult.length === 0) {
      throw new Error(`新增人员后查询失败，人员不存在`);
    }

    // 处理返回数据
    const personData = personResult[0];
    const processedPersonData = {
      ...personData,
      credential: safeJsonParse(personData.credential, []),
      contact: safeJsonParse(personData.contact, []),
      address: safeJsonParse(personData.address, []),
    };

    const classifyData = safeJsonParse(classifyResult[0]?.classify, []);
    const processedRecords = recordsResult.map((record: any) => ({
      ...record,
      tag: safeJsonParse(record.tag, []),
    }));

    const responseData: PersonRes = {
      ...processedPersonData,
      classify: classifyData,
      record: processedRecords,
    };

    // 返回成功响应
    return {
      code: 200,
      data: {
        list: [responseData],
        pagination: {
          page: 1,
          pageSize: 1,
          total: 1,
          totalPages: 1,
        },
      },
      message: `新增人员成功，共 1 条记录`,
      success: true,
      timestamp: new Date().toISOString(),
    };
  } catch (error) {
    // 统一错误处理
    return {
      code: 500,
      data: {
        list: [],
        pagination: {
          page: 1,
          pageSize: 1,
          total: 0,
          totalPages: 0,
        },
      },
      message: error instanceof Error ? error.message : String(error),
      success: false,
      timestamp: new Date().toISOString(),
    };
  }
});
