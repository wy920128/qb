<template>
  <div class="login-container">
    <!-- 背景设计 -->
    <div class="login-bg">
      <div class="bg-pattern"></div>
    </div>
    <!-- 主登录卡片 -->
    <el-card class="login-card" shadow="always">
      <!-- 卡片头部 -->
      <template #header>
        <div class="login-header">
          <el-icon size="48" color="#409EFF" class="login-icon">
            <User />
          </el-icon>
          <h1 class="login-title">用户登录</h1>
          <p class="login-subtitle">欢迎回来，请登录您的账户</p>
        </div>
      </template>
      <!-- 登录表单 -->
      <el-form
        ref="loginFormRef"
        :model="loginForm"
        :rules="loginRules"
        size="large"
        class="login-form"
        @submit.prevent="handleLogin"
      >
        <!-- 用户名输入 -->
        <el-form-item prop="username">
          <el-input
            v-model="loginForm.username"
            placeholder="请输入用户名"
            :prefix-icon="User"
            clearable
            :disabled="isLoading"
          />
        </el-form-item>
        <!-- 密码输入 -->
        <el-form-item prop="password">
          <el-input
            v-model="loginForm.password"
            placeholder="请输入密码"
            :prefix-icon="Lock"
            :type="showPassword ? 'text' : 'password'"
            clearable
            :disabled="isLoading"
            @keyup.enter="handleLogin"
          >
            <template #suffix>
              <el-icon
                class="password-toggle"
                @click="showPassword = !showPassword"
              >
                <View v-if="showPassword" />
                <Hide v-else />
              </el-icon>
            </template>
          </el-input>
        </el-form-item>
        <!-- 7日内免登录选项 -->
        <el-form-item>
          <el-checkbox v-model="loginForm.expiresIn" :disabled="isLoading">
            7日内免登录
          </el-checkbox>
        </el-form-item>
        <!-- 按钮区域 -->
        <el-form-item class="button-group">
          <el-row :gutter="20" class="button-row">
            <el-col :span="14">
              <el-button
                type="primary"
                size="large"
                :loading="isLoading"
                class="login-btn"
                @click="handleLogin"
              >
                <template #loading>
                  <el-icon class="is-loading">
                    <Loading />
                  </el-icon>
                  登录中...
                </template>
                <el-icon class="btn-icon"><Promotion /></el-icon>
                登录
              </el-button>
            </el-col>
            <el-col :span="10">
              <el-button
                size="large"
                class="reset-btn"
                :disabled="isLoading"
                @click="handleReset"
              >
                重置
              </el-button>
            </el-col>
          </el-row>
        </el-form-item>
      </el-form>
      <!-- 错误信息显示 -->
      <div v-if="errorMessage" class="error-message">
        <el-alert
          :title="errorMessage"
          type="error"
          show-icon
          :closable="false"
        />
      </div>
    </el-card>
  </div>
</template>
<script setup lang="ts">
import {
  User,
  Lock,
  View,
  Hide,
  Loading,
  Promotion,
} from "@element-plus/icons-vue";
import type { FormInstance, FormRules } from "element-plus";
import type { Auth, AuthLoginPO, AuthRes, Res } from "~/types";
// 组合式函数导入
const router = useRouter();
const route = useRoute();
// 响应式数据
const loginForm = reactive<AuthLoginPO>({
  username: ``,
  password: ``,
  expiresIn: `1h`,
});
const loginFormRef = ref<FormInstance>();
const isLoading = ref(false);
const showPassword = ref(false);
const errorMessage = ref(``);

// 修复：正确类型定义的 Cookie [3,4](@ref)
const authToken = useCookie<string>(`auth-token`, {
  maxAge: 60 * 60 * 24 * 7, // 7天过期
  secure: process.env.NODE_ENV === "production",
  sameSite: "lax",
});

const authUser = useCookie<Omit<Auth, `password`>>(`auth-user`, {
  maxAge: 60 * 60 * 24 * 7,
  secure: process.env.NODE_ENV === "production",
  sameSite: "lax",
  // 提供默认值确保类型安全
  default: () => ({
    id: 0,
    username: ``,
    role: [],
  }),
});

const authExpires = useCookie<string>("auth-expires", {
  maxAge: 60 * 60 * 24 * 7,
  secure: process.env.NODE_ENV === "production",
  sameSite: "lax",
});

