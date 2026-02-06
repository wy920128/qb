// server/api/person/patch.ts
import { Res } from "~/types";
import { PersonRes } from "~/types/person";
import { utilsQuery } from "~/server/utils/query";
import { safeJsonParse } from "~/server/utils/parse";
import { formatDate } from "~/utils/formatData.util";

export default defineEventHandler(async (event): Promise<Res<PersonRes[]>> => {
  try {
    const body = await readBody(event);
    const {
      id, // 必需：要更新的人员ID
      name,
      gender,
      birthday,
      credential,
      contact,
      address,
      classifyIds = [],
    } = body;

    // 验证必需参数
    if (!id) {
      throw createError({ statusCode: 400, statusMessage: `人员ID不能为空` });
    }

    // 构建动态更新字段和参数[3](@ref)
    const updateFields: string[] = [];
    const params: any[] = [];

    if (name !== undefined) {
      if (!name?.trim()) {
        throw createError({ statusCode: 400, statusMessage: `姓名不能为空` });
      }
      updateFields.push("name = ?");
      params.push(name.trim());
    }

    if (gender !== undefined) {
      if (![`男`, `女`, `其他`].includes(gender)) {
        throw createError({ statusCode: 400, statusMessage: `性别参数不合法` });
      }
      updateFields.push("gender = ?");
      params.push(gender);
    }

    if (birthday !== undefined) {
      updateFields.push("birthday = ?");
      params.push(formatDate(birthday));
    }

    if (credential !== undefined) {
      updateFields.push("credential = ?");
      params.push(credential ? JSON.stringify(credential) : null);
    }

    if (contact !== undefined) {
      updateFields.push("contact = ?");
      params.push(contact ? JSON.stringify(contact) : null);
    }

    if (address !== undefined) {
      updateFields.push("address = ?");
      params.push(address ? JSON.stringify(address) : null);
    }

    // 如果没有提供任何要更新的字段
    if (updateFields.length === 0) {
      throw createError({
        statusCode: 400,
        statusMessage: `未提供任何要更新的字段`,
      });
    }

    // 添加更新时间戳[5](@ref)
    updateFields.push("updated_time = NOW()");

    // 构建UPDATE SQL语句[5](@ref)
    const updateSql = `
      UPDATE person 
      SET ${updateFields.join(", ")}
      WHERE id = ?
    `;
    params.push(id);

    // 执行更新操作
    const result: { affectedRows: number }[] = await utilsQuery(
      updateSql,
      params,
    );

    if (result[0]?.affectedRows === 0) {
      throw createError({
        statusCode: 404,
        statusMessage: `未找到ID为${id}的人员`,
      });
    }

    // 处理分类关系更新（如果提供了classifyIds）
    if (Array.isArray(classifyIds) && classifyIds.length > 0) {
      // 先删除现有的分类关系
      const deleteRelationSql = `DELETE FROM classify2person WHERE person_id = ?`;
      await utilsQuery(deleteRelationSql, [id]);

      // 插入新的分类关系
      await handlePersonClassifyRelation(id, classifyIds);
    }

    // 查询更新后的人员信息（复用POST接口中的查询逻辑）
    const selectSql = `
      SELECT 
        CAST(p.id AS UNSIGNED) as id,
        p.name,
        p.gender,
        p.birthday,
        p.credential,
        p.contact,
        p.address,
        p.created_time,
        p.updated_time,
        COALESCE(
          (
            SELECT CASE 
              WHEN COUNT(c.name) = 0 THEN JSON_ARRAY()
              WHEN COUNT(c.name) = 1 THEN JSON_ARRAY(MAX(c.name))
              ELSE JSON_ARRAYAGG(c.name)
            END
            FROM classify2person pc
            LEFT JOIN classify c ON pc.classify_id = c.id AND c.deleted_time IS NULL
            WHERE pc.person_id = p.id AND pc.deleted_time IS NULL
            AND c.name IS NOT NULL
          ),
          JSON_ARRAY()
        ) AS classify,
        COALESCE(
          JSON_ARRAYAGG(
            JSON_OBJECT(
              'tag_name', tag_summary.tag_name,
              'count', tag_summary.tag_count
            )
          ),
          JSON_ARRAY()
        ) AS record_tag
      FROM person p
      LEFT JOIN (
        SELECT 
          pr.person_id,
          t.name AS tag_name,
          COUNT(*) AS tag_count
        FROM person2record pr
        LEFT JOIN record r ON pr.record_id = r.id AND r.deleted_time IS NULL
        LEFT JOIN record2tag rt ON r.id = rt.record_id AND rt.deleted_time IS NULL
        LEFT JOIN tag t ON rt.tag_id = t.id AND t.deleted_time IS NULL
        WHERE pr.deleted_time IS NULL AND t.name IS NOT NULL
        GROUP BY pr.person_id, t.name
      ) AS tag_summary ON p.id = tag_summary.person_id
      WHERE p.id = ?
      GROUP BY p.id, p.name, p.gender, p.birthday, p.credential, p.contact, p.address, p.created_time, p.updated_time
    `;

    const personData = await utilsQuery(selectSql, [id]);
    const updatedPerson = personData[0] as PersonRes;

    if (updatedPerson) {
      // 解析JSON字段[5](@ref)
      updatedPerson.credential = safeJsonParse(updatedPerson.credential, []);
      updatedPerson.contact = safeJsonParse(updatedPerson.contact, []);
      updatedPerson.address = safeJsonParse(updatedPerson.address, []);
      updatedPerson.classify = safeJsonParse(updatedPerson.classify, []);
    }

    return {
      code: 200,
      data: {
        list: [updatedPerson],
        pagination: { page: 1, pageSize: 1, total: 1, totalPages: 1 },
      },
      message: `人员信息更新成功`,
      success: true,
      timestamp: new Date().toISOString(),
    };
  } catch (error: any) {
    console.error(`更新人员信息失败:`, error);
    if (error.statusCode) {
      throw createError({
        statusCode: error.statusCode,
        statusMessage: error.statusMessage,
        data: {
          code: error.statusCode,
          data: null,
          message: error.statusMessage,
          success: false,
          timestamp: new Date().toISOString(),
        },
      });
    }
    return {
      code: 500,
      data: {
        list: [],
        pagination: { page: 1, pageSize: 1, total: 0, totalPages: 0 },
      },
      message: error.message || `更新人员信息失败`,
      success: false,
      timestamp: new Date().toISOString(),
    };
  }
});

// 复用POST接口中的分类关系处理函数
async function handlePersonClassifyRelation(
  personId: number,
  classifyIds: number[],
) {
  const values = classifyIds
    .map((id) => `(${personId}, ${id}, NOW(), NOW())`)
    .join(`,`);
  const insertRelationSql = `INSERT INTO classify2person (person_id, classify_id, created_time, updated_time) VALUES ${values}`;
  await utilsQuery(insertRelationSql);
}
