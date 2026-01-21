/*
 * @Author: 王野 18545455617@163.com
 * @Date: 2026-01-21 11:05:00
 * @LastEditors: 王野 18545455617@163.com
 * @LastEditTime: 2026-01-21 16:43:51
 * @FilePath: /vip/server/api/auth/logout.ts
 * @Description: 后台退出接口
 */
import { jwtVerify } from "jose";
import type { Res, AuthRes } from "~/types/index";
import type { Auth } from "~/types";
import { query } from "~/server/utils/query";

// 复用JWT密钥（与登录接口保持一致）
const JWT_SECRET = new TextEncoder().encode(process.env.JWT_SECRET);

export default defineEventHandler(
  async (event): Promise<Res<AuthRes[] | null>> => {
    try {
      // 1. 从请求头获取token（前端需在Authorization中携带Bearer Token）
      const authHeader = getHeader(event, `authorization`);
      if (!authHeader || !authHeader.startsWith(`Bearer `)) {
        throw createError({
          statusCode: 400,
          statusMessage: `退出失败:未携带有效Token`,
        });
      }
      const token = authHeader.split(` `)[1];
      // 2. 验证并解析Token（确保是合法生成的Token）
      const { payload } = await jwtVerify(token, JWT_SECRET);
      // 解析payload中的用户ID和用户名（与登录时的payload对应）
      const userId = payload.sub;
      const username = payload.username as string;
      if (!userId || !username) {
        throw createError({
          statusCode: 401,
          statusMessage: `退出失败:Token解析失败，用户信息无效`,
        });
      }
      // 3. 可选:验证用户是否存在（防止Token解析后用户已被删除）
      const userCheckSql = `
        SELECT id FROM auth 
        WHERE id = ? AND username = ? AND deleted_time IS NULL
      `;
      const userResult: Auth[] = await query(userCheckSql, [userId, username]);
      if (userResult.length !== 1) {
        throw createError({
          statusCode: 401,
          statusMessage: `退出失败:用户不存在或已被删除`,
        });
      }
      // 4. 可选:记录用户退出日志（示例:更新用户最后退出时间，根据业务需求选择是否实现）
      // const updateLogoutSql = `
      //   UPDATE auth
      //   SET last_logout_time = NOW()
      //   WHERE id = ?
      // `;
      // await query(updateLogoutSql, [userId]);
      // 5. 返回标准化成功响应（JWT无状态，服务端无需销毁Token，前端自行清除即可）
      return {
        code: 200,
        data: {
          list: null, // 退出接口无业务数据，list置空
          pagination: {
            page: 1,
            pageSize: 0,
            total: 0,
            totalPages: 0,
          },
        },
        message: `${username} 退出成功`,
        success: true,
        timestamp: new Date().toISOString(),
      };
    } catch (error: any) {
      // 统一错误响应（与登录接口格式严格对齐）
      const statusCode =
        error.statusCode || (error.name === `JWTExpired` ? 401 : 500);
      const errorMsg =
        error.statusMessage ||
        (error.name === `JWTExpired`
          ? `退出失败:Token已过期`
          : `退出失败:${error.message || `服务器内部错误`}`);
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
        message: errorMsg,
        success: false,
        timestamp: new Date().toISOString(),
      };
    }
  },
);
