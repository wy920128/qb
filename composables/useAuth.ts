/*
 * @Author: 王野 18545455617@163.com
 * @Date: 2026-01-15 15:12:18
 * @LastEditors: 王野 18545455617@163.com
 * @LastEditTime: 2026-01-21 10:19:46
 * @FilePath: /qb/composables/useAuth.ts
 * @Description: 认证 Composable 主模块 - 优化修复版
 */
import type { Auth, AuthLoginPO, AuthRes, AuthState, Res } from "~/types";

/**
 * 主认证 Composable
 */
export const useAuth = () => {
  // ==================== 状态定义 ====================
  // 使用 useState 确保 SSR 兼容性 [6](@ref)
  const authState = useState<AuthState>("auth-state", () => ({
    token: "",
    user: null,
    expiresAt: 0,
    isAuthenticated: false,
  }));

  // 加载状态
  const isLoading = useState<boolean>("auth-loading", () => false);
  const error = useState<string>("auth-error", () => "");

  // ==================== Cookie 持久化 ====================
  // 统一的认证 Cookie（7天过期）[6,7](@ref)
  const authCookie = useCookie<Omit<AuthState, "isAuthenticated">>(
    "auth-data",
    {
      default: () => ({
        token: "",
        user: null,
        expiresAt: 0,
      }),
      maxAge: 60 * 60 * 24 * 7, // 7天
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      watch: true, // 启用响应式监听
    },
  );

  // ==================== 计算属性 ====================
  const isAuthenticated = computed(() => {
    const state = authState.value;
    return state.isAuthenticated && !!state.token && !isTokenExpired();
  });

  const getUser = computed(() => authState.value.user);
  const getToken = computed(() => authState.value.token);
  const getUserRoles = computed(() => authState.value.user?.role || []);

  // ==================== 核心方法 ====================
  /**
   * 检查 Token 是否过期
   */
  const isTokenExpired = (): boolean => {
    const expiresAt = authState.value.expiresAt;
    return !expiresAt || Date.now() >= expiresAt;
  };

  /**
   * 同步状态到 Cookie
   */
  const syncStateToCookie = (): void => {
    authCookie.value = {
      token: authState.value.token || "",
      user: authState.value.user,
      expiresAt: authState.value.expiresAt,
    };
  };

  /**
   * 从 Cookie 同步状态到 State
   */
  const syncStateFromCookie = (): void => {
    if (authCookie.value.token) {
      authState.value.token = authCookie.value.token;
      authState.value.user = authCookie.value.user;
      authState.value.expiresAt = authCookie.value.expiresAt;

      // 验证状态是否有效
      if (authCookie.value.token && !isTokenExpired()) {
        authState.value.isAuthenticated = true;
      }
    }
  };

  /**
   * 设置认证状态
   */
  const setAuthState = (
    userData: Omit<Auth, "password">,
    token: string,
    expiresIn: string,
  ): void => {
    // 计算过期时间（处理 '1h' 和 '7d' 格式）
    const expiresInMs =
      expiresIn === "7d" ? 7 * 24 * 60 * 60 * 1000 : 60 * 60 * 1000; // 默认1小时

    authState.value = {
      token,
      user: userData,
      expiresAt: Date.now() + expiresInMs,
      isAuthenticated: true,
    };

    syncStateToCookie();
  };

  /**
   * 清除认证状态
   */
  const clearAuth = (): void => {
    authState.value = {
      token: "",
      user: null,
      expiresAt: 0,
      isAuthenticated: false,
    };

    // 清除 Cookie
    authCookie.value = {
      token: "",
      user: null,
      expiresAt: 0,
    };

    // 清除本地存储的记住用户名
    if (process.client) {
      localStorage.removeItem("rememberedUsername");
    }
  };

  /**
   * 用户登录 - 修复类型匹配问题
   */
  const login = async (loginData: AuthLoginPO): Promise<boolean> => {
    isLoading.value = true;
    error.value = "";

    try {
      const response = await $fetch<Res<AuthRes>>("/api/auth/login", {
        method: "POST",
        body: loginData,
      });

      // 修复：根据您的 API 响应结构，AuthRes 是单个对象，不是数组
      if (response.code === 200 && response.success && response.data.list) {
        const userData = response.data.list;

        if (!userData.token) {
          throw new Error("登录响应缺少 token");
        }

        // 设置认证状态 - 修复类型匹配
        setAuthState(userData, userData.token, loginData.expiresIn);

        // 处理记住用户名
        if (loginData.expiresIn === "7d") {
          localStorage.setItem("rememberedUsername", loginData.username);
        }

        console.log("登录成功:", userData.username);
        return true;
      } else {
        throw new Error(response.message || "登录失败");
      }
    } catch (error: any) {
      console.error("登录错误:", error);

      // 增强错误处理
      if (error.data?.message) {
        error.value = error.data.message;
      } else if (error.message) {
        error.value = error.message;
      } else {
        error.value = "登录失败，请检查网络连接";
      }

      clearAuth();
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
        await $fetch("/api/auth/logout", {
          method: "POST",
          headers: {
            Authorization: `Bearer ${authState.value.token}`,
          },
        });
      }
    } catch (error) {
      console.error("退出登录 API 错误:", error);
    } finally {
      clearAuth();

      // 跳转到登录页
      if (process.client) {
        await navigateTo("/login");
      }
    }
  };

  /**
   * 验证 Token 有效性 - 修复类型匹配
   */
  const validateToken = async (token?: string): Promise<boolean> => {
    const tokenToValidate = token || authState.value.token;

    if (!tokenToValidate || isTokenExpired()) {
      clearAuth();
      return false;
    }

    try {
      const response = await $fetch<Res<AuthRes>>("/api/auth/validate", {
        headers: { Authorization: `Bearer ${tokenToValidate}` },
      });

      // 修复：根据您的 API 响应结构调整
      if (response.code === 200 && response.success && response.data.list) {
        const userData = response.data.list;

        // 更新状态
        setAuthState(userData, tokenToValidate, "1h"); // 验证后默认1小时

        return true;
      } else {
        clearAuth();
        return false;
      }
    } catch (error) {
      console.error("Token 验证失败:", error);
      clearAuth();
      return false;
    }
  };

  /**
   * 初始化认证状态（页面加载时调用）
   */
  const initializeAuth = async (): Promise<void> => {
    if (process.client) {
      // 从 Cookie 恢复状态
      syncStateFromCookie();

      // 如果状态有效，验证 token
      if (authState.value.token && !isTokenExpired()) {
        await validateToken(authState.value.token);
      } else {
        clearAuth();
      }
    }
  };

  /**
   * 刷新 Token
   */
  const refreshToken = async (
    newToken: string,
    expiresIn?: number,
  ): Promise<void> => {
    if (!authState.value.user) {
      throw new Error("用户未登录");
    }

    authState.value.token = newToken;
    authState.value.expiresAt = expiresIn
      ? Date.now() + expiresIn * 1000
      : Date.now() + 60 * 60 * 1000; // 默认1小时

    syncStateToCookie();
  };

  /**
   * 更新用户信息
   */
  const updateUser = async (
    userData: Partial<Omit<Auth, "password">>,
  ): Promise<void> => {
    if (!authState.value.user) {
      throw new Error("用户未登录");
    }

    try {
      const response = await $fetch<Res<AuthRes>>("/api/auth/profile", {
        method: "PATCH",
        body: userData,
        headers: {
          Authorization: `Bearer ${authState.value.token}`,
        },
      });

      if (response.code === 200 && response.success && response.data.list) {
        const updatedUser = response.data.list;

        // 更新状态，保留 token
        setAuthState(
          { ...authState.value.user, ...updatedUser },
          authState.value.token || "",
          "1h", // 更新后默认1小时
        );
      }
    } catch (error) {
      console.error("更新用户信息失败:", error);
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
      localStorage.setItem("rememberedUsername", username);
    }
  };

  /**
   * 获取记住的用户名
   */
  const getRememberedUsername = (): string => {
    if (process.client) {
      return localStorage.getItem("rememberedUsername") || "";
    }
    return "";
  };

  // ==================== 返回接口 ====================
  return {
    // 状态
    state: readonly(authState),
    isLoading: readonly(isLoading),
    error: readonly(error),

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
    clearAuth,
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
