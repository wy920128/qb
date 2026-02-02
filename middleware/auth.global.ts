/*
 * @Author: 王野 18545455617@163.com
 * @Date: 2026-01-15 16:11:25
 * @LastEditors: 王野 18545455617@163.com
 * @LastEditTime: 2026-01-30 10:34:35
 * @FilePath: /qb/middleware/auth.global.ts
 * @Description: 基于 useAuth Composable 的简化版全局路由守卫
 */
// 路由白名单：无需认证即可访问的页面
const AUTH_WHITE_LIST = [`/login`, `/register`, `/auth/login`];
/**
 * 检查路径是否在白名单中
 */
const isPathInWhiteList = (path: string): boolean => {
  return AUTH_WHITE_LIST.includes(path);
};
/**
 * 创建登录页重定向URL
 */
const createLoginRedirect = (
  toPath: string,
  reason: string = `unauthorized`,
) => {
  return navigateTo({
    path: `/login`,
    query: {
      redirect: toPath,
      reason,
      timestamp: Date.now(), // 避免缓存
    },
  });
};
/**
 * 检查用户是否有访问当前路由所需的角色权限
 */
const hasRequiredRoles = (
  userRoles: string[],
  requiredRoles: string[],
): boolean => {
  if (!requiredRoles.length) return true; // 无角色要求则默认通过
  return requiredRoles.some((role) => userRoles.includes(role));
};
/**
 * 生成友好的权限拒绝提示信息
 */
const getPermissionDeniedMessage = (
  userRoles: string[],
  requiredRoles: string[],
): string => {
  const roleNames: Record<string, string> = {
    user1: `普通用户`,
    user2: `列控用户`,
    admin: `管理员`,
    superadmin: `超级管理员`,
  };
  const userRoleText =
    userRoles.length > 0
      ? userRoles.map((role) => roleNames[role] || role).join(`、`)
      : `无角色`;
  const requiredRoleText = requiredRoles
    .map((role) => roleNames[role] || role)
    .join(`或`);
  return `权限不足：需要 ${requiredRoleText} 权限，当前角色：${userRoleText}`;
};
export default defineNuxtRouteMiddleware(async (to, from) => {
  const auth = useAuth();
  try {
    // 初始化认证状态(仅在客户端)
    if (import.meta.client) {
      await auth.initializeAuth();
    }
    const { isAuthenticated, getUserRoles } = auth;
    const userRoles = getUserRoles.value || [];
    const requiredRoles = to.meta.requiredRoles || [];
    // 1. 白名单页面处理
    if (isPathInWhiteList(to.path)) {
      // 已登录用户访问登录页等白名单页面，重定向到首页
      if (isAuthenticated.value && to.path !== `/`) {
        return navigateTo(`/`);
      }
      return; // 未登录用户访问白名单，直接放行
    }
    // 2. 无需认证的路由直接放行
    if (!to.meta.requiresAuth) {
      return;
    }
    // 3. 需要认证但未登录 → 跳转登录页
    if (!isAuthenticated.value) {
      return createLoginRedirect(to.fullPath, `unauthorized`);
    }
    // 4. 角色权限验证
    if (
      requiredRoles.length > 0 &&
      !hasRequiredRoles(userRoles, requiredRoles)
    ) {
      const errorMsg = getPermissionDeniedMessage(userRoles, requiredRoles);
      if (import.meta.server) {
        throw createError({
          statusCode: 403,
          statusMessage: `Forbidden: Insufficient permissions`,
          message: errorMsg,
        });
      } else {
        // 客户端友好提示
        ElMessage.warning(errorMsg);
        // 智能回退：根据用户现有权限跳转到合适的页面
        if (userRoles.includes(`user1`)) {
          return navigateTo(`/person/list`); // user1 回退到人员列表
        } else if (userRoles.includes(`user2`)) {
          return navigateTo(`/smz`); // user2 回退到SMZ页面
        } else if (
          userRoles.includes(`admin`) ||
          userRoles.includes(`superadmin`)
        ) {
          return navigateTo(`/management`); // 管理员回退到管理页面
        } else {
          return navigateTo(`/`); // 默认回退到首页
        }
      }
    }
    // 权限验证通过，允许访问
    return;
  } catch (error) {
    // 简化错误处理
    if (import.meta.server) {
      throw createError({
        statusCode: 500,
        statusMessage: `Authentication check failed`,
        message: `认证检查失败，请稍后重试`,
      });
    } else {
      // 客户端错误处理
      const errorMessage = error instanceof Error ? error.message : `未知错误`;
      if (errorMessage.includes(`403`) || errorMessage.includes(`Forbidden`)) {
        ElMessage.warning(`权限验证失败`);
      } else {
        ElMessage.error(`页面访问检查失败，请重试`);
      }
      return abortNavigation(`路由守卫执行失败`);
    }
  }
});