const authIsAuthenticated = useCookie<boolean>("auth-authenticated", {
  maxAge: 60 * 60 * 24 * 7,
  secure: process.env.NODE_ENV === "production",
  sameSite: "lax",
  default: () => false,
});

// 表单验证规则
const loginRules: FormRules = {
  username: [
    { required: true, message: "请输入用户名", trigger: "blur" },
    {
      min: 3,
      max: 20,
      message: "用户名长度在 3 到 20 个字符",
      trigger: "blur",
    },
  ],
  password: [
    { required: true, message: "请输入密码", trigger: "blur" },
    { min: 6, max: 30, message: "密码长度在 6 到 30 个字符", trigger: "blur" },
  ],
};

/**
 * 设置认证状态
 */
const setAuthState = (
  userData: Omit<Auth, `password`>,
  token: string,
  remember: boolean = false,
): void => {
  const expiresInSeconds = remember ? 7 * 24 * 60 * 60 : 60 * 60; // 7天或1小时
  const expiresAt = Date.now() + expiresInSeconds * 1000;

  // 设置认证 Cookie [4](@ref)
  authToken.value = token;
  authUser.value = userData;
  authExpires.value = expiresAt.toString();
  authIsAuthenticated.value = true;
};

/**
 * 清除认证状态
 */
const clearAuthState = (): void => {
  authToken.value = ``;
  authUser.value = {
    id: 0,
    username: ``,
    role: [],
  };
  authExpires.value = ``;
  authIsAuthenticated.value = false;
};

/**
 * 登录处理函数
 */
const handleLogin = async (): Promise<void> => {
  if (!loginFormRef.value) return;
  try {
    // 表单验证
    const valid = await loginFormRef.value.validate();
    if (!valid) {
      ElMessage.warning("请正确填写表单信息");
      return;
    }
    isLoading.value = true;
    errorMessage.value = "";
    // 调用登录 API [2](@ref)
    console.log(`loginForm.expiresIn:`, loginForm.expiresIn);
    const response = await $fetch<Res<AuthRes>>("/api/auth/login", {
      method: "POST",
      body: {
        username: loginForm.username.trim(),
        password: loginForm.password,
        expiresIn: loginForm.expiresIn,
      },
    });
    if (response.code === 200 && response.success && response.data.list) {
      const userData = response.data.list;

      if (!userData.token) {
        throw new Error("登录响应缺少 token");
      }

      // 设置认证状态
      setAuthState(userData, userData.token, loginForm.expiresIn === `7d`);

      // 处理记住用户名
      if (loginForm.expiresIn === `7d`) {
        localStorage.setItem("rememberedUsername", loginForm.username);
      } else {
        localStorage.removeItem("rememberedUsername");
      }

      ElMessage({
        message: "登录成功！",
        type: "success",
        duration: 2000,
      });

      // 跳转到目标页面或首页
      const redirect = route.query.redirect as string;
      setTimeout(() => {
        router.push(redirect || "/");
      }, 500);
    } else {
      throw new Error(response.message || "登录失败，请检查用户名和密码");
    }
  } catch (error: any) {
    console.error("登录错误:", error);

    // 清除认证状态
    clearAuthState();

    // 显示错误信息
    if (error.data?.message) {
      errorMessage.value = error.data.message;
    } else if (error.message) {
      errorMessage.value = error.message;
    } else {
      errorMessage.value = "登录失败，请检查网络连接";
    }

    ElMessage.error(errorMessage.value);
  } finally {
    isLoading.value = false;
  }
};

/**
 * 重置表单
 */
const handleReset = (): void => {
  if (loginFormRef.value) {
    loginFormRef.value.resetFields();
    errorMessage.value = "";
    ElMessage.info("表单已重置");
  }
};

/**
 * 检查是否已登录，如果已登录则跳转到首页
 */
const checkAuthStatus = (): void => {
  if (process.client) {
    const token = authToken.value;
    const expires = authExpires.value;
    const isAuthenticated = authIsAuthenticated.value;

    if (token && expires && isAuthenticated && parseInt(expires) > Date.now()) {
      // 已登录，跳转到首页或目标页面
      const redirect = route.query.redirect as string;
      router.push(redirect || "/");
    }
  }
};

/**
 * 键盘事件处理
 */
const handleKeypress = (event: KeyboardEvent): void => {
  if (event.key === "Enter" && !isLoading.value) {
    handleLogin();
  }
};

