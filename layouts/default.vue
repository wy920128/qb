<template>
  <div class="layout-container">
    <!-- 导航栏外层容器：核心美化载体（不修改el-menu原生样式） -->
    <header class="nav-wrapper">
      <div class="nav-inner">
        <el-menu
          mode="horizontal"
          :default-active="activeMenu"
          class="custom-menu"
          router
          @select="handleMenuSelect"
        >
          <!-- 左侧菜单项分组 -->
          <div class="menu-left">
            <el-menu-item index="/" class="menu-item">
              <el-icon class="item-icon"><House /></el-icon>
              <span class="item-label">首页</span>
            </el-menu-item>
            <el-menu-item index="/person/list" class="menu-item">
              <el-icon class="item-icon"><User /></el-icon>
              <span class="item-label">重点人员</span>
            </el-menu-item>
          </div>

          <!-- 右侧用户菜单分组 -->
          <div class="menu-right">
            <!-- 已登录：用户下拉菜单 -->
            <el-sub-menu
              index="user-info"
              class="user-submenu"
              v-if="cookieData.user"
            >
              <template #title>
                <div class="user-info">
                  <el-avatar size="small" class="user-avatar">
                    <el-icon><Avatar /></el-icon>
                  </el-avatar>
                  <span class="user-name">{{
                    cookieData.user.username || "用户"
                  }}</span>
                </div>
              </template>
              <el-menu-item index="profile" class="submenu-item">
                <el-icon class="submenu-icon"><UserFilled /></el-icon>
                <span class="submenu-label">个人资料</span>
              </el-menu-item>
              <el-menu-item
                index="logout"
                class="submenu-item"
                @click="handleLogout"
              >
                <el-icon class="submenu-icon"><SwitchButton /></el-icon>
                <span class="submenu-label">退出登录</span>
              </el-menu-item>
            </el-sub-menu>

            <!-- 未登录：登录按钮 -->
            <el-button
              type="text"
              class="login-btn"
              v-else
              @click="navigateToLogin"
            >
              <el-icon><User /></el-icon>
              <span>登录</span>
            </el-button>
          </div>
        </el-menu>
      </div>
    </header>

    <!-- 页面内容区域 -->
    <main class="page-content">
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
import { ElMessage } from "element-plus";

// 用户认证状态
const authState = useCookie("auth-data", {
  default: () => ({
    token: "",
    user: null as { id: number; username: string; role: string[] } | null,
    expiresAt: 0,
    isAuthenticated: false,
  }),
  maxAge: 60 * 60 * 24 * 7,
  secure: process.env.NODE_ENV === "production",
  sameSite: "lax",
  path: "/",
});

// 路由相关
const route = useRoute();
const router = useRouter();

// 当前激活的菜单项
const activeMenu = computed(() => route.path);
const cookieData = computed(() => authState.value);

// 菜单选择事件（处理非路由菜单项）
const handleMenuSelect = (index: string) => {
  if (index === "profile") {
    router.push("/profile");
  }
};

// 退出登录逻辑
const handleLogout = async () => {
  try {
    // 重置认证状态
    authState.value = {
      token: "",
      user: null,
      expiresAt: 0,
      isAuthenticated: false,
    };
    // 显式删除Cookie
    const authCookie = useCookie("auth-data", { path: "/", sameSite: "lax" });
    authCookie.value = null;
    // 客户端兜底删除
    if (import.meta.client) {
      document.cookie =
        "auth-data=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT;";
    }
    // 跳转登录页
    await router.push("/login");
    ElMessage.success("退出登录成功");
  } catch (error) {
    console.error("退出登录失败:", error);
    ElMessage.error("退出登录失败，请重试");
  }
};

// 跳转到登录页
const navigateToLogin = () => {
  router.push("/login");
};
</script>

<style lang="scss" scoped>
// 全局布局容器
.layout-container {
  height: 100vh;
  width: 100%;
  display: flex;
  flex-direction: column;
  background-color: #f8f9fa; // 页面背景色
}

// 导航栏外层容器（核心美化：不修改el-menu原生样式）
.nav-wrapper {
  width: 100%;
  background-color: #2c3e50; // 导航栏背景
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1); // 柔和阴影
  position: sticky;
  top: 0;
  z-index: 1000;
}

// 导航栏内边距容器
.nav-inner {
  max-width: 1400px;
  margin: 0 auto;
  padding: 0 24px;
}

