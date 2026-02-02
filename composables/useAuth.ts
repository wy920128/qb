/*
 * @Author: 王野 18545455617@163.com
 * @Date: 2026-01-15 15:12:18
 * @LastEditors: 王野 18545455617@163.com
 * @LastEditTime: 2026-02-02 10:00:00
 * @FilePath: /qb/composables/useAuth.ts
 * @Description: 认证 Composable 主模块
 */
import type { Auth, AuthLoginPO, AuthRes, AuthState, Res } from "~/types";
import { ElMessage, ElMessageBox } from "element-plus"; // 确保导入组件

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
      secure:
        process.env.NODE_ENV === `production` &&
        window.location.protocol === "https:", // 优化：仅在HTTPS生产环境启用secure
      watch: true,
    },
  );

  const isAuthenticated = computed(() => {
    const state: AuthState = authState.value;
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
    if (!authCookie.value) return; // 增加容错
    const cookieData = authCookie.value;
    if (cookieData.token) {
      authState.value.token = cookieData.token;
      authState.value.user = cookieData.user;
      authState.value.expiresAt = cookieData.expiresAt;
      // 仅当Token未过期时，才标记为已认证
      authState.value.isAuthenticated = !isTokenExpired();
    }
  };

  // 暴露setAuthState（关键：服务端需要调用，确保同步Cookie）
  const setAuthState = (
    userData: Omit<Auth, `password`>,
    token: string,
    expiresIn: string | number, // 扩展支持数字（毫秒）
  ): void => {
    let expiresInMs = 60 * 60 * 1000; // 默认1小时
    if (typeof expiresIn === "number") {
      expiresInMs = expiresIn;
    } else {
      expiresInMs =
        expiresIn === `7d` ? 7 * 24 * 60 * 60 * 1000 : 60 * 60 * 1000;
    }

    authState.value = {
      token,
      user: userData,
      expiresAt: Date.now() + expiresInMs,
      isAuthenticated: true,
    };
    syncStateToCookie(); // 同步到Cookie，确保刷新后可恢复
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
      await ElMessageBox.confirm(`确定要退出登录吗?`, `提示`, {
        confirmButtonText: `确定`,
        cancelButtonText: `取消`,
        type: `warning`,
        customClass: `logout-confirm-dialog`,
      });
      if (authState.value.token) {
        await $fetch(`/api/auth/logout`, {
          method: `POST`,
          headers: { Authorization: `Bearer ${authState.value.token}` },
        });
      }
      clearAuth();
      ElMessage.success(`退出登录成功`);
      if (import.meta.client) {
        await navigateTo(`/login`);
      }
    } catch (error) {
      if (error === `cancel`) return;
      ElMessage.error(`退出登录失败，请重试`);
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
        setAuthState(userData, tokenToValidate, 2 * 60 * 60 * 1000); // 2小时，明确毫秒数
        return true;
      } else {
        clearAuth();
        return false;
      }
    } catch (error) {
      ElMessage.error(`Token 验证失败，请重新登录`);
      clearAuth();
      return false;
    }
  };

  const initializeAuth = async (): Promise<void> => {
    if (import.meta.server) {
      const headers = useRequestHeaders([`cookie`]);
      try {
        const serverAuth = await $fetch<Res<AuthRes[]>>(`/api/auth/validate`, {
          headers, // 直接传递headers，无需解构cookie
        });
        if (
          serverAuth.code === 200 &&
          serverAuth.success &&
          serverAuth.data.list[0]
        ) {
          const userData = serverAuth.data.list[0];
          // 调用暴露的setAuthState，确保同步到Cookie（关键修复）
          setAuthState(userData, userData.token, 2 * 60 * 60 * 1000);
        }
      } catch (error) {
        clearAuth();
      }
    } else {
      // 客户端优先从Cookie恢复状态（关键：刷新后第一步恢复）
      syncStateFromCookie();
      // 仅当Token存在且未过期时，才验证Token，避免不必要的请求
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
          2 * 60 * 60 * 1000,
        );
      }
    } catch (error) {
      ElMessage.error(`更新用户信息失败: ${error}`);
      throw error;
    }
  };

  const hasRole = (role: string): boolean => {
    return authState.value.user?.role.includes(role) || false;
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
    hasRole,
    initializeAuth,
    clearAuth,
    setAuthState, // 暴露setAuthState，供服务端使用
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
