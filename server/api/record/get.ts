/*
 * @Author: 王野 18545455617@163.com
 * @Date: 2025-12-25 09:10:00
 * @LastEditors: 王野 18545455617@163.com
 * @LastEditTime: 2026-01-22 15:54:43
 * @FilePath: /vip/server/api/record/get.ts
 * @Description: record GET请求接口 - 通过person_id查询关联记录及标签
 */
import { utilsQuery } from "~/server/utils/query";

export default defineEventHandler(async (event) => {
  try {
    const param = getQuery(event);
    const {
      // 分页参数
      page = 1,
      pageSize = 10,
      // 记录查询参数
      id,
      content,
      // 人员关联参数
      person_id,
      // 忽略其他无关参数
      ...rest
    } = param;

    // 类型转换
    const currentPage = Number(page) || 1;
    const pageSizeNum = Number(pageSize) || 10;
    const offset = (currentPage - 1) * pageSizeNum;

    // 构建查询参数
    const params: any[] = [];

    // 基础 SQL - 查询记录及关联标签
    let selectSql = `
      SELECT 
        r.id,
        r.content,
        r.created_time,
        r.updated_time,
        r.deleted_time,
        -- 聚合标签信息
        COALESCE(
          JSON_ARRAYAGG(
            JSON_OBJECT(
              'id', t.id,
              'name', t.name,
              'created_time', t.created_time,
              'updated_time', t.updated_time,
              'deleted_time', t.deleted_time
            )
          ),
          JSON_ARRAY()
        ) as tags
      FROM record r
      -- 关联人员信息
      INNER JOIN person2record pr ON r.id = pr.record_id AND pr.deleted_time IS NULL
      -- 关联标签信息（左连接，确保即使没有标签也返回记录）
      LEFT JOIN record2tag rt ON r.id = rt.record_id AND rt.deleted_time IS NULL
      LEFT JOIN tag t ON rt.tag_id = t.id AND t.deleted_time IS NULL
      WHERE r.deleted_time IS NULL
    `;

    // 计数 SQL - 用于分页总条数
    let countSql = `
      SELECT COUNT(DISTINCT r.id) as total 
      FROM record r
      INNER JOIN person2record pr ON r.id = pr.record_id AND pr.deleted_time IS NULL
      WHERE r.deleted_time IS NULL
    `;

    // 动态添加过滤条件

    // 1. 记录ID精确匹配
    if (id !== undefined && id !== "") {
      selectSql += " AND r.id = ?";
      countSql += " AND r.id = ?";
      params.push(Number(id));
    }

    // 2. 记录内容模糊匹配
    if (content !== undefined && content !== "") {
      selectSql += " AND r.content LIKE ?";
      countSql += " AND r.content LIKE ?";
      params.push;
    }

    // 3. 人员关联条件（必需条件）
    if (person_id !== undefined && person_id !== "") {
      selectSql += " AND pr.person_id = ?";
      countSql += " AND pr.person_id = ?";
      params.push(Number(person_id));
    } else {
      // 如果没有提供person_id，返回错误
      return {
        code: 400,
        data: {
          list: [],
          pagination: {
            page: currentPage,
            pageSize: pageSizeNum,
            total: 0,
            totalPages: 0,
          },
        },
        message: "person_id参数不能为空",
      };
    }

    // 添加分组和排序
    selectSql +=
      " GROUP BY r.id, r.content, r.created_time, r.updated_time, r.deleted_time";
    selectSql += " ORDER BY r.created_time DESC";

    // 添加分页
    selectSql += " LIMIT ? OFFSET ?";

    // 复制参数用于计数查询
    const countParams = [...params];

    // 补充分页参数（只用于selectSql）
    params.push(pageSizeNum, offset);

    // 执行查询
    const [recordList, countResult] = await Promise.all([
      utilsQuery(selectSql, params),
      utilsQuery(countSql, countParams),
    ]);

    const total = countResult[0]?.total || 0;

    // 处理返回数据，确保tags字段正确解析
    const processedList = recordList.map((record: any) => {
      try {
        if (record.tags && typeof record.tags === "string") {
          record.tags = JSON.parse(record.tags);
        }
        // 过滤掉标签中的null值（由于LEFT JOIN可能产生）
        if (Array.isArray(record.tags)) {
          record.tags = record.tags.filter(
            (tag: any) => tag && tag.id !== null,
          );
        }
      } catch (error) {
        console.warn("解析tags字段失败:", error);
        record.tags = [];
      }
      return record;
    });

    return {
      code: 200,
      data: {
        list: processedList,
        pagination: {
          page: currentPage,
          pageSize: pageSizeNum,
          total: total,
          totalPages: Math.ceil(total / pageSizeNum),
        },
      },
      message: "查询成功",
    };
  } catch (error) {
    console.error("查询失败:", error);

    // 更详细的错误处理
    const errorMessage = error instanceof Error ? error.message : "未知错误";

    return {
      code: 500,
      data: {
        list: [],
        pagination: {
          page: 1,
          pageSize: 10,
          total: 0,
          totalPages: 0,
        },
      },
      message: "查询失败",
      error: errorMessage,
    };
  }
});
