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
// 引入全局样式变量/混合宏（若已全局注入可删除此行）
@import "@/styles/global.scss";

/* 页面容器：复用全局flex-center混合宏，替换硬编码颜色/间距 */
.login-container {
  min-height: 100vh;
  @include flex-center; // 复用全局弹性居中混合宏
  background: linear-gradient(
    135deg,
    $primary-light,
    $primary-dark
  ); // 复用全局渐变主色
  position: relative;
  overflow: hidden;
}

/* 背景纹理：保留专属视觉，简化嵌套 */
.login-bg {
  position: absolute;
  inset: 0; // 替代top/left/width/height:100%
  .bg-pattern {
    width: 100%;
    height: 100%;
    background:
      radial-gradient(
        circle at 20% 80%,
        rgba($primary-light, 0.3) 0%,
        transparent 50%
      ),
      radial-gradient(circle at 80% 20%, rgba($white, 0.1) 0%, transparent 50%),
      radial-gradient(circle at 40% 40%, rgba($white, 0.05) 0%, transparent 50%);
  }
}

/* 登录卡片：复用全局common-card类，删除重复的基础样式 */
.login-card {
  width: 420px;
  border: none;
  border-radius: $card-radius-lg; // 复用全局大圆角变量
  backdrop-filter: blur(10px);
  background: rgba($white, 0.95);
  box-shadow:
    $shadow-card,
    0 0 0 1px rgba($white, 0.2); // 复用全局卡片阴影变量
  transition: all $transition-base; // 复用全局过渡变量
  &:hover {
    transform: translateY(-4px);
    box-shadow:
      $shadow-card-hover,
      0 0 0 1px rgba($white, 0.3); // 复用全局hover阴影
  }

  // 精简深度选择器，复用全局间距变量
  :deep(.el-card__header) {
    padding: $gap-xl $gap-xl $gap-md; // 复用全局间距变量
    border-bottom: 1px solid $border-color-light; // 复用全局浅边框色
  }
  :deep(.el-card__body) {
    padding: $gap-md $gap-xl $gap-xl; // 复用全局间距变量
  }
}

/* 登录头部：替换硬编码字体/颜色/间距 */
.login-header {
  text-align: center;
  margin-bottom: 0;

  .login-icon {
    margin-bottom: $gap-md; // 复用全局间距变量
    background: linear-gradient(
      135deg,
      $primary-color,
      $primary-light
    ); // 复用全局主色
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
  }

  .login-title {
    font-size: $font-size-xl; // 复用全局字体变量
    font-weight: 600;
    color: $text-color-primary; // 复用全局主文本色
    margin: 0 0 $gap-sm 0; // 复用全局间距变量
    background: linear-gradient(
      135deg,
      $text-color-primary,
      $text-color-regular
    ); // 复用全局文本色
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
  }

  .login-subtitle {
    font-size: $font-size-sm; // 复用全局字体变量
    color: $text-color-placeholder; // 复用全局占位文本色
    margin: 0;
  }
}

/* 登录表单：精简冗余样式，复用全局变量 */
.login-form {
  .button-group {
    margin-bottom: 0;
  }

  .button-row {
    width: 100%;
  }

  // 登录按钮：删除重复transition，复用全局变量
  .login-btn {
    width: 100%;
    height: 48px;
    font-size: $font-size-md; // 复用全局字体变量
    font-weight: 500;
    border-radius: $btn-radius; // 复用全局按钮圆角
    border: none;
    background: linear-gradient(
      135deg,
      $primary-color,
      $primary-light
    ); // 复用全局主色
    transition: all $transition-base; // 复用全局过渡变量

    &:hover:not(.is-disabled) {
      transform: translateY(-1px);
      box-shadow: 0 8px 20px rgba($primary-color, 0.3); // 基于全局主色动态计算
    }

    .btn-icon {
      margin-right: $gap-sm; // 复用全局间距变量
    }
  }

  // 重置按钮：替换硬编码颜色/圆角，复用全局变量
  .reset-btn {
    width: 100%;
    height: 48px;
    font-size: $font-size-md; // 复用全局字体变量
    font-weight: 500;
    border-radius: $btn-radius; // 复用全局按钮圆角
    border: 1px solid $border-color; // 复用全局边框色
    background: $bg-color-base; // 复用全局基础背景色
    color: $text-color-regular; // 复用全局常规文本色
    transition: all $transition-base; // 复用全局过渡变量

    &:hover:not(.is-disabled) {
      background: $bg-color-hover; // 复用全局hover背景色
      border-color: $border-color-hover; // 复用全局hover边框色
    }
  }

  // 密码切换图标：替换硬编码颜色，复用全局变量
  .password-toggle {
    cursor: pointer;
    color: $text-color-placeholder; // 复用全局占位文本色
    transition: color $transition-base; // 复用全局过渡变量

    &:hover {
      color: $primary-color; // 复用全局主色
    }
  }
}

/* 错误提示：复用全局圆角变量 */
.error-message {
  margin-top: $gap-md; // 复用全局间距变量
  :deep(.el-alert) {
    border-radius: $btn-radius; // 复用全局按钮圆角
  }
}

/* 响应式：复用全局混合宏，精简重复媒体查询 */
@include tablet-only {
  // 复用全局平板端混合宏（768px以下）
  .login-container {
    padding: $gap-md; // 复用全局间距变量
  }
  .login-card {
    width: 100%;
    max-width: 400px;
    :deep(.el-card__header) {
      padding: $gap-lg $gap-md $gap-sm; // 复用全局间距变量
    }
    :deep(.el-card__body) {
      padding: $gap-sm $gap-md $gap-lg; // 复用全局间距变量
    }
  }
  .login-header .login-title {
    font-size: $font-size-lg; // 复用全局字体变量
  }
}

@include mobile-only {
  // 复用全局移动端混合宏（480px以下）
  .login-card {
    :deep(.el-card__header) {
      padding: $gap-md $gap-sm $gap-xs; // 复用全局间距变量
    }
    :deep(.el-card__body) {
      padding: $gap-xs $gap-sm $gap-md; // 复用全局间距变量
    }
  }
  .login-header {
    margin-bottom: 0;
    .login-title {
      font-size: $font-size-md-lg; // 复用全局字体变量（中等偏大）
    }
  }
}

/* 焦点样式：替换硬编码主色，复用全局变量 */
:focus-visible {
  outline: 2px solid $primary-color; // 复用全局主色
  outline-offset: 2px;
}
</style>
