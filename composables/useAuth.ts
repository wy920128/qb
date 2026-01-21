/*
 * @Author: 王野 18545455617@163.com
 * @Date: 2026-01-15 15:12:18
 * @LastEditors: 王野 18545455617@163.com
 * @LastEditTime: 2026-01-21 10:07:25
 * @FilePath: /qb/composables/useAuth.ts
 * @Description: 认证 Composable 主模块
 */
import type { Auth, AuthLoginPO, AuthRes, AuthState, Res } from "~/types";
/**
 * 主认证 Composable
 */
export const useAuth = () => {
  // ==================== 状态定义 ====================
  // 使用 useState 确保 SSR 兼容性 [6](@ref)
  const authState = useState<AuthState>(`auth-state`, () => ({
    token: ``,
    user: null,
    expiresAt: 0,
    isAuthenticated: false,
  }));
  // 加载状态
  const isLoading = useState<boolean>(`auth-loading`, () => false);
  // ==================== Cookie 持久化 ====================
  // 认证 Cookie（7天过期）[8](@ref)
  const authCookie = useCookie<Omit<AuthState, `isAuthenticated`>>(
    `auth-data`,
    {
      default: () => ({
        token: ``,
        user: null,
        expiresAt: 0,
      }),
      maxAge: 60 * 60 * 24 * 7, // 7天
      sameSite: `lax`,
      secure: process.env.NODE_ENV === `production`,
    },
  );
  // ==================== 计算属性 ====================
  const isAuthenticated = computed(
    () => authState.value.isAuthenticated && !isTokenExpired(),
  );
  const getUser = computed(() => authState.value.user);
  const getToken = computed(() => authState.value.token);
  const getUserRoles = computed(() => authState.value.user?.role || []);
  // ==================== 核心方法 ====================
  /**
   * 初始化认证状态（从 Cookie 恢复）[1](@ref)
   */
  const initializeAuth = (): void => {
    if (import.meta.client) {
      // 客户端：从 Cookie 恢复状态
      syncStateFromCookie();
      // 验证 token 有效性
      if (authState.value.token && !isTokenExpired()) {
        authState.value.isAuthenticated = true;
      } else {
        clearAuth();
      }
    }
  };
  /**
   * 同步状态到 Cookie
   */
  const syncStateToCookie = (): void => {
    authCookie.value = {
      token: authState.value.token,
      user: authState.value.user,
      expiresAt: authState.value.expiresAt,
    };
  };
  /**
   * 从 Cookie 同步状态
   */
  const syncStateFromCookie = (): void => {
    if (authCookie.value.token) {
      authState.value.token = authCookie.value.token;
      authState.value.user = authCookie.value.user;
      authState.value.expiresAt = authCookie.value.expiresAt;
    }
  };
  /**
   * 检查 Token 是否过期
   */
  const isTokenExpired = (): boolean => {
    if (!authState.value.token || !authState.value.expiresAt) {
      return true;
    }
    return Date.now() >= authState.value.expiresAt;
  };
  /**
   * 用户登录 [5](@ref)
   */
  const login = async (loginData: AuthLoginPO): Promise<boolean> => {
    isLoading.value = true;
    try {
      const response = await $fetch<Res<AuthRes>>(`/api/auth/login`, {
        method: `POST`,
        body: loginData,
      });
      if (response.code === 200 && response.success && response.data.list) {
        const userData = response.data.list;
        const token = userData.token || ``;
        const expiresIn = loginData.expiresIn
          ? parseInt(loginData.expiresIn) * 1000
          : 7 * 24 * 60 * 60 * 1000;
        // 更新状态
        authState.value = {
          token,
          user: userData,
          expiresAt: Date.now() + expiresIn,
          isAuthenticated: true,
        };
        // 同步到 Cookie
        syncStateToCookie();
        console.log(`登录成功:`, userData.username);
        return true;
      } else {
        throw new Error(response.message || `登录失败`);
      }
    } catch (error: any) {
      console.error(`登录错误:`, error);
      clearAuth();
      // 提供更详细的错误信息
      if (error.data) {
        console.error(`服务器错误详情:`, error.data);
      }
      return false;
    } finally {
      isLoading.value = false;
    }
  };
  /**
   * 用户退出登录
   */
  const logout = async (): Promise<void> => {
    try {
      // 调用退出 API（如果后端需要）
      if (authState.value.token) {
        await $fetch(`/api/auth/logout`, {
          method: `POST`,
          headers: {
            Authorization: `Bearer ${authState.value.token}`,
          },
        });
      }
    } catch (error) {
      console.error(`退出登录 API 错误:`, error);
    } finally {
      clearAuth();

      // 跳转到登录页
      if (process.client) {
        await navigateTo(`/login`);
      }
    }
  };

  /**
   * 清除认证状态
   */
  const clearAuth = (): void => {
    authState.value = {
      token: ``,
      user: null,
      expiresAt: 0,
      isAuthenticated: false,
    };

    // 清除 Cookie
    authCookie.value = {
      token: ``,
      user: null,
      expiresAt: 0,
    };

    // 清除本地存储的记住用户名
    if (process.client) {
      localStorage.removeItem(`rememberedUsername`);
    }
  };

  /**
   * 验证 Token 有效性 [3](@ref)
   */
  const validateToken = async (token?: string): Promise<boolean> => {
    const validateToken = token || authState.value.token;

    if (!validateToken || isTokenExpired()) {
      clearAuth();
      return false;
    }

    try {
      const response = await $fetch<Res<Auth[]>>(`/api/auth/validate`, {
        headers: { Authorization: `Bearer ${validateToken}` },
      });

      if (response.code === 200 && response.success && response.data.list[0]) {
        const userData = response.data.list[0];

        // 更新状态
        authState.value.user = userData;
        authState.value.isAuthenticated = true;

        // 更新 Cookie
        syncStateToCookie();

        return true;
      } else {
        clearAuth();
        return false;
      }
    } catch (error) {
      console.error(`Token 验证失败:`, error);
      clearAuth();
      return false;
    }
  };

  /**
   * 刷新 Token
   */
  const refreshToken = async (
    newToken: string,
    expiresIn?: number,
  ): Promise<void> => {
    authState.value.token = newToken;
    authState.value.expiresAt = expiresIn
      ? Date.now() + expiresIn * 1000
      : Date.now() + 7 * 24 * 60 * 60 * 1000;

    syncStateToCookie();
  };

  /**
   * 更新用户信息
   */
  const updateUser = async (userData: Partial<Auth>): Promise<void> => {
    if (!authState.value.user) {
      throw new Error(`用户未登录`);
    }

    try {
      const response = await $fetch<Res<Auth[]>>(`/api/auth/profile`, {
        method: `PATCH`,
        body: userData,
        headers: {
          Authorization: `Bearer ${authState.value.token}`,
        },
      });

      if (response.code === 200 && response.success && response.data.list[0]) {
        authState.value.user = {
          ...authState.value.user,
          ...response.data.list[0],
        };
        syncStateToCookie();
      }
    } catch (error) {
      console.error(`更新用户信息失败:`, error);
      throw error;
    }
  };

  /**
   * 检查权限
   */
  const hasPermission = (permission: string): boolean => {
    return authState.value.user?.role.includes(permission) || false;
  };

  /**
   * 记住用户名（本地存储）
   */
  const rememberUsername = (username: string): void => {
    if (process.client) {
      localStorage.setItem(`rememberedUsername`, username);
    }
  };

  /**
   * 获取记住的用户名
   */
  const getRememberedUsername = (): string => {
    if (process.client) {
      return localStorage.getItem(`rememberedUsername`) || ``;
    }
    return ``;
  };

  // ==================== 生命周期 ====================

  // 自动初始化
  if (process.client) {
    initializeAuth();
  }

  // ==================== 返回接口 ====================

  return {
    // 状态
    state: readonly(authState),
    isLoading: readonly(isLoading),

    // 计算属性
    isAuthenticated,
    getUser,
    getToken,
    getUserRoles,

    // 方法
    login,
    logout,
    validateToken,
    refreshToken,
    updateUser,
    hasPermission,
    rememberUsername,
    getRememberedUsername,
    initializeAuth,
  };
};

/**
 * 简化的认证检查函数
 */
export const useAuthCheck = () => {
  const { isAuthenticated, initializeAuth } = useAuth();

  // 提供快捷的认证检查
  const requireAuth = async (): Promise<boolean> => {
    await initializeAuth();
    return isAuthenticated.value;
  };

  return {
    requireAuth,
  };
};
