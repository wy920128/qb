<template>
  <div class="home-container" v-if="!isChecking">
    <h1>首页</h1>
    <!-- 调试用：临时显示状态（修复后可删除） -->
    <div style="color: #666; margin: 10px 0; font-size: 12px">
      调试: isLoginValid = {{ isLoginValid }} | 认证状态 =
      {{ auth.isAuthenticated.value }} | 过期时间 > 当前时间 =
      {{ auth.state.value.expiresAt > Date.now() }}
    </div>
    <!-- 展示 认证状态数据（复用 useAuth 中的数据） -->
    <div class="cookie-data" v-if="isLoginValid">
      <h3>认证状态数据:</h3>
      <!-- <div class="data-item">
        <span class="label">Token: </span>
        <span class="value">{{ auth.getToken.value || "无" }}</span>
      </div> -->
      <div class="data-item">
        <span class="label">用户ID: </span>
        <span class="value">{{ auth.getUser.value?.id || "无" }}</span>
      </div>
      <div class="data-item">
        <span class="label">用户名: </span>
        <span class="value">{{ auth.getUser.value?.username || "无" }}</span>
      </div>
      <div class="data-item">
        <span class="label">用户角色: </span>
        <span class="value">
          {{ auth.getUserRoles.value?.join(", ") || "无" }}
        </span>
      </div>
      <div class="data-item">
        <span class="label">Token过期时间: </span>
        <span class="value">
          {{
            auth.state.value.expiresAt
              ? new Date(auth.state.value.expiresAt).toLocaleString()
              : "无"
          }}
        </span>
      </div>
      <div class="data-item">
        <span class="label">认证状态: </span>
        <span class="value">{{ isLoginValid ? "已认证" : "未认证" }}</span>
      </div>
      <!-- 展示原始 Cookie 数据（方便调试，复用 useAuth 的 Cookie 逻辑） -->
      <!-- <div class="data-item raw-data">
        <span class="label">原始 Cookie 数据: </span>
        <pre class="value">{{ JSON.stringify(cookieData, null, 2) }}</pre>
      </div> -->
      <!-- 操作按钮 -->
      <div class="action-buttons">
        <button @click="handleLogout" class="logout-btn">退出登录</button>
        <button
          @click="refreshUserInfo"
          class="refresh-btn"
          :disabled="isRefreshing"
        >
          {{ isRefreshing ? "刷新中..." : "刷新用户信息" }}
        </button>
      </div>
    </div>
    <div v-else class="no-data">
      未检测到登录信息，请先
      <a href="/login" class="login-link">登录</a>
    </div>
  </div>
  <!-- 加载态: 避免页面闪烁 -->
  <div class="loading" v-else>
    <div class="spinner"></div>
    <span>校验登录状态中...</span>
  </div>
</template>

<script lang="ts" setup>
import { ElMessage } from "element-plus";
import { useAuth } from "~/composables/useAuth"; // 导入封装好的 useAuth

// 核心：复用 useAuth 中的所有逻辑和状态，不再手动创建 Cookie
const auth = useAuth();
const route = useRoute();

// 加载状态
const isChecking = ref(true);
const isRefreshing = ref(false);

// 【关键】直接复用 useAuth 中的数据，无需手动操作 Cookie
const cookieData = computed(() => {
  // 对应 useAuth 中的 authCookie 数据结构
  return {
    token: auth.getToken.value,
    user: auth.getUser.value,
    expiresAt: auth.state.value.expiresAt,
  };
});

// 【关键修复1】加固计算属性，复用 useAuth 的认证状态，确保始终返回布尔值
const isLoginValid = computed(() => {
  // 直接复用 useAuth 中的 isAuthenticated 计算属性（已做完整校验）
  const isAuthValid = auth.isAuthenticated.value;
  // 额外补充用户数据校验（可选，增强健壮性）
  const hasUser = Boolean(auth.getUser.value);

  return isAuthValid && hasUser;
});

// 退出登录处理：直接复用 useAuth 中的 logout 方法，无需手动清理 Cookie
const handleLogout = async (): Promise<void> => {
  if (isRefreshing.value) return;
  try {
    isRefreshing.value = true;
    await auth.logout(); // 复用封装好的退出逻辑，自动清理 Cookie 和状态
  } catch (error) {
    ElMessage.error(`退出登录过程中出错: ${error}`);
  } finally {
    isRefreshing.value = false;
  }
};

