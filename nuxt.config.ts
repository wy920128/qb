/*
 * @Author: 王野 18545455617@163.com
 * @Date: 2026-01-15 14:10:54
 * @LastEditors: 王野 18545455617@163.com
 * @LastEditTime: 2026-01-31 08:14:34
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
  // routeRules: {
  //   "\/": {
  //     redirect: `/person/list`,
  //   },
  // },
  runtimeConfig: {
    server: {
      apiBaseUrl: process.env.NUXT_PUBLIC_API_BASE_URL || `/api`,
    },
    db_aliyun: {
      dbHost: process.env.DB_ALY_HOST,
      dbPort: process.env.DB_ALY_PORT,
      dbUser: process.env.DB_ALY_USER,
      dbPassword: process.env.DB_ALY_PASSWORD,
      dbName: process.env.DB_ALY_NAME,
    },
    db_gaw: {
      dbHost: process.env.DB_GAW_HOST,
      dbPort: process.env.DB_GAW_PORT,
      dbUser: process.env.DB_GAW_USER,
      dbPassword: process.env.DB_GAW_PASSWORD,
      dbName: process.env.DB_GAW_NAME,
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
