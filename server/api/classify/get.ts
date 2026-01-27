/*
 * @Author: 王野 18545455617@163.com
 * @Date: 2026-01-06 08:38:45
 * @LastEditors: 王野 18545455617@163.com
 * @LastEditTime: 2026-01-26 16:22:07
 * @FilePath: /vip/server/api/auth2classify/index.get.ts
 * @Description: 根据auth_id获取用户关联分类接口 - 已修正
 */
import type { Res } from "~/types/index";
import type { Classify } from "~/types";
import { utilsQuery } from "~/server/utils/query";

// 响应数据类型定义 (根据实际表结构修正)
interface AuthClassifyResponse {
  auth_id: number;
  classify_list: Classify[]; // Classify 现在只包含 id 和 name
  total_count: number;
}

export default defineEventHandler(
  async (event): Promise<Res<Classify[] | null>> => {
    try {
      // 1. 获取并验证查询参数
      const queryParams = getQuery(event);
      // const { auth_id } = queryParams;
      // if (!auth_id || auth_id === ``) {
      //   throw createError({
      //     statusCode: 400,
      //     statusMessage: `用户ID不能为空`,
      //   });
      // }
      // const userId = Number(auth_id);
      // if (isNaN(userId) || userId <= 0) {
      //   throw createError({
      //     statusCode: 400,
      //     statusMessage: `用户ID格式无效`,
      //   });
      // }
      // const sql = `
      //   SELECT 
      //     c.id,
      //     c.name
      //   FROM auth2classify ac
      //   INNER JOIN classify c ON ac.classify_id = c.id 
      //     AND c.deleted_time IS NULL
      //   WHERE ac.auth_id = ? 
      //     AND ac.deleted_time IS NULL
      //   ORDER BY c.name ASC
      // `;
      const sql = `
        SELECT 
          c.id,
          c.name
        FROM  classify c
      WHERE c.deleted_time IS NULL
        ORDER BY c.name ASC
      `;
      // const params = [userId];
      // 3. 执行查询
      const result: Classify[] = await utilsQuery(sql, /* params */);
      // 4. 处理查询结果
      return {
        code: 200,
        data: {
          list: result,
          pagination: {
            page: 1,
            pageSize: 0,
            total: 0,
            totalPages: 0,
          },
        },
        message: `获取用户关联分类成功，共找到 ${result.length} 个分类`,
        success: true,
        timestamp: new Date().toISOString(),
      };
    } catch (error: any) {
      // 错误处理
      const statusCode = error.statusCode || 500;
      return {
        code: statusCode,
        data: {
          list: null,
          pagination: {
            page: 1,
            pageSize: 0,
            total: 0,
            totalPages: 0,
          },
        },
        message:
          error.statusMessage ||
          `获取用户关联分类失败：${error.message || "服务器内部错误"}`,
        success: false,
        timestamp: new Date().toISOString(),
      };
    }
  },
);
