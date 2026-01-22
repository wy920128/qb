/*
 * @Author: 王野 18545455617@163.com
 * @Date: 2026-01-15 15:12:18
 * @LastEditors: 王野 18545455617@163.com
 * @LastEditTime: 2026-01-22 12:49:07
 * @FilePath: /qb/composables/useAuth.ts
 * @Description: 认证 Composable 主模块
 */
import type { Auth, AuthLoginPO, AuthRes, AuthState, Res } from "~/types";

export const useAuth = () => {
  const authState = useState<AuthState>(`auth-state`, () => ({
    token: undefined,
    user: null,
    expiresAt: 0,
    isAuthenticated: false,
  }));
  const isLoading = useState<boolean>(`auth-loading`, () => false);
  const error = useState<string>(`auth-error`, () => ``);
  const authCookie = useCookie<Omit<AuthState, `isAuthenticated`>>(
    `auth-data`,
    {
      default: () => ({
        token: undefined,
        user: null,
        expiresAt: 0,
      }),
      maxAge: 60 * 60 * 24 * 7,
      sameSite: `lax`,
      secure: process.env.NODE_ENV === `production`,
      watch: true,
    },
  );
  const isAuthenticated = computed(() => {
    const state = authState.value;
    return state.isAuthenticated && !!state.token && !isTokenExpired();
  });
  const getUser = computed(() => authState.value.user);
  const getToken = computed(() => authState.value.token);
  const getUserRoles = computed(() => authState.value.user?.role || []);
  const isTokenExpired = (): boolean => {
    const expiresAt = authState.value.expiresAt;
    return !expiresAt || Date.now() >= expiresAt;
  };
  const syncStateToCookie = (): void => {
    authCookie.value = {
      token: authState.value.token || ``,
      user: authState.value.user,
      expiresAt: authState.value.expiresAt,
    };
  };
  const syncStateFromCookie = (): void => {
    if (authCookie.value.token) {
      authState.value.token = authCookie.value.token;
      authState.value.user = authCookie.value.user;
      authState.value.expiresAt = authCookie.value.expiresAt;
      if (authCookie.value.token && !isTokenExpired()) {
        authState.value.isAuthenticated = true;
      }
    }
  };
  const setAuthState = (
    userData: Omit<Auth, `password`>,
    token: string,
    expiresIn: string,
  ): void => {
    const expiresInMs =
      expiresIn === `7d` ? 7 * 24 * 60 * 60 * 1000 : 60 * 60 * 1000;
    authState.value = {
      token,
      user: userData,
      expiresAt: Date.now() + expiresInMs,
      isAuthenticated: true,
    };
    syncStateToCookie();
  };
  const clearAuth = (): void => {
    authState.value = {
      token: ``,
      user: null,
      expiresAt: 0,
      isAuthenticated: false,
    };
    authCookie.value = {
      token: ``,
      user: null,
      expiresAt: 0,
    };
  };
  const login = async (loginData: AuthLoginPO): Promise<boolean> => {
    isLoading.value = true;
    error.value = ``;
    try {
      const response = await $fetch<Res<AuthRes[]>>(`/api/auth/login`, {
        method: `POST`,
        body: loginData,
      });
      if (response.code === 200 && response.success && response.data.list[0]) {
        const userData = response.data.list[0];
        setAuthState(userData, userData.token, loginData.expiresIn);
        ElMessage.success(`登录成功! ${userData.username}`);
        return true;
      } else {
        throw new Error(response.message || `登录失败`);
      }
    } catch (error: any) {
      ElMessage.error(`登录错误: ${error.message}`);
      clearAuth();
      return false;
    } finally {
      isLoading.value = false;
    }
  };
  const logout = async (): Promise<void> => {
    try {
      if (authState.value.token) {
        await $fetch(`/api/auth/logout`, {
          method: `POST`,
          headers: {
            Authorization: `Bearer ${authState.value.token}`,
          },
        });
      }
    } catch (error) {
      ElMessage.error(`退出登录 API 错误: ${error}`);
    } finally {
      clearAuth();
      if (import.meta.client) {
        await navigateTo(`/login`);
      }
    }
  };
  const validateToken = async (token?: string): Promise<boolean> => {
    const tokenToValidate = token || authState.value.token;
    if (!tokenToValidate || isTokenExpired()) {
      clearAuth();
      return false;
    }
    try {
      const response = await $fetch<Res<AuthRes[]>>(`/api/auth/validate`, {
        headers: { Authorization: `Bearer ${tokenToValidate}` },
      });
      if (response.code === 200 && response.success && response.data.list[0]) {
        const userData = response.data.list[0];
        setAuthState(userData, tokenToValidate, `1h`);
        return true;
      } else {
        clearAuth();
        return false;
      }
    } catch (error) {
      ElMessage.error(`Token 验证失败: ${error}`);
      clearAuth();
      return false;
    }
  };
  const initializeAuth = async (): Promise<void> => {
    if (import.meta.client) {
      syncStateFromCookie();
      if (authState.value.token && !isTokenExpired()) {
        await validateToken(authState.value.token);
      } else {
        clearAuth();
      }
    }
  };
  const refreshToken = async (
    newToken: string,
    expiresIn?: number,
  ): Promise<void> => {
    if (!authState.value.user) {
      throw new Error(`用户未登录`);
    }
    authState.value.token = newToken;
    authState.value.expiresAt = expiresIn
      ? Date.now() + expiresIn * 1000
      : Date.now() + 60 * 60 * 1000;
    syncStateToCookie();
  };
  const updateUser = async (
    userData: Partial<Omit<Auth, `password`>>,
  ): Promise<void> => {
    if (!authState.value.user) {
      throw new Error(`用户未登录`);
    }
    try {
      const response = await $fetch<Res<AuthRes[]>>(`/api/auth/profile`, {
        method: `PATCH`,
        body: userData,
        headers: {
          Authorization: `Bearer ${authState.value.token}`,
        },
      });
      if (response.code === 200 && response.success && response.data.list[0]) {
        const updatedUser = response.data.list[0];
        setAuthState(
          { ...authState.value.user, ...updatedUser },
          authState.value.token || ``,
          `1h`,
        );
      }
    } catch (error) {
      ElMessage.error(`更新用户信息失败: ${error}`);
      throw error;
    }
  };
  const hasPermission = (permission: string): boolean => {
    return authState.value.user?.role.includes(permission) || false;
  };
  return {
    state: readonly(authState),
    isLoading: readonly(isLoading),
    error: readonly(error),
    isAuthenticated,
    getUser,
    getToken,
    getUserRoles,
    login,
    logout,
    validateToken,
    refreshToken,
    updateUser,
    hasPermission,
    initializeAuth,
    clearAuth,
  };
};
export const useAuthCheck = () => {
  const { isAuthenticated, initializeAuth } = useAuth();
  const requireAuth = async (): Promise<boolean> => {
    await initializeAuth();
    return isAuthenticated.value;
  };
  return {
    requireAuth,
  };
};
