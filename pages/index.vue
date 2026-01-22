<template>
  <div class="home-container" v-if="!isChecking">
    <h1>首页</h1>
    <!-- 调试用：临时显示状态（修复后可删除） -->
    <div style="color: #666; margin: 10px 0; font-size: 12px">
      调试: isLoginValid = {{ isLoginValid }} | 认证状态 =
      {{ authState.isAuthenticated }} | 过期时间 > 当前时间 =
      {{ authState.expiresAt > Date.now() }}
    </div>
    <!-- 展示 Cookie 中的登录数据 -->
    <div class="cookie-data" v-if="isLoginValid">
      <h3>认证状态数据:</h3>
      <div class="data-item">
        <span class="label">Token: </span>
        <span class="value">{{ authState.token || "无" }}</span>
      </div>
      <div class="data-item">
        <span class="label">用户ID: </span>
        <span class="value">{{ authState.user?.id || "无" }}</span>
      </div>
      <div class="data-item">
        <span class="label">用户名: </span>
        <span class="value">{{ authState.user?.username || "无" }}</span>
      </div>
      <div class="data-item">
        <span class="label">用户角色: </span>
        <span class="value">
          {{ authState.user?.role?.join(", ") || "无" }}
        </span>
      </div>
      <div class="data-item">
        <span class="label">Token过期时间: </span>
        <span class="value">
          {{
            authState.expiresAt
              ? new Date(authState.expiresAt).toLocaleString()
              : "无"
          }}
        </span>
      </div>
      <div class="data-item">
        <span class="label">认证状态: </span>
        <span class="value">{{ isLoginValid ? "已认证" : "未认证" }}</span>
      </div>
      <!-- 展示原始 Cookie 数据（方便调试） -->
      <div class="data-item raw-data">
        <span class="label">原始 Cookie 数据: </span>
        <pre class="value">{{ JSON.stringify(cookieData, null, 2) }}</pre>
      </div>
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
const { validateToken } = useAuth();

// 使用 Cookie 管理认证状态
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

// 加载状态
const isChecking = ref(true);
const isRefreshing = ref(false);
const route = useRoute();

// 计算属性: 获取 Cookie 数据用于展示
const cookieData = computed(() => authState.value);

// 【关键修复1】加固计算属性，确保始终返回布尔值
const isLoginValid = computed(() => {
  // 先判断state是否存在，避免undefined
  const state = authState.value || {
    isAuthenticated: false,
    token: "",
    user: null,
    expiresAt: 0,
  };

  // 逐个属性做边界判断，避免表达式短路返回undefined
  const hasAuth = Boolean(state.isAuthenticated);
  const hasToken = Boolean(state.token);
  const hasUser = Boolean(state.user);
  const isExpiresValid =
    typeof state.expiresAt === "number" && state.expiresAt > Date.now();

  const isValid = hasAuth && hasToken && hasUser && isExpiresValid;
  return isValid;
});

// 退出登录处理
const handleLogout = async (): Promise<void> => {
  if (isRefreshing.value) return;
  try {
    isRefreshing.value = true;
    if (authState.value?.token) {
      try {
        await $fetch("/api/auth/logout", {
          method: "POST",
          headers: {
            Authorization: `Bearer ${authState.value.token}`,
          },
        });
      } catch (apiError) {
        ElMessage.error(`退出 API 调用失败，继续本地清理: ${apiError}`);
      }
    }
    const authCookie = useCookie("auth-data", {
      path: "/",
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
    });
    authCookie.value = null;
    authState.value = {
      token: "",
      user: null,
      expiresAt: 0,
      isAuthenticated: false,
    };
    await navigateTo("/login");
  } catch (error) {
    ElMessage.error(`退出登录过程中出错: ${error}`);
  } finally {
    isRefreshing.value = false;
  }
};

