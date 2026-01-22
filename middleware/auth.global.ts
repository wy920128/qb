/*
 * @Author: 王野 18545455617@163.com
 * @Date: 2026-01-15 16:11:25
 * @LastEditors: 王野 18545455617@163.com
 * @LastEditTime: 2026-01-21 17:09:14
 * @FilePath: /qb/middleware/auth.global.ts
 * @Description: 基于 useAuth Composable 的全局路由守卫
 */

// 路由白名单：无需认证即可访问的页面
const AUTH_WHITE_LIST = ["/login", "/register", "/auth/login"] as const;
// 默认重定向首页
const DEFAULT_REDIRECT_HOME = "/" as const;
// 登录页路径
const LOGIN_PAGE_PATH = "/login" as const;

// 路由元数据类型定义
declare module "#app" {
  interface PageMeta {
    requiresAuth?: boolean; // 是否需要登录认证
    requiredRoles?: string[]; // 需要的角色列表（需配合 requiresAuth: true 使用）
  }
}

const isPathInWhiteList = (path: string): boolean => {
  return AUTH_WHITE_LIST.includes(path as (typeof AUTH_WHITE_LIST)[number]);
};

const hasRequiredRoles = (
  userRoles: string[],
  requiredRoles: string[],
): boolean => {
  if (!requiredRoles.length) return true; // 无角色要求则默认通过
  return requiredRoles.some((role) => userRoles.includes(role));
};

export default defineNuxtRouteMiddleware(async (to, from) => {
  // 仅在客户端初始化认证状态（服务端无 Cookie/本地存储）
  const auth = useAuth();
  let authInitialized = false;

  try {
    // 客户端初始化认证状态（确保从 Cookie 恢复状态），仅执行一次
    if (import.meta.client && !authInitialized) {
      await auth.initializeAuth(); // 原代码未 await，可能导致状态未同步完成
      authInitialized = true;
    }

    // 1. 白名单页面处理：已登录用户访问白名单 → 跳首页；未登录则放行
    if (isPathInWhiteList(to.path)) {
      if (auth.isAuthenticated.value && to.path !== DEFAULT_REDIRECT_HOME) {
        return navigateTo(DEFAULT_REDIRECT_HOME);
      }
      return; // 未登录用户访问白名单，直接放行
    }

    // 2. 非白名单页面：无需认证 → 直接放行
    if (!to.meta.requiresAuth) {
      return;
    }

    // 3. 需要认证的页面：未登录 → 跳登录页（带重定向参数）
    if (!auth.isAuthenticated.value) {
      return navigateTo({
        path: LOGIN_PAGE_PATH,
        query: {
          redirect: to.fullPath,
          reason: "unauthorized",
        },
      });
    }

    // 4. 已登录且需要认证：检查角色权限
    if (to.meta.requiredRoles?.length) {
      const userRoles = auth.getUserRoles.value || [];
      const requiredRoles = to.meta.requiredRoles;

      if (!hasRequiredRoles(userRoles, requiredRoles)) {
        const errorMsg = `权限不足：需要角色 [${requiredRoles.join(", ")}]，当前角色 [${userRoles.join(", ")}]`; 

        // 403 错误处理：客户端跳登录页，服务端抛 403 错误
        if (import.meta.client) {
          return navigateTo({
            path: LOGIN_PAGE_PATH,
            query: {
              redirect: to.fullPath,
              reason: "forbidden",
            },
          });
        } else {
          throw createError({
            statusCode: 403,
            statusMessage: "Forbidden: Insufficient permissions",
            message: errorMsg,
          });
        }
      }
    }
  } catch (error) {
    const errorMsg = `认证中间件异常：${(error as Error).message}`;

    // 不同环境的错误处理
    if (import.meta.server) {
      // 服务端：抛通用 500 错误，避免暴露敏感信息
      throw createError({
        statusCode: 500,
        statusMessage: "Internal Server Error",
        message: "认证检查失败，请稍后重试",
      });
    } else {
      // 客户端：终止导航并提示用户
      abortNavigation(errorMsg);
      // 可选：客户端跳登录页
      // navigateTo(LOGIN_PAGE_PATH);
    }
  }
});
