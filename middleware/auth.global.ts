/*
 * @Author: 王野 18545455617@163.com
 * @Date: 2026-01-15 16:11:25
 * @LastEditors: 王野 18545455617@163.com
 * @LastEditTime: 2026-01-15 16:13:19
 * @FilePath: /qb/middleware/auth.global.ts
 * @Description: 全局路由守卫，用于检查用户登录状态
 */
export default defineNuxtRouteMiddleware((to, from) => {
  // 1. 使用 useCookie 安全地获取认证令牌（SSR兼容）
  const token = useCookie(`token`); // 请确保此Cookie名称与你的登录逻辑中设置的名称一致
  const userInfo = useCookie(`userInfo`); // 可选：获取用户信息，用于更复杂的权限判断

  // 2. 定义无需认证即可访问的路由白名单（根据你的路由名称或路径填写）
  const whiteList = [`login`, `register`]; // 例如，路由名称为 `login` 和 `register` 的页面

  // 3. 检查当前目标路由是否在白名单中
  // 使用路由名称（name）进行匹配通常更可靠，确保你的页面通过definePageMeta定义了name
  const isInWhiteList = whiteList.includes(to.name as string);

  // 4. 主逻辑判断
  // 案例A: 用户未登录且试图访问需要认证的页面
  if (!token.value && !isInWhiteList) {
    // 重定向到登录页，并携带原路由路径作为参数，以便登录后跳转回来
    return navigateTo({
      path: `/login`,
      query: { redirect: to.fullPath },
    });
  }

  // 案例B: 用户已登录却试图访问登录/注册页
  if (token.value && isInWhiteList) {
    // 通常直接重定向到首页或其他默认页面，避免重复登录
    return navigateTo(`/`); // 或 `/dashboard` 等[6](@ref)
  }

  // 如果上述条件都不满足，则中间件什么都不做，导航会继续
  // 可以在此处添加基于用户角色的更细粒度的权限检查
  // if (token.value && to.meta.requiresAdmin) {
  //   if (userInfo.value?.role !== `admin`) {
  //     throw createError({ statusCode: 403, statusMessage: `Forbidden` })
  //   }
  // }
});