// 自定义菜单容器（仅作用于当前组件的el-menu）
.custom-menu {
  width: 100%;
  height: 64px;
  display: flex !important;
  justify-content: space-between;
  align-items: center;
  background-color: transparent !important; // 继承外层背景，不修改el-menu原生背景
  border: none !important;

  // 左侧菜单项分组（左对齐）
  .menu-left {
    display: flex;
    align-items: center;
    gap: 4px;
  }

  // 右侧用户菜单分组（右对齐）
  .menu-right {
    display: flex;
    align-items: center;
    margin-left: auto;
  }

  // 基础菜单项样式（仅当前组件内生效）
  :deep(.menu-item) {
    height: 48px !important;
    line-height: 48px !important;
    padding: 0 20px !important;
    margin: 0 2px !important;
    border-radius: 8px;
    color: #ecf0f1 !important; // 文字色
    transition: all 0.2s ease-in-out;

    // hover效果（不覆盖全局，仅当前组件）
    &:hover {
      background-color: #34495e !important;
      color: #3498db !important;
    }

    // 激活态样式（仅当前组件）
    &.is-active {
      background-color: #3498db !important;
      color: #ffffff !important;
    }

    // 菜单项图标
    .item-icon {
      font-size: 16px;
      margin-right: 8px;
      vertical-align: middle;
    }

    // 菜单项文字
    .item-label {
      font-size: 14px;
      font-weight: 500;
      vertical-align: middle;
    }
  }

  // 用户下拉菜单样式（仅当前组件）
  :deep(.user-submenu) {
    height: 48px !important;
    line-height: 48px !important;
    padding: 0 16px !important;
    border-radius: 8px;
    color: #ecf0f1 !important;
    transition: all 0.2s ease-in-out;

    &:hover {
      background-color: #34495e !important;
    }

    // 用户信息容器
    .user-info {
      display: flex;
      align-items: center;
      gap: 8px;
    }

    // 用户头像
    .user-avatar {
      background-color: #3498db;
    }

    // 用户名
    .user-name {
      font-size: 14px;
      font-weight: 500;
    }

    // 子菜单项样式（仅当前组件）
    :deep(.submenu-item) {
      height: 44px !important;
      line-height: 44px !important;
      padding: 0 16px !important;
      color: #2c3e50 !important;

      &:hover {
        background-color: #f1f5f9 !important;
        color: #3498db !important;
      }

      // 子菜单图标
      .submenu-icon {
        font-size: 14px;
        margin-right: 8px;
      }

      // 子菜单文字
      .submenu-label {
        font-size: 13px;
        font-weight: 400;
      }
    }

    // 子菜单面板样式（仅当前组件）
    :deep(.el-submenu__menu) {
      top: 52px !important;
      right: 0 !important;
      left: auto !important;
      min-width: 160px;
      border-radius: 8px;
      box-shadow: 0 4px 16px rgba(0, 0, 0, 0.15);
      border: 1px solid #e2e8f0;
      padding: 4px 0;
    }
  }

  // 登录按钮样式（仅当前组件）
  :deep(.login-btn) {
    height: 48px;
    padding: 0 20px;
    border-radius: 8px;
    color: #ecf0f1 !important;
    font-size: 14px;
    font-weight: 500;
    transition: all 0.2s ease-in-out;

    &:hover {
      background-color: #34495e !important;
      color: #3498db !important;
    }

    :deep(.el-icon) {
      margin-right: 8px;
      vertical-align: middle;
    }
  }
}

// 页面内容区域
.page-content {
  flex: 1;
  overflow: auto;
  padding: 0;
}

// 响应式适配（移动端）
@media (max-width: 768px) {
  .nav-inner {
    padding: 0 16px;
  }

  .custom-menu {
    height: 56px;

    :deep(.menu-item) {
      height: 40px !important;
      line-height: 40px !important;
      padding: 0 16px !important;

      .item-label {
        font-size: 13px;
      }

      .item-icon {
        font-size: 14px;
      }
    }

    :deep(.user-submenu) {
      height: 40px !important;
      line-height: 40px !important;

      .user-name {
        font-size: 13px;
      }
    }

    :deep(.login-btn) {
      height: 40px;
      padding: 0 16px;
      font-size: 13px;
    }
  }
}
</style>
