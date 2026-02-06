<!--
 * @Author: 王野 18545455617@163.com
 * @Date: 2026-01-29 09:42:05
 * @LastEditors: 王野 18545455617@163.com
 * @LastEditTime: 2026-02-04 14:11:56
 * @FilePath: /qb/layouts/footer.vue
 * @Description: 布局 - 底部
-->
<template>
  <el-footer class="footer">
    <div class="footer-content">
      <p>&copy; 2026 重点人管理系统. All rights reserved.</p>
    </div>
  </el-footer>
</template>
<style scoped lang="scss">
.footer {
  background: #f0f2f5;
  border-top: 1px solid #e8e8e8;
  display: flex;
  align-items: center;
  justify-content: center;
  height: 60px;
  .footer-content {
    text-align: center;
    color: #666;
    font-size: 14px;
  }
}
</style>
