<template>
  <div class="layout-container">
    <!-- 导航栏外层容器 -->
    <header class="nav-wrapper">
      <div class="nav-inner">
        <!-- 菜单整体容器（flex 左右分组） -->
        <div class="menu-container">
          <!-- 左侧 Logo + 菜单项 -->
          <div class="menu-left">
            <!-- 系统Logo/名称 -->
            <div class="system-logo">
              <el-icon class="logo-icon"><Monitor /></el-icon>
              <span class="logo-text">重点人管理系统</span>
            </div>
            <!-- 主导航菜单 -->
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
                    <!-- 使用动态组件解决图标渲染问题 -->
                    <component :is="item.icon"></component>
                  </el-icon>
                  <span class="item-label">{{ item.label }}</span>
                </el-menu-item>
              </template>
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
                      <img
                        v-if="cookieData.user.avatar"
                        :src="cookieData.user.avatar"
                        alt="用户头像"
                      />
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
              >
                <el-icon><User /></el-icon>
                登录
              </el-button>
            </el-menu>
          </div>
        </div>
      </div>
    </header>
    <!-- 页面内容区域 -->
    <main class="page-content">
      <Transition name="page-fade" mode="out-in">
        <div :key="route.fullPath" class="page-router-view">
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

// 用户认证状态（简化 Cookie 逻辑）
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

// 简化 activeMenu 逻辑（兼容子路由，回归默认激活规则）
const activeMenu = computed(() => {
  const firstPath = route.path.split(`/`)[1] || ``;
  const matchPath = firstPath ? `/${firstPath}` : `/`;
  const hasMatch = menuData.items.some((item) => item.index === matchPath);
  return hasMatch ? matchPath : `/`;
});

const cookieData = computed(() => authState.value);

// 简化菜单数据
const menuData = {
  items: [
    { index: `/`, icon: House, label: `首页` },
    { index: `/person/list`, icon: User, label: `重点人员` },
  ],
};

// 菜单选择事件（保留核心逻辑）
const handleMenuSelect = (index: string) => {
  if (index === `profile`) router.push(`/profile`);
};

// 简化退出登录逻辑（移除重复 Cookie 操作）
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

// 跳转登录页
const navigateToLogin = () => router.push(`/login`);

// 系统设置跳转
const handleSettings = () => router.push(`/settings`);
</script>

<style lang="scss" scoped>
// 全局布局容器（仅保留核心布局）
.layout-container {
  height: 100vh;
  width: 100%;
  display: flex;
  flex-direction: column;
}

// 导航栏外层容器（简化样式，回归 Element 默认）
.nav-wrapper {
  width: 100%;
  position: sticky;
  top: 0;
  z-index: 1000;
  background: #fff;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

// 导航栏内边距容器
.nav-inner {
  max-width: 1400px;
  margin: 0 auto;
  padding: 0 24px;
}

// 菜单整体容器（仅保留 flex 布局）
.menu-container {
  display: flex;
  justify-content: space-between;
  align-items: center;
  height: 60px;
}

// 左侧菜单+Logo容器
.menu-left {
  display: flex;
  align-items: center;
  gap: 20px;
  flex: 1;
  // 系统Logo样式（简化）
  .system-logo {
    display: flex;
    align-items: center;
    gap: 8px;
    padding-right: 20px;
    border-right: 1px solid #e5e7eb;
    .logo-icon {
      font-size: 20px;
      color: #409eff;
    }
    .logo-text {
      font-size: 16px;
      font-weight: 600;
      color: #303133;
    }
  }
  // 左侧主菜单（仅保留间距，使用 Element 默认样式）
  .main-menu {
    border-bottom: none;
    .menu-item {
      display: flex;
      align-items: center;
      gap: 4px;
      .item-icon {
        margin-right: 4px;
      }
      .item-label {
        font-size: 14px;
      }
    }
  }
}
// 右侧用户菜单容器（仅保留布局）
.menu-right {
  display: flex;
  align-items: center;
  // 右侧用户菜单（简化）
  .user-menu {
    border-bottom: none;
    .user-submenu {
      .user-info {
        display: flex;
        align-items: center;
        gap: 8px;
        .user-avatar {
          margin-right: 4px;
        }
        .user-name {
          font-size: 14px;
        }
        .dropdown-icon {
          font-size: 12px;
          margin-left: 4px;
        }
      }
    }
    // 登录按钮（仅保留间距）
    .login-btn {
      margin-left: 8px;
    }
  }
}
// 自定义用户子菜单（仅保留基础定位，使用 Element 默认样式）
:deep(.custom-user-submenu) {
  min-width: 180px;
  padding: 8px 0;
  .submenu-item {
    .submenu-icon {
      margin-right: 8px;
    }
    &.logout-item {
      color: #f56c6c;
    }
  }
}
// 页面内容区域（简化）
.page-content {
  flex: 1;
  overflow: auto;
  padding: 24px;
  background: #f5f7fa;
}
// 页面切换过渡动画（简化）
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
// 响应式适配（仅保留核心适配，无强样式）
@media (max-width: 1200px) {
  .nav-inner {
    max-width: 100%;
    padding: 0 16px;
  }
}
@media (max-width: 768px) {
  .nav-inner {
    padding: 0 12px;
  }
  .menu-container {
    height: 56px;
  }
  .menu-left {
    gap: 10px;
    .system-logo .logo-text {
      display: none;
    }
  }
  .page-content {
    padding: 16px 12px;
  }
}
@media (max-width: 480px) {
  .menu-left .main-menu .menu-item .item-label {
    display: none;
  }
}
</style>
