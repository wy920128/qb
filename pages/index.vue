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
        <button @click="refreshUserInfo" class="refresh-btn">
          刷新用户信息
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
});
// 加载状态
const isChecking = ref(true);
const route = useRoute();
// 计算属性: 获取 Cookie 数据用于展示
const cookieData = computed(() => authState.value);
// 计算属性: 判断登录态是否有效
const isLoginValid = computed(() => {
  const state = authState.value;
  const isValid =
    state.isAuthenticated &&
    !!state.token &&
    !!state.user &&
    state.expiresAt > Date.now();
  console.log("模板渲染时 isLoginValid:", isValid); // 新增：确认模板读取的数值
  return isValid;
});
// 退出登录处理
const handleLogout = async (): Promise<void> => {
  try {
    // 调用退出 API（如果后端需要）
    if (authState.value.token) {
      await $fetch("/api/auth/logout", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${authState.value.token}`,
        },
      });
    }
  } catch (error) {
    console.error("退出登录 API 错误:", error);
  } finally {
    // 清除认证状态（替换整个对象，确保响应式）
    authState.value = {
      token: "",
      user: null,
      expiresAt: 0,
      isAuthenticated: false,
    };
    // 跳转到登录页
    await navigateTo("/login");
  }
};
// 刷新用户信息
const refreshUserInfo = async (): Promise<void> => {
  if (!authState.value.token) return;
  try {
    const response = await $fetch<{ valid: boolean; user?: any }>(
      "/api/auth/validate",
      {
        headers: {
          Authorization: `Bearer ${authState.value.token}`,
        },
      },
    );
    if (response.valid && response.user) {
      // 替换整个对象，确保响应式更新
      authState.value = {
        ...authState.value,
        user: response.user,
      };
      console.log("用户信息刷新成功");
    } else {
      await handleLogout();
    }
  } catch (error) {
    console.error("刷新用户信息失败:", error);
    await handleLogout();
  }
};
// 跳转到登录页
const redirectToLogin = async (): Promise<void> => {
  if (import.meta.client && route.path !== "/login") {
    await navigateTo("/login");
  }
};
// 初始化认证状态（关键修复：替换整个对象而非修改嵌套属性）
const initializeAuth = (): void => {
  if (import.meta.client) {
    const currentState = authState.value;
    console.log("🚀 初始化前 authState: ", currentState);
    // 验证 token 有效性
    const isTokenValid =
      currentState.token && currentState.expiresAt > Date.now();
    if (isTokenValid) {
      // 替换整个对象，触发响应式更新
      authState.value = {
        ...currentState,
        isAuthenticated: true, // 修正认证状态
      };
    } else {
      // Token 过期或无效，清除状态
      authState.value = {
        token: "",
        user: null,
        expiresAt: 0,
        isAuthenticated: false,
      };
    }
    console.log("🚀 初始化后 authState: ", authState.value);
  }
};
// 页面挂载后的初始化逻辑
onMounted(async () => {
  if (import.meta.client) {
    try {
      // 初始化认证状态
      initializeAuth();
      // 强制等待响应式更新完成
      await nextTick();
      console.log("🚀 初始化后 isLoginValid 计算结果: ", isLoginValid.value);
      // 如果未登录，跳转到登录页
      if (!isLoginValid.value) {
        console.log("未登录，跳转到登录页");
        await redirectToLogin();
      }
    } catch (error) {
      console.error("初始化认证状态失败:", error);
    } finally {
      // 结束加载状态（无论成功/失败）
      isChecking.value = false;
    }
  }
});
// 监听路由变化，确保登录状态正确
watch(
  () => route.path,
  async (newPath) => {
    if (newPath === "/" && import.meta.client) {
      await nextTick(); // 等待响应式更新
      if (!isLoginValid.value) {
        redirectToLogin();
      }
    }
  },
  { immediate: false },
);
</script>
<style scoped>
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
