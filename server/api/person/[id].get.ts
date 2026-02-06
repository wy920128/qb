/*
 * @Author: 王野 18545455617@163.com
 * @Date: 2026-01-22 14:45:19
 * @LastEditors: 王野 18545455617@163.com
 * @LastEditTime: 2026-02-04 16:10:59
 * @FilePath: /qb/server/api/person/[id].get.ts
 * @Description: 获取人员详细信息
 */
import { Res } from "~/types";
import { PersonRes } from "~/types/person";
import { utilsQuery } from "~/server/utils/query";
import { safeJsonParse } from "~/server/utils/parse";

export default defineEventHandler(async (event): Promise<Res<PersonRes[]>> => {
  try {
    const id: string | undefined = getRouterParam(event, `id`);

    if (!id) {
      throw createError({
        statusCode: 400,
        statusMessage: `人员ID不能为空`,
      });
    }

    // 验证ID格式 - 更严格的验证
    const personId = Number(id);
    if (isNaN(personId) || personId <= 0 || !Number.isInteger(personId)) {
      throw createError({
        statusCode: 400,
        statusMessage: `人员ID格式无效`,
      });
    }

    // 修复BigInt问题：在所有ID字段中使用CAST确保类型一致
    const personSql = `
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
        p.deleted_time
      FROM person p
      WHERE p.id = ? AND p.deleted_time IS NULL
    `;

    // 分类查询：修复JSON_ARRAYAGG可能返回简单字符串的问题
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

    // 记录和标签查询：修复类型转换问题
    const recordsSql = `
      SELECT 
        CAST(r.id AS UNSIGNED) as id,
        r.content,
        r.flag_inJQ,
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
      utilsQuery(personSql, [personId]),
      utilsQuery(classifySql, [personId]),
      utilsQuery(recordsSql, [personId]),
    ]);

    // 检查人员是否存在
    if (personResult.length === 0) {
      throw createError({
        statusCode: 404,
        statusMessage: `人员不存在`,
      });
    }

    const personData = personResult[0];

    // 安全处理JSON字段 - 使用统一的安全解析函数
    const processedPersonData = {
      ...personData,
      credential: safeJsonParse(personData.credential, []),
      contact: safeJsonParse(personData.contact, []),
      address: safeJsonParse(personData.address, []),
    };

    // 处理分类数据
    const classifyData = safeJsonParse(classifyResult[0]?.classify, []);

    // 处理记录数据
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
      message: `获取人员详情成功`,
      success: true,
      timestamp: new Date().toISOString(),
    };
  } catch (error: any) {
    // 如果是createError创建的错误，直接抛出
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

    // 返回标准错误格式
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
      message: error.message || `获取人员详情失败`,
      success: false,
      timestamp: new Date().toISOString(),
    };
  }
});
