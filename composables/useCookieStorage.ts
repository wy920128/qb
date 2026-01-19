/*
 * @Author: 王野 18545455617@163.com
 * @Date: 2026-01-15 15:12:18
 * @LastEditors: 王野 18545455617@163.com
 * @LastEditTime: 2026-01-15 15:21:52
 * @FilePath: /qb/composables/useCookieStorage.ts
 * @Description: 封装用户状态的 Cookie 操作
 */
import { useCookie } from 'nuxt/app';
import type { AuthVO } from '~/types/auth';

// 定义 Cookie 存储的状态结构
export interface UserCookieState {
  token: string;
  user: AuthVO | null;
  expiresAt: number;
}

/**
 * 封装用户状态的 Cookie 操作
 * @param expires 过期时间（天），默认7天
 */
export const useUserCookieStorage = (expires = 7) => {
  // Nuxt 内置 useCookie：自动处理客户端/服务端 Cookie 读写
  const userCookie = useCookie<UserCookieState>(`user`, {
    // Cookie 配置
    maxAge: expires * 24 * 60 * 60, // 过期时间（秒），7天
    path: `/`, // 全站生效
    secure: process.env.NODE_ENV === `production`, // 生产环境仅 HTTPS 传输
    httpOnly: false, // 设为 false，允许前端读取（如需仅服务端读取则设为 true）
    sameSite: `lax`, // 跨域安全
    default: () => ({ token: ``, user: null, expiresAt: 0 }), // 默认值
  });

  // 写入 Cookie
  const setCookie = (data: Partial<UserCookieState>) => {
    userCookie.value = { ...userCookie.value, ...data };
  };

  // 读取 Cookie
  const getCookie = () => userCookie.value;

  // 清空 Cookie
  const clearCookie = () => {
    userCookie.value = { token: ``, user: null, expiresAt: 0 };
  };

  return {
    userCookie,
    setCookie,
    getCookie,
    clearCookie,
  };
};