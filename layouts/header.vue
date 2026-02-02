<template>
  <el-header class="header">
    <div class="menu-container">
      <div class="menu-left">
        <div class="system-logo">
          <el-icon class="logo-icon"><Monitor /></el-icon>
          <span class="logo-text">重点人管理系统</span>
        </div>

        <!-- 关键修复：左侧动态菜单也用 ClientOnly 包裹，避免服务端/客户端菜单数据不一致 -->
        <ClientOnly>
          <el-menu
            mode="horizontal"
            :default-active="activeMenu"
            class="main-menu"
            router
            :ellipsis="false"
            @select="handleMenuSelect"
          >
            <template v-for="item in filteredMenu.header" :key="item.index">
              <el-menu-item :index="item.index" class="menu-item">
                <el-icon class="item-icon">
                  <component :is="item.icon"></component>
                </el-icon>
                <span class="item-label">{{ item.label }}</span>
              </el-menu-item>
            </template>
          </el-menu>
        </ClientOnly>
      </div>

      <div class="menu-right">
        <!-- 右侧用户区域保持 ClientOnly 包裹 -->
        <ClientOnly>
          <!-- 加载状态 -->
          <div v-if="auth.isLoading.value" class="loading-state">
            <el-skeleton class="user-skeleton" animated>
              <template #template>
                <el-skeleton-item variant="circle" class="avatar-skeleton" />
                <el-skeleton-item variant="text" class="text-skeleton" />
              </template>
            </el-skeleton>
          </div>

          <!-- 已登录状态：用户下拉菜单 -->
          <el-dropdown
            v-else-if="
              auth.isAuthenticated.value && filteredMenu.right.length > 0
            "
            trigger="click"
            placement="bottom-end"
            popper-class="custom-dropdown-menu"
            @command="handleDropdownCommand"
          >
            <span class="dropdown-trigger">
              <el-avatar class="user-avatar">
                <el-icon v-if="!userAvatar"><Avatar /></el-icon>
                <img v-else :src="userAvatar" alt="用户头像" />
              </el-avatar>
              <span class="username">{{ userDisplayName }}</span>
              <el-icon class="dropdown-icon"><ArrowDown /></el-icon>
            </span>
            <template #dropdown>
              <el-dropdown-menu>
                <template v-for="item in filteredMenu.right" :key="item.index">
                  <el-dropdown-item
                    :command="item.index"
                    :class="['dropdown-item', item.index]"
                  >
                    <el-icon><component :is="item.icon" /></el-icon>
                    <span>{{ item.label }}</span>
                  </el-dropdown-item>
                </template>
              </el-dropdown-menu>
            </template>
          </el-dropdown>

          <!-- 未登录状态：登录按钮 -->
          <el-button
            v-else
            type="primary"
            plain
            class="login-btn"
            @click="navigateToLogin"
          >
            <User />
            登录
          </el-button>
        </ClientOnly>
      </div>
    </div>
  </el-header>
</template>

<script lang="ts" setup>
import { Avatar, Monitor, ArrowDown, User } from "@element-plus/icons-vue";
import { getFilteredMenu } from "~/config/menu";
import { useAuth } from "~/composables/useAuth";

const props = defineProps<{
  activeMenu: string;
}>();

const emit = defineEmits<{
  menuSelect: [index: string];
  logout: [];
  login: [];
  settings: [];
}>();

const router = useRouter();
const auth = useAuth();

// 提前初始化认证（早于 DOM 渲染，减少状态突变）
const initAuth = async () => {
  await auth.initializeAuth();
};
await initAuth();

// 直接依赖 useAuth 的实时计算属性
const currentUser = auth.getUser;
const userAvatar = computed(() => currentUser.value?.avatar || null);
const userDisplayName = computed(() => currentUser.value?.username || "用户");

// 确保菜单数据响应式更新
const filteredMenu = computed(() => {
  if (currentUser.value) {
    return getFilteredMenu(currentUser.value);
  }
  return { header: [], right: [] };
});

// 事件处理函数保持不变
const handleMenuSelect = (index: string) => {
  if (index === "profile") {
    router.push("/profile");
  }
  emit("menuSelect", index);
};

const handleDropdownCommand = async (command: string) => {
  switch (command) {
    case "profile":
      router.push("/profile");
      break;
    case "settings":
      emit("settings");
      break;
    case "logout":
      await handleLogout();
      break;
  }
};

const handleLogout = async () => {
  try {
    await auth.logout();
    await navigateTo("/login");
  } catch (error) {
    console.error("登出失败:", error);
  }
};

const navigateToLogin = () => {
  emit("login");
  router.push("/login");
};
</script>

<style scoped lang="scss">
// 样式部分保持不变，无需修改
.header {
  padding: 0;
  height: auto;
  background: $bg-color-w;
  box-shadow: $shadow-md;
  position: sticky;
  top: 0;
  z-index: 1000;

  .menu-container {
    max-width: 1400px;
    margin: 0 auto;
    display: flex;
    justify-content: space-between;
    align-items: center;
    height: 66px;
    padding: 0 20px;

    .menu-left {
      display: flex;
      align-items: center;
      gap: 20px;
      flex: 1;

      .system-logo {
        display: flex;
        align-items: center;
        gap: 8px;
        padding-right: 20px;
        border-right: 1px solid #e5e7eb;

        .logo-icon {
          font-size: $font-size-lg;
          color: $text-primary;
        }

        .logo-text {
          font-size: $font-size-lg;
          font-weight: 600;
          color: $text-primary;
        }
      }

      .main-menu {
        border-bottom: none;
        background: $bg-color-w;

        .menu-item {
          display: flex;
          align-items: center;
          gap: 4px;

          .item-icon {
            margin-right: 4px;
          }

          .item-label {
            font-size: $font-size-md;
          }

          &.is-active {
            color: $color-primary;
            border-bottom: 2px solid $color-primary;
          }
        }
      }
    }

    .menu-right {
      display: flex;
      align-items: center;

      .loading-state {
        display: flex;
        align-items: center;
        gap: 12px;

        .user-skeleton {
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .avatar-skeleton {
          width: 32px;
          height: 32px;
        }

        .text-skeleton {
          width: 60px;
          height: 16px;
        }
      }

      .dropdown-trigger {
        display: flex;
        align-items: center;
        gap: 8px;
        padding: 8px 12px;
        border-radius: 6px;
        cursor: pointer;
        transition: background-color 0.2s;

        &:hover {
          background-color: #f5f7fa;
        }

        .user-avatar {
          font-size: $font-size-lg;
          margin-right: 4px;
        }

        .username {
          font-size: $font-size-md;
          font-weight: 500;
          color: $text-primary;
        }

        .dropdown-icon {
          font-size: $font-size-md;
          color: $text-primary;
          margin-left: 4px;
        }
      }

      .login-btn {
        margin-left: 8px;
      }
    }
  }
}

// 响应式设计
@media (max-width: 1200px) {
  .menu-container {
    padding: 0 16px;
  }
}

@media (max-width: 768px) {
  .menu-container {
    height: 56px;
    padding: 0 12px;

    .menu-left {
      gap: 10px;

      .system-logo .logo-text {
        display: none;
      }
    }

    .menu-right .dropdown-trigger .username {
      display: none;
    }
  }
}

@media (max-width: 480px) {
  .menu-left .main-menu .menu-item .item-label {
    display: none;
  }
}

// 自定义下拉菜单样式
:deep(.custom-dropdown-menu) {
  .dropdown-item {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 8px 16px;

    &.logout {
      color: #f56c6c;

      &:hover {
        background-color: #fef0f0;
      }
    }
  }
}
</style>
