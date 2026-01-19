import { useState } from "nuxt/app";
import type { AuthVO } from "~/types";
import { useUserCookieStorage } from "./useCookieStorage";

// 封装用户状态管理（useState + Cookie 持久化）
export const useUserState = () => {
  // 1. 内存响应式状态（Nuxt 内置 useState，SSR 安全）
  const userState = useState<
    Omit<
      AuthVO & { token: string; expiresAt: number },
      `password` | `created_time` | `updated_time` | `deleted_time`
    >
  >(`user`, () => ({
    token: ``,
    id: 0,
    username: ``,
    role: [],
    expiresAt: 0,
  }));

  // 2. Cookie 持久化（内置 useCookie，SSR 安全）
  const { setCookie, getCookie, clearCookie } = useUserCookieStorage(7); // 7天过期

  // ========== 初始化：从 Cookie 恢复状态 ==========
  const initState = () => {
    const cookieData = getCookie();
    if (cookieData.token) {
      userState.value = {
        ...userState.value,
        token: cookieData.token,
        id: cookieData.user?.id || 0,
        username: cookieData.user?.username || ``,
        role: cookieData.user?.role || [],
        expiresAt: cookieData.expiresAt,
      };
    }
  };

  // 客户端/服务端均执行初始化（useCookie 自动适配）
  initState();

  // ========== 核心方法（对齐原 Pinia 逻辑） ==========
  /**
   * 设置用户信息
   */
  const setUser = (userInfo: AuthVO) => {
    userState.value = { ...userState.value, ...userInfo };
    // 同步到 Cookie
    setCookie({ user: userInfo });
  };

  /**
   * 设置 Token 并指定过期时间
   * @param newToken JWT Token
   * @param expires 过期时间（秒），默认7天
   */
  const setToken = (newToken: string, expires = 60 * 60 * 24 * 7) => {
    const expiresAt = Date.now() + expires * 1000;
    userState.value.token = newToken;
    userState.value.expiresAt = expiresAt;
    // 同步到 Cookie
    setCookie({ token: newToken, expiresAt });
  };

  /**
   * 退出登录：清空状态 + Cookie
   */
  const logout = () => {
    // 清空内存状态
    userState.value = {
      token: ``,
      id: 0,
      username: ``,
      role: [],
      expiresAt: 0,
    };
    // 清空 Cookie
    clearCookie();
    // 清空记住的用户名（客户端操作）
    if (import.meta.client) {
      document.cookie = `rememberedusername=; max-age=-1; path=/`;
    }
  };

  /**
   * 检查 Token 是否过期
   */
  const isTokenExpired = (): boolean => {
    if (!userState.value.token) return true;
    return Date.now() > userState.value.expiresAt;
  };

  /**
   * 获取有效用户信息
   */
  const getUserInfo = (): AuthVO | null => {
    if (isTokenExpired()) {
      logout();
      return null;
    }
    const { token, expiresAt, ...userInfo } = userState.value;
    return userInfo as AuthVO;
  };

  /**
   * 获取用户角色
   */
  const getUserRoles = (): string[] => {
    const info = getUserInfo();
    return info?.role || [];
  };

  /**
   * 记住用户名（单独存 Cookie）
   */
  const rememberUsername = (username: string) => {
    if (import.meta.client) {
      document.cookie = `rememberedusername=${username}; max-age=${
        60 * 60 * 24 * 30
      }; path=/`; // 30天过期
    }
  };

  /**
   * 获取记住的用户名
   */
  const getRememberedUsername = (): string => {
    if (import.meta.client) {
      const match = document.cookie.match(/rememberedusername=([^;]+)/);
      return match?.[1] ? decodeURIComponent(match[1]) : ``;
    }
    return ``;
  };

  return {
    // 响应式状态
    userState,
    // 核心方法
    setUser,
    setToken,
    logout,
    isTokenExpired,
    getUserInfo,
    getUserRoles,
    // 记住用户名
    rememberUsername,
    getRememberedUsername,
    // 快捷访问
    token: () => userState.value.token,
    user: () => getUserInfo(),
  };
};
