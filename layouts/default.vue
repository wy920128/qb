<template>
  <div class="layout-default">
    <!-- 移除外层容器，直接在 el-menu 上应用样式 -->
    <el-menu
      mode="horizontal"
      background-color="#545c64"
      text-color="#fff"
      active-text-color="#ffd04b"
      :default-active="activeMenu"
      class="custom-menu"
      router
    >
      <!-- 首页菜单项 -->
      <el-menu-item index="/" class="menu-item-left">
        <el-icon><House /></el-icon>
        <span>首页</span>
      </el-menu-item>

      <!-- 重点人员菜单项 -->
      <el-menu-item index="/person/list" class="menu-item-left">
        <el-icon><User /></el-icon>
        <span>重点人员</span>
      </el-menu-item>

      <!-- 弹性空间推挤 -->
      <div class="menu-spacer"></div>

      <!-- 用户信息区域（右侧） -->
      <el-sub-menu
        index="user-info"
        class="user-menu menu-item-right"
        v-if="cookieData.user"
      >
        <template #title>
          <el-icon><Avatar /></el-icon>
          <span>{{ cookieData.user.username || "用户" }}</span>
        </template>
        <el-menu-item index="profile">
          <el-icon><UserFilled /></el-icon>
          <span>个人资料</span>
        </el-menu-item>
        <el-menu-item index="logout">
          <el-icon><SwitchButton /></el-icon>
          <span>退出登录</span>
        </el-menu-item>
      </el-sub-menu>
    </el-menu>

    <!-- 页面内容区域 -->
    <main class="main-content">
      <NuxtPage />
    </main>
  </div>
</template>

<script lang="ts" setup>
import {
  House,
  User,
  Avatar,
  UserFilled,
  SwitchButton,
} from "@element-plus/icons-vue";

// 用户认证状态
const authState = useCookie("auth-data", {
  default: () => ({
    token: "",
    user: null as { id: number; username: string; role: string[] } | null,
    expiresAt: 0,
    isAuthenticated: false,
  }),
  maxAge: 60 * 60 * 24 * 7, // 7天过期
  secure: process.env.NODE_ENV === "production",
  sameSite: "lax",
  path: "/",
});

// 路由相关
const route = useRoute();

// 当前激活的菜单项
const activeMenu = computed(() => route.path);
const cookieData = computed(() => authState.value);
</script>

<style lang="scss" scoped>
.layout-default {
  height: 100vh;
  width: 100%;
  display: flex;
  flex-direction: column;
}

/* 关键修改：自定义菜单布局 */
.custom-menu {
  display: flex !important;
  justify-content: space-between;
  align-items: center;
  flex-shrink: 0;
  z-index: 1000;
}

/* 左侧菜单项 */
.menu-item-left {
  order: 1;
}

/* 弹性空间推挤 */
.menu-spacer {
  flex: 1;
  order: 2;
}

/* 右侧用户菜单 */
.user-menu {
  order: 3;
  margin-left: auto;
}

.main-content {
  flex: 1;
  overflow: auto;
  padding: 0;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .custom-menu {
    flex-wrap: wrap;
  }

  .menu-item-left,
  .user-menu {
    width: 100%;
  }

  .menu-spacer {
    display: none;
  }

  .user-menu {
    order: 3;
    margin-left: 0;
  }
}
</style>

<style>
/* 全局覆盖 Element Plus 菜单样式 */
.el-menu--horizontal {
  display: flex !important;
  border-bottom: none !important;
}

.el-menu--horizontal > .el-menu-item,
.el-menu--horizontal > .el-sub-menu {
  height: 60px !important;
  line-height: 60px !important;
}

/* 确保图标和文字对齐 */
.el-menu--horizontal .el-icon {
  vertical-align: middle;
  margin-right: 5px;
}
</style>
