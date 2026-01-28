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
definePageMeta({
  layout: false,
});
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
.login-card {
  box-shadow: $shadow-md;
  padding: $spacing-xl;

  .login-title {
    margin-bottom: $spacing-lg;
    font-size: $font-size-lg;
    color: $text-primary;
  }

  .login-form {
    margin-top: $spacing-md;
  }
}
</style>
