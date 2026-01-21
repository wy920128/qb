/*
 * @Author: 王野 18545455617@163.com
 * @Date: 2026-01-15 16:11:25
 * @LastEditors: 王野 18545455617@163.com
 * @LastEditTime: 2026-01-21 10:24:32
 * @FilePath: /qb/middleware/auth.global.ts
 * @Description: 基于 useAuth Composable 的全局路由守卫
 */

// 路由元数据类型定义
declare module "#app" {
  interface PageMeta {
    requiresAuth?: boolean;
    requiredRoles?: string[];
  }
}

export default defineNuxtRouteMiddleware((to, from) => {
  try {
    // 使用 useAuth Composable 获取认证状态 [1,6](@ref)
    const auth = useAuth();

    // 白名单配置：不需要认证的路径
    const whiteListPaths = ["/login", "/register", "/auth/login"];
    const isInWhiteList = whiteListPaths.includes(to.path);

    // 初始化认证状态（确保状态同步）
    if (process.client) {
      auth.initializeAuth();
    }

    console.log(
      "Auth Middleware - Path:",
      to.path,
      "Authenticated:",
      auth.isAuthenticated.value,
      "WhiteList:",
      isInWhiteList,
    );

    // 提前返回：不需要认证的页面 [6](@ref)
    if (!to.meta.requiresAuth && !isInWhiteList) {
      return;
    }

    // 主逻辑判断
    // 案例A: 用户未登录且试图访问需要认证的页面 → 跳转到登录页
    if (!auth.isAuthenticated.value && !isInWhiteList) {
      // 防止重定向循环：确保不在目标页面
      if (to.path !== "/login") {
        return navigateTo({
          path: "/login",
          query: {
            redirect: to.fullPath,
            reason: "unauthorized",
          },
        });
      }
      return;
    }

    // 案例B: 用户已登录却试图访问登录/注册页 → 跳转到首页 [6](@ref)
    if (auth.isAuthenticated.value && isInWhiteList) {
      // 避免当前已经在首页还重定向
      if (to.path !== "/") {
        return navigateTo("/");
      }
      return;
    }

    // 案例C: 基于角色的细粒度权限控制
    if (
      auth.isAuthenticated.value &&
      to.meta.requiresAuth &&
      to.meta.requiredRoles
    ) {
      const userRoles = auth.getUserRoles.value;
      const requiredRoles = to.meta.requiredRoles;

      // 检查用户是否拥有所需角色
      const hasRequiredRole = requiredRoles.some((role) =>
        userRoles.includes(role),
      );

      if (!hasRequiredRole) {
        console.warn(
          `权限不足: 需要角色 ${requiredRoles.join(", ")}, 用户角色 ${userRoles.join(", ")}`,
        );

        // 权限不足，跳转到无权限页面或首页
        throw createError({
          statusCode: 403,
          statusMessage: "Forbidden: Insufficient permissions",
        });
      }
    }
  } catch (error) {
    console.error("Auth middleware error:", error);

    // 生产环境下更友好的错误处理 [6](@ref)
    if (import.meta.server) {
      console.error("Server-side auth middleware error:", error);
    }

    // 如果是权限错误，跳转到登录页
    // if (error.statusCode === 403) {
    //   return navigateTo({
    //     path: "/login",
    //     query: {
    //       reason: "forbidden",
    //       redirect: to.fullPath,
    //     },
    //   });
    // }

    return abortNavigation("Authentication check failed");
  }
});
