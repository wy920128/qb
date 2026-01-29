<!--
 * @Author: 王野 18545455617@163.com
 * @Date: 2026-01-22 09:05:01
 * @LastEditors: 王野 18545455617@163.com
 * @LastEditTime: 2026-01-29 10:01:11
 * @FilePath: /qb/layouts/default.vue
 * @Description: 布局 - 默认
-->
<template>
  <div class="common-layout">
    <el-container class="layout-container">
      <!-- 头部组件 -->
      <LayoutHeader
        :cookie-data="cookieData"
        :active-menu="activeMenu"
        @menu-select="handleMenuSelect"
        @logout="handleLogout"
        @login="navigateToLogin"
        @settings="handleSettings"
      />

      <!-- 主内容区域 -->
      <el-main class="main-content">
        <Transition name="page-fade" mode="out-in">
          <div :key="route.fullPath" class="page-router-view">
            <NuxtPage />
          </div>
        </Transition>
      </el-main>
      <LayoutFooter />
    </el-container>
  </div>
</template>

<script lang="ts" setup>
import LayoutHeader from "~/layouts/header.vue";
import LayoutFooter from "~/layouts/footer.vue";
import { menuData } from "../config/menu";

// 用户认证状态
const authState = useCookie(`auth-data`, {
  default: () => ({
    token: ``,
    user: null as {
      id: number;
      username: string;
      role: string[];
      avatar?: string;
    } | null,
    expiresAt: 0,
    isAuthenticated: false,
  }),
  maxAge: 60 * 60 * 24 * 7,
  secure: process.env.NODE_ENV === `production`,
  sameSite: `lax`,
  path: `/`,
});

// 路由相关
const route = useRoute();
const router = useRouter();

// 是否显示底部
const showFooter = ref(true);

// 简化 activeMenu 逻辑
const activeMenu = computed(() => {
  const hasMatch = menuData.header.some((item) => item.index === route.path);
  return hasMatch ? route.path : `/`;
});

const cookieData = computed(() => authState.value);

// 菜单选择事件
const handleMenuSelect = (index: string) => {
  if (index === `profile`) router.push(`/profile`);
};

// 退出登录逻辑
const handleLogout = async () => {
  try {
    authState.value = {
      token: ``,
      user: null,
      expiresAt: 0,
      isAuthenticated: false,
    };
    await router.push(`/login`);
    ElMessage.success(`退出登录成功`);
  } catch (error) {
    console.error(`退出登录失败:`, error);
    ElMessage.error(`退出登录失败，请重试`);
  }
};

// 跳转登录页
const navigateToLogin = () => router.push(`/login`);

// 系统设置跳转
const handleSettings = () => router.push(`/settings`);
</script>

<style lang="scss" scoped>
.common-layout {
  height: 100vh;
}

.layout-container {
  height: 100vh;
  display: flex;
  flex-direction: column;
}

.main-content {
  flex: 1;
  overflow: auto;
  padding: 24px;
  background: #f5f7fa;
}

.footer {
  background: #f0f2f5;
  border-top: 1px solid #e8e8e8;
  display: flex;
  align-items: center;
  justify-content: center;
  height: 60px;

  .footer-content {
    text-align: center;
    color: #666;
    font-size: 14px;
  }
}

// 页面切换过渡动画
.page-fade-enter-from {
  opacity: 0;
  transform: translateY(10px);
}

.page-fade-enter-active {
  transition:
    opacity 0.3s ease,
    transform 0.3s ease;
}

.page-fade-leave-to {
  opacity: 0;
}

.page-fade-leave-active {
  transition: opacity 0.2s ease;
}

// 响应式适配
@media (max-width: 768px) {
  .main-content {
    padding: 16px 12px;
  }

  .footer {
    height: 50px;

    .footer-content {
      font-size: 12px;
    }
  }
}
</style>