// 生命周期
onMounted(() => {
  // 添加键盘事件监听
  document.addEventListener("keypress", handleKeypress);

  // 填充记住的用户名
  const savedUsername = localStorage.getItem("rememberedUsername");
  if (savedUsername) {
    loginForm.username = savedUsername;
    loginForm.expiresIn = `7d`;
  }

  // 检查认证状态
  checkAuthStatus();
});

onBeforeUnmount(() => {
  // 移除键盘事件监听
  document.removeEventListener("keypress", handleKeypress);
});
</script>

<style scoped lang="scss">
.login-container {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  position: relative;
  overflow: hidden;
}

.login-bg {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;

  .bg-pattern {
    width: 100%;
    height: 100%;
    background:
      radial-gradient(
        circle at 20% 80%,
        rgba(120, 119, 198, 0.3) 0%,
        transparent 50%
      ),
      radial-gradient(
        circle at 80% 20%,
        rgba(255, 255, 255, 0.1) 0%,
        transparent 50%
      ),
      radial-gradient(
        circle at 40% 40%,
        rgba(255, 255, 255, 0.05) 0%,
        transparent 50%
      );
  }
}

.login-card {
  width: 420px;
  border: none;
  border-radius: 16px;
  backdrop-filter: blur(10px);
  background: rgba(255, 255, 255, 0.95);
  box-shadow:
    0 20px 40px rgba(0, 0, 0, 0.1),
    0 0 0 1px rgba(255, 255, 255, 0.2);
  transition: all 0.3s ease;

  &:hover {
    transform: translateY(-4px);
    box-shadow:
      0 25px 50px rgba(0, 0, 0, 0.15),
      0 0 0 1px rgba(255, 255, 255, 0.3);
  }

  :deep(.el-card__header) {
    padding: 40px 40px 20px;
    border-bottom: 1px solid #f0f0f0;
  }

  :deep(.el-card__body) {
    padding: 20px 40px 40px;
  }
}

.login-header {
  text-align: center;
  margin-bottom: 0;

  .login-icon {
    margin-bottom: 16px;
    background: linear-gradient(135deg, #409eff, #79bbff);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
  }

  .login-title {
    font-size: 28px;
    font-weight: 600;
    color: #303133;
    margin: 0 0 8px 0;
    background: linear-gradient(135deg, #303133, #606266);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
  }

  .login-subtitle {
    font-size: 14px;
    color: #909399;
    margin: 0;
  }
}

.login-form {
  .button-group {
    margin-bottom: 0;
  }

  .button-row {
    width: 100%;
  }

  .login-btn {
    width: 100%;
    height: 48px;
    font-size: 16px;
    font-weight: 500;
    border-radius: 8px;
    border: none;
    background: linear-gradient(135deg, #409eff, #79bbff);
    transition: all 0.3s ease;

    &:hover:not(.is-disabled) {
      transform: translateY(-1px);
      box-shadow: 0 8px 20px rgba(64, 158, 255, 0.3);
    }

    .btn-icon {
      margin-right: 8px;
    }
  }

  .reset-btn {
    width: 100%;
    height: 48px;
    font-size: 16px;
    font-weight: 500;
    border-radius: 8px;
    border: 1px solid #dcdfe6;
    background: #fff;
    color: #606266;
    transition: all 0.3s ease;

    &:hover:not(.is-disabled) {
      background: #f5f7fa;
      border-color: #c0c4cc;
    }
  }

  .password-toggle {
    cursor: pointer;
    color: #c0c4cc;
    transition: color 0.3s ease;

    &:hover {
      color: #409eff;
    }
  }
}

.error-message {
  margin-top: 16px;

  :deep(.el-alert) {
    border-radius: 8px;
  }
}

/* 响应式设计 */
@media (max-width: 768px) {
  .login-container {
    padding: 20px;
  }

  .login-card {
    width: 100%;
    max-width: 400px;

    :deep(.el-card__header) {
      padding: 32px 24px 16px;
    }

    :deep(.el-card__body) {
      padding: 16px 24px 32px;
    }
  }

  .login-header {
    .login-title {
      font-size: 24px;
    }
  }
}

@media (max-width: 480px) {
  .login-card {
    :deep(.el-card__header) {
      padding: 24px 20px 12px;
    }

    :deep(.el-card__body) {
      padding: 12px 20px 24px;
    }
  }

  .login-header {
    margin-bottom: 0;

    .login-title {
      font-size: 22px;
    }
  }
}

/* 无障碍支持 */
:focus-visible {
  outline: 2px solid #409eff;
  outline-offset: 2px;
}
</style>
