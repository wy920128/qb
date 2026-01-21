/*
 * @Author: 王野 18545455617@163.com
 * @Date: 2026-01-15 16:11:25
 * @LastEditors: 王野 18545455617@163.com
 * @LastEditTime: 2026-01-21 10:02:29
 * @FilePath: /qb/middleware/auth.global.ts
 * @Description: 基于 Cookie 的全局路由守卫，用于检查用户登录状态
 */

export default defineNuxtRouteMiddleware((to, from) => {
  try {
    // 1. 使用 useCookie 安全获取认证令牌（SSR兼容）
    const token = useCookie(`auth-token`);
    const userInfo = useCookie(`user-info`);
    // 2. 白名单配置：不需要认证的路径
    const whiteListPaths = [`/login`, `/register`, `/auth/login`];
    const isInWhiteList = whiteListPaths.includes(to.path);
    // 3. 计算认证状态
    const isAuthenticated = !!token.value && !!userInfo.value;
    console.log(`token.value:`, token.value);
    console.log(`userInfo.value:`, userInfo.value);
    console.log(
      `Auth Middleware - Token:`,
      !!token.value,
      `Path:`,
      to.path,
      `Authenticated:`,
      isAuthenticated,
    );
    // 4. 提前返回：不需要认证的页面
    if (!to.meta.requiresAuth && !isInWhiteList) {
      return;
    }
    // 5. 主逻辑判断
    // 案例A: 用户未登录且试图访问需要认证的页面
    if (!isAuthenticated && !isInWhiteList) {
      // 防止重定向循环：确保不在目标页面
      if (to.path !== `/login`) {
        return navigateTo({
          path: `/login`,
          query: { redirect: to.fullPath },
        });
      }
      return;
    }
    // 案例B: 用户已登录却试图访问登录/注册页
    if (isAuthenticated && isInWhiteList) {
      // 避免当前已经在首页还重定向
      if (to.path !== `/`) {
        return navigateTo(`/`);
      }
      return;
    }
    // 6. 可选：基于角色的细粒度权限控制
    // if (isAuthenticated && to.meta.requiresAuth) {
    //   try {
    //     const userData = JSON.parse(userInfo.value || `{}`)
    //     const userRole = userData.role
    //     const requiredRoles = to.meta.requiredRole as string[]
    //
    //     if (requiredRoles && requiredRoles.length > 0 && !requiredRoles.includes(userRole)) {
    //       throw createError({
    //         statusCode: 403,
    //         statusMessage: `Forbidden: Insufficient permissions`,
    //       })
    //     }
    //   } catch (error) {
    //     console.error(`Role validation error:`, error)
    //     // 清除无效的用户信息
    //     userInfo.value = null
    //     return navigateTo(`/login`)
    //   }
    // }
  } catch (error) {
    console.error(`Auth middleware error:`, error);
    // 生产环境下可以考虑更友好的错误处理
    if (process.server) {
      console.error(`Server-side auth middleware error:`, error);
    }
    return abortNavigation(`Authentication check failed`);
  }
});
