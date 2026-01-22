/*
 * @Author: 王野 18545455617@163.com
 * @Date: 2026-01-06 08:38:45
 * @LastEditors: 王野 18545455617@163.com
 * @LastEditTime: 2026-01-22 10:14:29
 * @FilePath: /vip/server/api/auth/login.ts
 * @Description: 后台登录接口
 */
import { SignJWT } from "jose";
import bcrypt from "bcryptjs";
import type { AuthRes, Res, Time } from "~/types/index";
import type { Auth, AuthLoginPO } from "~/types";
import { utilsQuery } from "~/server/utils/query";

// JWT密钥（推荐通过Nuxt环境变量配置，.env文件）
const JWT_SECRET = new TextEncoder().encode(process.env.JWT_SECRET);

export default defineEventHandler(
  async (event): Promise<Res<AuthRes[] | null>> => {
    try {
      // 1. 读取并验证请求体
      const body: AuthLoginPO = await readBody<AuthLoginPO>(event);
      const { username, password, expiresIn } = body;
      if (!username || username === ``) {
        throw createError({
          statusCode: 400,
          statusMessage: `用户名不能为空`,
        });
      }
      if (!password || password === ``) {
        throw createError({
          statusCode: 400,
          statusMessage: `密码不能为空`,
        });
      }
      const params: any[] = [];
      const userSelectSql = `
      SELECT * 
      FROM auth 
      WHERE username = ? 
        AND deleted_time IS NULL
    `;
      // 绑定用户名参数
      params.push(username);
      // 执行查询
      const userResult: (Auth & Time)[] = await utilsQuery(userSelectSql, params);
      if (userResult.length !== 1) {
        throw createError({
          statusCode: 401,
          statusMessage: `用户不存在`,
        });
      }
      const user = {
        id: userResult[0].id ? Number(userResult[0].id) : 0,
        username: userResult[0].username,
        password: userResult[0].password,
        role: userResult[0].role,
        created_time: userResult[0].created_time,
        updated_time: userResult[0].updated_time,
        deleted_time: userResult[0].deleted_time,
      };
      const isPwdValid = bcrypt.compareSync(password, user.password);
      if (!isPwdValid) {
        throw createError({
          statusCode: 401,
          statusMessage: `密码错误`,
        });
      }
      const token = await new SignJWT({
        sub: `${user.id}`,
        username: user.username,
        role: user.role,
      })
        .setProtectedHeader({ alg: `HS256` }) // HMAC-SHA256加密算法
        .setExpirationTime(expiresIn) // 过期时间
        .sign(JWT_SECRET);
      return {
        code: 200, // 成功状态码
        data: {
          list: [
            {
              token,
              ...user,
            },
          ],
          pagination: {
            page: 1,
            pageSize: 1,
            total: 1,
            totalPages: 1,
          },
        },
        message: `${user.username} 登录成功`,
        success: true,
        timestamp: new Date().toISOString(), // 可选时间戳
      };
    } catch (error: any) {
      // 统一错误响应（严格对齐Res接口）
      const statusCode = error.statusCode || 500;
      return {
        code: statusCode,
        data: {
          list: null, // 错误时list为空数组
          pagination: {
            page: 1,
            pageSize: 0,
            total: 0,
            totalPages: 0,
          },
        },
        message:
          error.statusMessage ||
          `登录失败：${error.message || `服务器内部错误`}`,
        success: false,
        timestamp: new Date().toISOString(),
      };
    }
  },
);