// 【关键修复2】优化刷新用户信息逻辑，同步更新authState
const refreshUserInfo = async (): Promise<void> => {
  if (isRefreshing.value || !authState.value.token) return;

  try {
    isRefreshing.value = true;
    // 调用验证token接口，确保返回布尔值
    const resValidateToken: boolean = await validateToken(
      authState.value.token,
    );

    if (resValidateToken) {
      // 【关键】刷新成功后更新authState，触发响应式更新
      // 这里假设validateToken返回true时，可重新设置过期时间（比如延长30分钟）
      const currentState = authState.value;
      authState.value = {
        ...currentState,
        expiresAt: Date.now() + 30 * 60 * 1000, // 延长30分钟过期
        isAuthenticated: true, // 确保认证状态为true
      };
      await nextTick(); // 等待响应式更新完成
    } else {
      await handleLogout();
    }
  } catch (error) {
    ElMessage.error(`刷新用户信息失败: ${error}`);
    await handleLogout();
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

// 初始化认证状态
const initializeAuth = (): void => {
  if (import.meta.client) {
    const currentState = authState.value;
    // 验证 token 有效性
    const isTokenValid =
      currentState.token && currentState.expiresAt > Date.now();

    if (isTokenValid) {
      authState.value = {
        ...currentState,
        isAuthenticated: true,
      };
    } else {
      authState.value = {
        token: "",
        user: null,
        expiresAt: 0,
        isAuthenticated: false,
      };
    }
  }
};

// 页面挂载后的初始化逻辑
onMounted(async () => {
  if (import.meta.client) {
    try {
      initializeAuth();
      await nextTick();
      if (!isLoginValid.value) {
        await redirectToLogin();
      }
    } catch (error) {
      ElMessage.error(`初始化认证状态失败: ${error}`);
    } finally {
      isChecking.value = false;
    }
  }
});

// 监听路由变化
watch(
  () => route.path,
  async (newPath) => {
    if (newPath === "/" && import.meta.client) {
      await nextTick();
      if (!isLoginValid.value) {
        redirectToLogin();
      }
    }
  },
  { immediate: false },
);
</script>

<style scoped>
/* 样式部分保持不变 */
.home-container {
  padding: 20px;
  max-width: 800px;
  margin: 0 auto;
}
.loading {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 40px;
  color: #666;
}
.spinner {
  width: 40px;
  height: 40px;
  border: 4px solid #f3f3f3;
  border-top: 4px solid #3498db;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin-bottom: 16px;
}
@keyframes spin {
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
}
.cookie-data {
  margin-top: 20px;
  padding: 20px;
  border: 1px solid #e6e6e6;
  border-radius: 8px;
  background-color: #f9f9f9;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}
.cookie-data h3 {
  margin-top: 0;
  color: #2c3e50;
  border-bottom: 1px solid #e6e6e6;
  padding-bottom: 10px;
}
.data-item {
  display: flex;
  margin: 12px 0;
  line-height: 1.6;
}
.label {
  font-weight: bold;
  width: 180px;
  color: #333;
  flex-shrink: 0;
}
.value {
  flex: 1;
  color: #666;
  word-break: break-all;
}
.raw-data {
  margin-top: 20px;
  flex-direction: column;
  background-color: #fff;
  padding: 15px;
  border-radius: 4px;
  border: 1px solid #e6e6e6;
}
.raw-data .label {
  margin-bottom: 10px;
}
.raw-data pre {
  margin: 0;
  padding: 0;
  background-color: transparent;
  overflow-x: auto;
  font-size: 14px;
  background-color: #f5f5f5;
  padding: 10px;
  border-radius: 4px;
}
.action-buttons {
  margin-top: 20px;
  display: flex;
  gap: 12px;
}
.logout-btn,
.refresh-btn {
  padding: 8px 16px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 14px;
  transition: background-color 0.3s;
}
.logout-btn {
  background-color: #e74c3c;
  color: white;
}
.logout-btn:hover {
  background-color: #c0392b;
}
.refresh-btn {
  background-color: #3498db;
  color: white;
}
.refresh-btn:hover {
  background-color: #2980b9;
}
.no-data {
  margin-top: 20px;
  color: #999;
  padding: 20px;
  border: 1px dashed #e6e6e6;
  border-radius: 8px;
  text-align: center;
}
.login-link {
  color: #3498db;
  text-decoration: none;
}
.login-link:hover {
  text-decoration: underline;
}
/* 响应式设计 */
@media (max-width: 768px) {
  .home-container {
    padding: 10px;
  }
  .data-item {
    flex-direction: column;
  }
  .label {
    width: 100%;
    margin-bottom: 5px;
  }
  .action-buttons {
    flex-direction: column;
  }
}
</style>
