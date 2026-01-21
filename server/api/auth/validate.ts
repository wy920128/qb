/*
 * @Author: 王野 18545455617@163.com
 * @Date: 2026-01-06 08:38:45
 * @LastEditors: 王野 18545455617@163.com
 * @LastEditTime: 2026-01-21 09:19:15
 * @FilePath: /vip/server/api/auth/validate.ts
 * @Description: Token验证接口
 */
import { jwtVerify } from "jose";
import type { AuthVO, Res, Time } from "~/types/index";
import type { Auth } from "~/types";
import { query } from "~/server/utils/query";

// JWT密钥（与登录接口保持一致）
const JWT_SECRET = new TextEncoder().encode(process.env.JWT_SECRET);

export default defineEventHandler(
  async (event): Promise<Res<AuthVO | null>> => {
    try {
      // 1. 从Authorization头中获取token
      const authHeader = getHeader(event, `Authorization`);
      if (!authHeader || !authHeader.startsWith(`Bearer `)) {
        throw createError({
          statusCode: 401,
          statusMessage: `缺少有效的Authorization头`,
        });
      }
      const token = authHeader.substring(7); // 移除"Bearer "前缀
      if (!token || token === ``) {
        throw createError({
          statusCode: 401,
          statusMessage: `Token不能为空`,
        });
      }
      // 2. 验证JWT token
      let decoded;
      try {
        decoded = await jwtVerify(token, JWT_SECRET);
      } catch (jwtError: any) {
        throw createError({
          statusCode: 401,
          statusMessage: `Token验证失败: ${jwtError.message}`,
        });
      }
      // 3. 从token中提取用户信息
      const payload = decoded.payload;
      const userId = parseInt(payload.sub || `0`);
      const username = payload.username as string;
      if (!userId || !username) {
        throw createError({
          statusCode: 401,
          statusMessage: `Token中缺少必要的用户信息`,
        });
      }
      // 4. 查询数据库验证用户状态
      const userSelectSql = `
        SELECT *
        FROM auth 
        WHERE id = ? AND username = ? AND deleted_time IS NULL
      `;
      const userResult: (Auth & Time)[] = await query(userSelectSql, [
        userId,
        username,
      ]);
      if (userResult.length !== 1) {
        throw createError({
          statusCode: 401,
          statusMessage: `用户不存在或已被删除`,
        });
      }
      const { password, ...userInfo } = userResult[0];
      return {
        code: 200,
        data: {
          list: userInfo,
          pagination: {
            page: 1,
            pageSize: 1,
            total: 1,
            totalPages: 1,
          },
        },
        message: `Token验证成功`,
        success: true,
        timestamp: new Date().toISOString(),
      };
    } catch (error: any) {
      // 统一错误响应
      const statusCode = error.statusCode || 500;
      const errorMessage =
        error.statusMessage || error.message || `服务器内部错误`;
      // 如果是验证失败，返回具体的验证结果
      if (statusCode === 401) {
        return {
          code: 401,
          data: {
            list: null,
            pagination: {
              page: 1,
              pageSize: 0,
              total: 0,
              totalPages: 0,
            },
          },
          message: errorMessage,
          success: false,
          timestamp: new Date().toISOString(),
        };
      }
      // 其他错误
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
        message: `Token验证失败: ${errorMessage}`,
        success: false,
        timestamp: new Date().toISOString(),
      };
    }
  },
);
