import { PersonRes, Res } from "~/types";
import { utilsQuery } from "~/server/utils/query";

export default defineEventHandler(async (event): Promise<Res<PersonRes[]>> => {
  try {
    const query = getQuery(event);
    const {
      page = 1,
      pageSize = 10,
      id,
      name,
      gender,
      id_number,
      classifyIds,
      ...rest
    } = query;

    // 类型转换
    const currentPage = Number(page) || 1;
    const pageSizeNum = Number(pageSize) || 10;
    const offset = (currentPage - 1) * pageSizeNum;

    // 构建查询参数
    const params: any[] = [];

    // 基础 SQL - 修正分类条件位置
    let selectSql = `
      SELECT DISTINCT
        p.id,
        p.name,
        p.gender,
        p.credential,
        p.created_time,
        p.updated_time,
        COALESCE(
          (
            SELECT JSON_ARRAYAGG(c.name)
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
      WHERE p.deleted_time IS NULL
    `;

    // 计数 SQL - 必须与查询SQL保持相同的过滤条件
    let countSql = `
      SELECT COUNT(DISTINCT p.id) as total 
      FROM person p 
      WHERE p.deleted_time IS NULL
    `;

    // 动态添加过滤条件（同时应用到selectSql和countSql）

    // 1. id 精确匹配
    if (id !== undefined && id !== ``) {
      selectSql += ` AND p.id = ?`;
      countSql += ` AND p.id = ?`;
      params.push(Number(id));
    }

    // 2. name 模糊匹配
    if (name !== undefined && name !== ``) {
      selectSql += ` AND p.name LIKE ?`;
      countSql += ` AND p.name LIKE ?`;
      params.push(`%${name}%`);
    }

    // 3. gender 精确匹配
    if (gender !== undefined && gender !== ``) {
      selectSql += ` AND p.gender = ?`;
      countSql += ` AND p.gender = ?`;
      params.push(gender);
    }

    // 4. id_number 模糊匹配
    if (id_number !== undefined && id_number !== ``) {
      selectSql += ` AND JSON_SEARCH(p.credential, 'one', ? , null, '$[*].number') IS NOT NULL`;
      countSql += ` AND JSON_SEARCH(p.credential, 'one', ? , null, '$[*].number') IS NOT NULL`;
      params.push(`%${id_number}%`);
    }

    // 5. 分类关联条件 - 修正：放在WHERE子句中
    if (classifyIds !== undefined && classifyIds !== ``) {
      const classifyArray = String(classifyIds)
        .split(`,`)
        .map((id) => Number(id))
        .filter((id) => !isNaN(id));

      if (classifyArray.length > 0) {
        const placeholders = classifyArray.map(() => `?`).join(`,`);

        selectSql += ` AND EXISTS (
          SELECT 1 FROM classify2person pc 
          WHERE pc.person_id = p.id 
          AND pc.deleted_time IS NULL 
          AND pc.classify_id IN (${placeholders})
        )`;

        countSql += ` AND EXISTS (
          SELECT 1 FROM classify2person pc 
          WHERE pc.person_id = p.id 
          AND pc.deleted_time IS NULL 
          AND pc.classify_id IN (${placeholders})
        )`;

        params.push(...classifyArray);
      }
    }

    // 添加 GROUP BY 和分页
    selectSql += ` GROUP BY p.id, p.name, p.gender, p.credential, p.created_time, p.updated_time`;
    selectSql += ` LIMIT ? OFFSET ?`;

    // 复制查询参数用于计数查询
    const countParams = [...params];

    // 补充分页参数（只用于selectSql）
    params.push(pageSizeNum, offset);

    const personList: PersonRes[] = await utilsQuery(selectSql, params);
    const countResult = await utilsQuery(countSql, countParams);
    const total = Number((countResult as any[])[0]?.total) || 0;

    return {
      code: 200,
      data: {
        list: personList,
        pagination: {
          page: currentPage,
          pageSize: pageSizeNum,
          total,
          totalPages: Math.ceil(total / pageSizeNum),
        },
      },
      message: `查询成功，共 ${total} 条记录`,
      success: true,
      timestamp: new Date().toISOString(),
    };
  } catch (error) {
    return {
      code: 500,
      data: {
        list: [],
        pagination: {
          page: 1,
          pageSize: 1,
          total: 1,
          totalPages: 1,
        },
      },
      message: error instanceof Error ? error.message : String(error),
      success: false,
      timestamp: new Date().toISOString(),
    };
  }
});
