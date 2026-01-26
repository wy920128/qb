<template>
  <div class="layout-container">
    <!-- 导航栏外层容器 -->
    <header class="nav-wrapper">
      <div class="nav-inner">
        <!-- 核心修改：移除 el-menu 上的 flex 强制样式，通过插槽/布局嵌套实现左右分组 -->
        <div class="menu-container">
          <!-- 左侧 Logo + 菜单项 -->
          <div class="menu-left">
            <!-- 系统Logo/名称 -->
            <div class="system-logo">
              <el-icon class="logo-icon"><Monitor /></el-icon>
              <span class="logo-text">重点人管理系统</span>
            </div>
            <el-menu
              mode="horizontal"
              :default-active="activeMenu"
              class="main-menu"
              router
              @select="handleMenuSelect"
            >
              <el-menu
                mode="horizontal"
                :default-active="activeMenu"
                class="main-menu"
                router
                @select="handleMenuSelect"
              >
                <template v-for="item in menuData.items" :key="item.index">
                  <el-menu-item :index="item.index" class="menu-item">
                    <el-icon class="item-icon">
                      <component :is="item.icon"></component>
                    </el-icon>
                    <span class="item-label">{{ item.label }}</span>
                  </el-menu-item>
                </template>
              </el-menu>
            </el-menu>
          </div>
          <!-- 右侧用户菜单 -->
          <div class="menu-right">
            <el-menu mode="horizontal" class="user-menu">
              <!-- 已登录：用户下拉菜单 -->
              <el-sub-menu
                index="user-info"
                class="user-submenu"
                v-if="cookieData.user"
                popper-class="custom-user-submenu"
              >
                <template #title>
                  <div class="user-info">
                    <el-avatar size="small" class="user-avatar">
                      <template v-if="cookieData.user.avatar">
                        <img :src="cookieData.user.avatar" alt="用户头像" />
                      </template>
                      <el-icon v-else><Avatar /></el-icon>
                    </el-avatar>
                    <span class="user-name">{{
                      cookieData.user.username || "用户"
                    }}</span>
                    <el-icon class="dropdown-icon"><ArrowDown /></el-icon>
                  </div>
                </template>
                <el-menu-item index="profile" class="submenu-item">
                  <el-icon class="submenu-icon"><UserFilled /></el-icon>
                  <span class="submenu-label">个人资料</span>
                </el-menu-item>
                <el-menu-item
                  index="settings"
                  class="submenu-item"
                  @click="handleSettings"
                >
                  <el-icon class="submenu-icon"><Setting /></el-icon>
                  <span class="submenu-label">系统设置</span>
                </el-menu-item>
                <el-divider class="submenu-divider" />
                <el-menu-item
                  index="logout"
                  class="submenu-item logout-item"
                  @click="handleLogout"
                >
                  <el-icon class="submenu-icon"><SwitchButton /></el-icon>
                  <span class="submenu-label">退出登录</span>
                </el-menu-item>
              </el-sub-menu>
              <!-- 未登录：登录按钮 -->
              <el-button
                type="primary"
                plain
                class="login-btn"
                v-else
                @click="navigateToLogin"
                icon="User"
              >
                登录
              </el-button>
            </el-menu>
          </div>
        </div>
      </div>
    </header>
    <main class="page-content">
      <Transition name="page-fade" mode="out-in">
        <div :key="route.path">
          <NuxtPage />
        </div>
      </Transition>
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
  Monitor,
  ArrowDown,
  Setting,
} from "@element-plus/icons-vue";
import { ElMessage, ElMessageBox } from "element-plus";
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
// 当前激活的菜单项
const activeMenu = computed(() => route.path);
const cookieData = computed(() => authState.value);

