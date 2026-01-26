/*
 * @Author: 王野 18545455617@163.com
 * @Date: 2026-01-15 14:10:54
 * @LastEditors: 王野 18545455617@163.com
 * @LastEditTime: 2026-01-26 09:47:18
 * @FilePath: /qb/nuxt.config.ts
 * @Description: nuxt 配置文件
 */
export default defineNuxtConfig({
  build: {
    transpile: [],
  },
  compatibilityDate: `2025-07-15`,
  css: [`~/assets/styles/global.css`],
  devServer: {
    port: 80, // 设置开发服务器端口为80
    host: `0.0.0.0`, // 允许外部访问
  },
  devtools: { enabled: true },
  modules: [`@element-plus/nuxt`],
  elementPlus: {
    icon: `ElIcon`,
    importStyle: `scss`,
    themes: [`dark`],
  },
  hooks: {
    "pages:extend": function (pages) {
      pages.unshift({
        name: `index`,
        path: `/`,
        redirect: `/person/list`,
      });
    },
  },
  runtimeConfig: {
    server: {
      apiBaseUrl: process.env.NUXT_PUBLIC_API_BASE_URL || `/api`,
    },
    // db: {
    //   dbHost: process.env.DB_HOST,
    //   dbPort: process.env.DB_PORT,
    //   dbUser: process.env.DB_USER,
    //   dbPassword: process.env.DB_PASSWORD,
    //   dbName: process.env.DB_NAME,
    // },
    db_aliyun: {
      dbHost: process.env.DB_ALY_HOST,
      dbPort: process.env.DB_ALY_PORT,
      dbUser: process.env.DB_ALY_USER,
      dbPassword: process.env.DB_ALY_PASSWORD,
      dbName: process.env.DB_ALY_NAME,
    },
  },
});
