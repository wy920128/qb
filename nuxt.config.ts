/*
 * @Author: 王野 18545455617@163.com
 * @Date: 2026-01-15 14:10:54
 * @LastEditors: 王野 18545455617@163.com
 * @LastEditTime: 2026-02-06 12:48:55
 * @FilePath: /qb/nuxt.config.ts
 * @Description: nuxt 配置文件
 */
export default defineNuxtConfig({
  build: {
    transpile: [],
  },
  compatibilityDate: `2025-07-15`,
  css: [`~/styles/global.scss`, `element-plus/theme-chalk/dark/css-vars.css`],
  devServer: {
    port: 80,
    host: `0.0.0.0`,
  },
  devtools: { enabled: true },
  modules: [`@element-plus/nuxt`],
  elementPlus: {
    importStyle: `scss`,
    defaultLocale: `zh-cn`,
  },
  runtimeConfig: {
    server: {
      apiBaseUrl: process.env.NUXT_PUBLIC_API_BASE_URL || `/api`,
    },
    db: {
      dbHost: process.env.DB_HOST,
      dbPort: process.env.DB_PORT,
      dbUser: process.env.DB_USER,
      dbPassword: process.env.DB_PASSWORD,
      dbName: process.env.DB_NAME,
    },
    db_lk: {
      dbHost: process.env.DB_LK_HOST,
      dbPort: process.env.DB_LK_PORT,
      dbUser: process.env.DB_LK_USER,
      dbPassword: process.env.DB_LK_PASSWORD,
      dbName: process.env.DB_LK_NAME,
    },
  },
  vite: {
    css: {
      preprocessorOptions: {
        scss: {
          additionalData: `
            @use "~/styles/variables.scss" as *;
            @use "~/styles/elementplus.scss" as *;
          `,
        },
      },
    },
  },
});