// 【关键修复2】优化刷新用户信息逻辑，复用 useAuth 的方法
const refreshUserInfo = async (): Promise<void> => {
  if (isRefreshing.value || !auth.getToken.value) return;

  try {
    isRefreshing.value = true;
    // 调用 useAuth 中的 validateToken 方法，自动同步状态和 Cookie
    const resValidateToken: boolean = await auth.validateToken(
      auth.getToken.value,
    );

    if (resValidateToken) {
      ElMessage.success("用户信息刷新成功");
    } else {
      ElMessage.warning("用户信息已失效，请重新登录");
    }
  } catch (error) {
    ElMessage.error(`刷新用户信息失败: ${error}`);
  } finally {
    isRefreshing.value = false;
  }
};

// 跳转到登录页
const redirectToLogin = async (): Promise<void> => {
  if (import.meta.client && route.path !== "/login") {
    const redirectPath = encodeURIComponent(route.fullPath);
    await navigateTo(
      {
        path: "/login",
        query: {
          redirect: redirectPath, // 把当前页面路径传给登录页
        },
      },
      { replace: true },
    ); // replace 避免路由历史记录冗余
  }
};

// 初始化认证状态：复用 useAuth 的 initializeAuth 方法
const initPageAuth = async (): Promise<void> => {
  try {
    // 调用 useAuth 的初始化方法，自动恢复 Cookie 中的认证状态
    await auth.initializeAuth();
    await nextTick();

    // 校验是否有效，无效则跳转到登录页
    if (!isLoginValid.value) {
      await redirectToLogin();
    }
  } catch (error) {
    ElMessage.error(`初始化认证状态失败: ${error}`);
  } finally {
    isChecking.value = false;
  }
};

// 页面挂载后的初始化逻辑：直接调用封装好的初始化方法
onMounted(async () => {
  if (import.meta.client) {
    await initPageAuth();
  }
});

// 监听路由变化
watch(
  () => route.path,
  async (newPath) => {
    if (newPath === "/" && import.meta.client) {
      await nextTick();
      if (!isLoginValid.value) {
        await redirectToLogin();
      }
    }
  },
  { immediate: false },
);

// 额外：监听认证状态变化，实时响应
watch(
  () => auth.isAuthenticated.value,
  async (newAuthState) => {
    if (import.meta.client && !newAuthState && route.path !== "/login") {
      await redirectToLogin();
    }
  },
);
</script>

<style scoped lang="scss">
// 保留你原有的样式即可，此处为占位
.home-container {
  padding: 20px;
}

.cookie-data {
  margin-top: 20px;
  padding: 16px;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
}

.data-item {
  display: flex;
  margin: 8px 0;
  align-items: flex-start;

  .label {
    width: 120px;
    font-weight: 500;
    color: #333;
  }

  .value {
    flex: 1;
    color: #666;
  }

  .raw-data {
    flex-direction: column;

    pre {
      margin-top: 8px;
      padding: 8px;
      background-color: #f5f7fa;
      border-radius: 4px;
      font-size: 12px;
      overflow-x: auto;
    }
  }
}

.action-buttons {
  margin-top: 20px;
  display: flex;
  gap: 12px;

  button {
    padding: 8px 16px;
    border: none;
    border-radius: 4px;
    cursor: pointer;
    color: #fff;

    &.logout-btn {
      background-color: #f56c6c;
    }

    &.refresh-btn {
      background-color: #409eff;
    }

    &:disabled {
      background-color: #c0c4cc;
      cursor: not-allowed;
    }
  }
}

.no-data {
  margin-top: 20px;
  color: #666;

  .login-link {
    color: #409eff;
    text-decoration: none;
  }
}

.loading {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 200px;
  color: #666;

  .spinner {
    width: 32px;
    height: 32px;
    border: 4px solid #f3f3f3;
    border-top: 4px solid #409eff;
    border-radius: 50%;
    animation: spin 1s linear infinite;
    margin-bottom: 12px;
  }
}

@keyframes spin {
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
}
</style>
