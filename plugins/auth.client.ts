/*
 * @Author: 王野 18545455617@163.com
 * @Date: 2026-01-21 17:03:46
 * @LastEditors: 王野 18545455617@163.com
 * @LastEditTime: 2026-01-21 17:03:54
 * @FilePath: /qb/plugins/auth.client.ts
 * @Description: 客户端认证插件
 */
export default defineNuxtPlugin(async (nuxtApp) => {
  const { initializeAuth } = useAuth();
  await initializeAuth();
});
