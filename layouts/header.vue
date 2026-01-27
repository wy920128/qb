<template>
  <el-header class="header">
    <div class="nav-inner">
      <div class="menu-container">
        <div class="menu-left">
          <div class="system-logo">
            <el-icon class="logo-icon"><Monitor /></el-icon>
            <span class="logo-text">重点人管理系统</span>
          </div>
          <el-menu
            mode="horizontal"
            :default-active="activeMenu"
            class="main-menu"
            router
            :ellipsis="false"
            @select="handleMenuSelect"
          >
            <!-- 使用计算属性避免重复调用函数 -->
            <template v-for="item in filteredMenu.header" :key="item.index">
              <el-menu-item :index="item.index" class="menu-item">
                <el-icon class="item-icon">
                  <component :is="item.icon"></component>
                </el-icon>
                <span class="item-label">{{ item.label }}</span>
              </el-menu-item>
            </template>
          </el-menu>
        </div>

        <!-- 右侧用户菜单 -->
        <div class="menu-right">
          <el-dropdown
            v-if="hasUser && filteredMenu.right.length > 0"
            trigger="click"
            placement="bottom-end"
            @command="handleDropdownCommand"
          >
            <span class="dropdown-trigger">
              <el-avatar size="small" class="user-avatar">
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
          <el-button
            v-else-if="showLoginButton"
            type="primary"
            plain
            class="login-btn"
            @click="navigateToLogin"
          >
            <User />
            登录
          </el-button>
        </div>
      </div>
    </div>
  </el-header>
</template>

<script lang="ts" setup>
import { Avatar, Monitor, ArrowDown, User } from "@element-plus/icons-vue";
import { getFilteredMenu } from "~/config/menu";

// 接收父组件传递的 props
const props = defineProps<{
  cookieData: any;
  activeMenu: string;
}>();

const emit = defineEmits<{
  menuSelect: [index: string];
  logout: [];
  login: [];
  settings: [];
}>();

const router = useRouter();

// 使用计算属性进行安全的数据访问
const currentUser = computed(() => props.cookieData?.user || null);
const hasUser = computed(() => !!currentUser.value);
const userAvatar = computed(() => currentUser.value?.avatar || null);
const userDisplayName = computed(() => currentUser.value?.username || `用户`);

// 使用计算属性缓存过滤结果
const filteredMenu = computed(() => {
  return getFilteredMenu(currentUser.value);
});

const showLoginButton = computed(() => {
  return !currentUser.value;
});

// 菜单选择事件
const handleMenuSelect = (index: string) => {
  if (index === `profile`) {
    router.push(`/profile`);
  }
  emit(`menuSelect`, index);
};

// 下拉菜单命令处理
const handleDropdownCommand = (command: string) => {
  switch (command) {
    case `profile`:
      router.push(`/profile`);
      break;
    case `settings`:
      emit(`settings`);
      break;
    case `logout`:
      handleLogout();
      break;
  }
};

// 退出登录逻辑
const handleLogout = async () => {
  const { logout } = useAuth();
  await logout();
};

// 跳转登录页
const navigateToLogin = () => {
  emit(`login`);
};
</script>

<style lang="scss" scoped>
.header {
  padding: 0;
  height: auto;
  background: #fff;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  position: sticky;
  top: 0;
  z-index: 1000;
}

.nav-inner {
  max-width: 1400px;
  margin: 0 auto;
  padding: 0 24px;
}

.menu-container {
  display: flex;
  justify-content: space-between;
  align-items: center;
  height: 60px;
}

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
      font-size: 20px;
      color: #409eff;
    }

    .logo-text {
      font-size: 16px;
      font-weight: 600;
      color: #303133;
    }
  }

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

.menu-right {
  display: flex;
  align-items: center;

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
      margin-right: 4px;
    }

    .username {
      font-size: 14px;
      font-weight: 500;
      color: #303133;
    }

    .dropdown-icon {
      font-size: 12px;
      color: #909399;
      margin-left: 4px;
    }
  }

  .login-btn {
    margin-left: 8px;
  }
}

// 响应式适配
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

  .menu-right .dropdown-trigger .username {
    display: none;
  }
}

@media (max-width: 480px) {
  .menu-left .main-menu .menu-item .item-label {
    display: none;
  }
}
</style>
