<template>
  <div class="login-container">
    <div class="login-bg">
      <div class="bg-pattern"></div>
    </div>
    <el-card class="login-card" shadow="always">
      <template #header>
        <div class="login-header">
          <el-icon size="48" color="#409EFF" class="login-icon">
            <User />
          </el-icon>
          <h1 class="login-title">用户登录</h1>
          <p class="login-subtitle">欢迎回来，请登录您的账户</p>
        </div>
      </template>
      <el-form
        :ref="(ref) => (loginFormData.formRef.value = ref)"
        :model="loginFormData.formData"
        :rules="loginFormData.formRules"
        size="large"
        class="login-form"
        @submit.prevent="loginFormData.funcLogin"
      >
        <el-form-item prop="username">
          <el-input
            v-model="loginFormData.formData.username"
            placeholder="请输入用户名"
            :prefix-icon="User"
            clearable
            :disabled="isLoading"
          />
        </el-form-item>
        <el-form-item prop="password">
          <el-input
            v-model="loginFormData.formData.password"
            placeholder="请输入密码"
            :prefix-icon="Lock"
            :type="loginFormData.formData.showPassword ? 'text' : 'password'"
            clearable
            :disabled="isLoading"
            @keyup.enter="loginFormData.funcLogin"
          >
            <template #suffix>
              <el-icon
                class="password-toggle"
                @click="
                  loginFormData.formData.showPassword =
                    !loginFormData.formData.showPassword
                "
              >
                <View v-if="loginFormData.formData.showPassword" />
                <Hide v-else />
              </el-icon>
            </template>
          </el-input>
        </el-form-item>
        <el-form-item>
          <el-checkbox
            v-model="loginFormData.formData.expiresIn"
            :disabled="isLoading"
          >
            7日内免登录
          </el-checkbox>
        </el-form-item>
        <el-form-item class="button-group">
          <el-row :gutter="20" class="button-row">
            <el-col :span="14">
              <el-button
                type="primary"
                size="large"
                :loading="isLoading"
                class="login-btn"
                @click="loginFormData.funcLogin"
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
                @click="loginFormData.funcReset"
              >
                重置
              </el-button>
            </el-col>
          </el-row>
        </el-form-item>
      </el-form>
    </el-card>
  </div>
</template>

<script lang="ts" setup>
import {
  Hide,
  Loading,
  Lock,
  Promotion,
  User,
  View,
} from "@element-plus/icons-vue";
const { login, isLoading } = useAuth();
const loginFormData: {
  formRef: Ref;
  formData: {
    username: string;
    password: string;
    expiresIn: boolean;
    showPassword: boolean;
  };
  formRules: {
    username: {
      required: boolean;
      message: string;
      trigger: string;
    }[];
    password: {
      required: boolean;
      message: string;
      trigger: string;
    }[];
  };
  funcLogin: () => Promise<void>;
  funcReset: () => void;
} = {
  formRef: ref(),
  formData: reactive({
    username: ``,
    password: ``,
    expiresIn: true,
    showPassword: false,
  }),
  formRules: {
    username: [{ required: true, message: `请输入用户名`, trigger: `blur` }],
    password: [{ required: true, message: `请输入密码`, trigger: `blur` }],
  },
  funcLogin: async function () {
    if (!loginFormData.formRef.value) return;
    const valid = await loginFormData.formRef.value.validate();
    if (!valid) return;
    const loginSuccess = await login({
      username: loginFormData.formData.username,
      password: loginFormData.formData.password,
      expiresIn: loginFormData.formData.expiresIn ? `7d` : `1h`,
    });
    if (loginSuccess) {
      const router = useRouter();
      router.push(`/`);
    }
  },
  funcReset: function () {
    if (!loginFormData.formRef.value) return;
    loginFormData.formRef.value.resetFields();
  },
};
</script>

<style lang="scss" scoped>
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
:focus-visible {
  outline: 2px solid #409eff;
  outline-offset: 2px;
}
</style>