const menuData = {
  items: [
    {
      index: `/`,
      icon: House,
      label: `首页`,
    },
    {
      index: `/person/list`,
      icon: User,
      label: `重点人员`,
    },
  ],
};
// 菜单选择事件
const handleMenuSelect = (index: string) => {
  if (index === `profile`) {
    router.push(`/profile`);
  }
};
// 退出登录逻辑
const handleLogout = async () => {
  try {
    const confirm = await ElMessageBox.confirm(`确定要退出登录吗？`, `提示`, {
      confirmButtonText: `确定`,
      cancelButtonText: `取消`,
      type: `warning`,
    });
    if (confirm === `confirm`) {
      authState.value = {
        token: ``,
        user: null,
        expiresAt: 0,
        isAuthenticated: false,
      };
      const authCookie = useCookie(`auth-data`, { path: `/`, sameSite: `lax` });
      authCookie.value = null;
      if (import.meta.client) {
        document.cookie = `auth-data=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT;`;
      }
      await router.push(`/login`);
      ElMessage.success(`退出登录成功`);
    }
  } catch (error) {
    if (error !== `cancel`) {
      console.error(`退出登录失败:`, error);
      ElMessage.error(`退出登录失败，请重试`);
    }
  }
};
// 跳转到登录页
const navigateToLogin = () => {
  router.push(`/login`);
};
// 系统设置跳转
const handleSettings = () => {
  router.push(`/settings`);
};
</script>
<style lang="scss" scoped>
// 全局布局容器
.layout-container {
  height: 100vh;
  width: 100%;
  display: flex;
  flex-direction: column;
  background-color: #f8f9fa;
}
// 导航栏外层容器
.nav-wrapper {
  width: 100%;
  background: linear-gradient(135deg, #2c3e50 0%, #1a2530 100%);
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.12);
  position: sticky;
  top: 0;
  z-index: 1000;
  border-bottom: 1px solid rgba(255, 255, 255, 0.08);
}
// 导航栏内边距容器
.nav-inner {
  max-width: 1400px;
  margin: 0 auto;
  padding: 0 24px;
}
// 核心：菜单整体容器（用flex实现左右分组）
.menu-container {
  display: flex;
  justify-content: space-between;
  align-items: center;
  height: 70px;
}
// 左侧菜单+Logo容器
.menu-left {
  display: flex;
  align-items: center;
  gap: 20px;
  // 系统Logo样式
  .system-logo {
    display: flex;
    align-items: center;
    gap: 8px;
    padding-right: 20px;
    border-right: 1px solid rgba(255, 255, 255, 0.1);
    .logo-icon {
      font-size: 20px;
      color: #3498db;
    }
    .logo-text {
      font-size: 16px;
      font-weight: 600;
      color: #ffffff;
      letter-spacing: 0.5px;
    }
  }
  // 左侧主菜单
  .main-menu {
    background: transparent !important;
    border: none !important;
    :deep(.el-menu-item) {
      height: 48px !important;
      line-height: 48px !important;
      padding: 0 24px !important;
      margin: 0 4px !important;
      border-radius: 12px;
      color: #e9ecef !important;
      font-size: 14px;
      font-weight: 500;
      transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
      position: relative;
      overflow: hidden;
      &:hover {
        background: linear-gradient(
          135deg,
          #34495e 0%,
          #2c3e50 100%
        ) !important;
        color: #3498db !important;
        transform: translateY(-1px);
        &::before {
          content: "";
          position: absolute;
          left: 0;
          top: 0;
          height: 100%;
          width: 3px;
          background-color: #3498db;
        }
      }
      &.is-active {
        background: linear-gradient(
          135deg,
          #3498db 0%,
          #2980b9 100%
        ) !important;
        color: #ffffff !important;
        box-shadow: 0 4px 8px rgba(52, 152, 219, 0.2);
        transform: translateY(-1px);
        &::before {
          content: "";
          position: absolute;
          left: 0;
          top: 0;
          height: 100%;
          width: 3px;
          background-color: #ffffff;
        }
      }
      .item-icon {
        font-size: 18px;
        margin-right: 10px;
        vertical-align: middle;
      }
      .item-label {
        font-size: 14px;
        font-weight: 500;
        vertical-align: middle;
        letter-spacing: 0.3px;
      }
    }
  }
}
// 右侧用户菜单容器
.menu-right {
  display: flex;
  align-items: center;
  // 右侧用户菜单
  .user-menu {
    background: transparent !important;
    border: none !important;
    // 用户下拉菜单
    :deep(.el-submenu) {
      height: 48px !important;
      line-height: 48px !important;
      padding: 0 20px !important;
      border-radius: 12px;
      color: #e9ecef !important;
      transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
      border: 1px solid transparent;
      &:hover {
        background: linear-gradient(
          135deg,
          #34495e 0%,
          #2c3e50 100%
        ) !important;
        border-color: rgba(52, 152, 219, 0.2);
      }
      // 用户信息容器
      .user-info {
        display: flex;
        align-items: center;
        gap: 10px;
        .user-avatar {
          background-color: #3498db;
          border: 2px solid rgba(255, 255, 255, 0.2);
        }
        .user-name {
          font-size: 14px;
          font-weight: 500;
          max-width: 80px;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }
        .dropdown-icon {
          font-size: 12px;
          color: rgba(255, 255, 255, 0.7);
          transition: transform 0.3s ease;
        }
      }
    }
    // 登录按钮
    .login-btn {
      height: 48px;
      padding: 0 24px;
      border-radius: 12px;
      font-size: 14px;
      font-weight: 500;
      border-color: #3498db;
      color: #3498db !important;
      transition: all 0.3s ease;
      &:hover {
        background-color: #3498db !important;
        color: #ffffff !important;
        transform: translateY(-1px);
        box-shadow: 0 4px 12px rgba(52, 152, 219, 0.2);
      }
    }
  }
}
// 自定义用户子菜单弹出层
:deep(.custom-user-submenu) {
  top: 56px !important;
  right: 0 !important;
  left: auto !important;
  min-width: 180px;
  border-radius: 12px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.15);
  border: 1px solid #e2e8f0;
  padding: 8px 0;
  background-color: #ffffff !important;
  overflow: hidden;
  :deep(.el-menu-item) {
    height: 48px !important;
    line-height: 48px !important;
    padding: 0 20px !important;
    color: #2c3e50 !important;
    font-size: 14px;
    transition: all 0.2s ease;
    &:hover {
      background-color: #f1f5f9 !important;
      color: #3498db !important;
      padding-left: 24px !important;
    }
    &.logout-item {
      color: #e74c3c !important;
      &:hover {
        background-color: #fef2f2 !important;
        color: #e74c3c !important;
      }
    }
    .submenu-icon {
      font-size: 16px;
      margin-right: 12px;
      color: inherit;
    }
    .submenu-label {
      font-size: 14px;
      font-weight: 400;
      letter-spacing: 0.2px;
    }
  }
  :deep(.el-divider) {
    margin: 4px 0;
    background-color: #e2e8f0;
  }
}
// 页面内容区域
.page-content {
  flex: 1;
  overflow: auto;
  padding: 24px;
  transition: all 0.3s ease;
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
@media (max-width: 1200px) {
  .nav-inner {
    max-width: 100%;
    padding: 0 16px;
  }
  .menu-left .system-logo .logo-text {
    display: none;
  }
  .menu-left .system-logo {
    padding-right: 10px;
    border-right: none;
  }
}
@media (max-width: 768px) {
  .nav-wrapper {
    box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
  }
  .nav-inner {
    padding: 0 12px;
  }
  .menu-container {
    height: 60px;
  }
  .menu-left {
    gap: 10px;
    .system-logo {
      display: none;
    }
    .main-menu :deep(.el-menu-item) {
      height: 40px !important;
      line-height: 40px !important;
      padding: 0 16px !important;
      margin: 0 2px !important;
      .item-label {
        font-size: 13px;
      }
      .item-icon {
        font-size: 16px;
        margin-right: 6px;
      }
    }
  }
  .menu-right .user-menu :deep(.el-submenu) {
    height: 40px !important;
    line-height: 40px !important;
    padding: 0 16px !important;
    .user-info {
      gap: 6px;
      .user-name {
        display: none;
      }
    }
  }
  .menu-right .user-menu .login-btn {
    height: 40px;
    padding: 0 16px;
    font-size: 13px;
  }
  .page-content {
    padding: 16px 12px;
  }
}
@media (max-width: 480px) {
  .menu-left .main-menu :deep(.el-menu-item) .item-label {
    display: none;
  }
  .menu-left .main-menu :deep(.el-menu-item) {
    padding: 0 12px !important;
  }
}
</style>
