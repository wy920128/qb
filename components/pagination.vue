<!--
 * @Author: 王野 18545455617@163.com
 * @Date: 2026-01-29 07:47:16
 * @LastEditors: 王野 18545455617@163.com
 * @LastEditTime: 2026-01-29 09:45:47
 * @FilePath: /qb/components/pagination.vue
 * @Description: 组件 - 分页
-->
<template>
  <div
    v-if="shouldShowPagination"
    class="flex justify-center mt-6 pagination-container"
    :class="{ 'pointer-events-none opacity-50': disabled }"
  >
    <el-pagination
      v-model:current-page="internalCurrentPage"
      v-model:page-size="internalPageSize"
      :page-sizes="pageSizes"
      :total="total"
      :layout="layout"
      :background="background"
      :small="small"
      :disabled="disabled"
      :hide-on-single-page="hideOnSinglePage"
      :pager-count="pagerCount"
      class="bg-white p-4 rounded-lg shadow-sm custom-pagination"
      @size-change="handleSizeChange"
      @current-change="handleCurrentChange"
      @prev-click="emit('prev-click', $event)"
      @next-click="emit('next-click', $event)"
    />
  </div>
</template>

<script setup lang="ts">
import { computed, watch } from "vue";

interface Props {
  // 分页数据
  currentPage?: number;
  pageSize?: number;
  total: number;

  // 配置选项
  pageSizes?: number[];
  layout?: string;
  background?: boolean;
  small?: boolean;
  disabled?: boolean;
  hideOnSinglePage?: boolean;
  pagerCount?: number;

  // 自定义样式类
  paginationClass?: string;
}

const props = withDefaults(defineProps<Props>(), {
  currentPage: 1,
  pageSize: 10,
  pageSizes: () => [10, 20, 50, 100],
  layout: "total, sizes, prev, pager, next, jumper",
  background: true,
  small: false,
  disabled: false,
  hideOnSinglePage: true,
  pagerCount: 7,
  paginationClass: "",
});

const emit = defineEmits<{
  // 核心事件
  "size-change": [pageSize: number];
  "current-change": [currentPage: number];
  "update:current-page": [currentPage: number];
  "update:page-size": [pageSize: number];

  // 扩展事件
  "prev-click": [currentPage: number];
  "next-click": [currentPage: number];
}>();

// 响应式数据
const internalCurrentPage = defineModel<number>("currentPage", { default: 1 });
const internalPageSize = defineModel<number>("pageSize", { default: 10 });

// 计算属性
const shouldShowPagination = computed(() => {
  if (props.hideOnSinglePage) {
    const totalPages = Math.ceil(props.total / internalPageSize.value);
    return totalPages > 1;
  }
  return props.total > 0;
});

const totalPages = computed(() => {
  return Math.ceil(props.total / internalPageSize.value);
});

// 事件处理
const handleSizeChange = (newSize: number) => {
  internalPageSize.value = newSize;
  internalCurrentPage.value = 1; // 重置到第一页
  emit("size-change", newSize);
  emit("update:page-size", newSize);
  emit("current-change", 1);
  emit("update:current-page", 1);
};

const handleCurrentChange = (newPage: number) => {
  internalCurrentPage.value = newPage;
  emit("current-change", newPage);
  emit("update:current-page", newPage);
};

// 监听总条数变化，自动校正当前页
watch(
  () => props.total,
  (newTotal, oldTotal) => {
    if (newTotal === 0) {
      internalCurrentPage.value = 1;
      return;
    }

    const maxPage = Math.ceil(newTotal / internalPageSize.value);
    if (internalCurrentPage.value > maxPage) {
      internalCurrentPage.value = maxPage;
      emit("current-change", maxPage);
      emit("update:current-page", maxPage);
    }
  },
);

// 暴露给父组件的方法
defineExpose({
  reset() {
    internalCurrentPage.value = 1;
    internalPageSize.value = props.pageSizes?.[0] || 10;
  },

  goToFirst() {
    internalCurrentPage.value = 1;
    emit("current-change", 1);
  },

  goToLast() {
    const lastPage = totalPages.value;
    internalCurrentPage.value = lastPage;
    emit("current-change", lastPage);
  },

  getPaginationInfo() {
    return {
      currentPage: internalCurrentPage.value,
      pageSize: internalPageSize.value,
      total: props.total,
      totalPages: totalPages.value,
      startIndex: (internalCurrentPage.value - 1) * internalPageSize.value,
      endIndex: Math.min(
        internalCurrentPage.value * internalPageSize.value,
        props.total,
      ),
    };
  },
});
</script>

<style scoped>
.pagination-container {
  transition: all 0.3s ease;
}

.custom-pagination {
  --el-pagination-bg-color: var(--el-bg-color);
  --el-pagination-button-bg-color: var(--el-fill-color-light);
}

.custom-pagination :deep(.el-pagination__total) {
  font-weight: 500;
  color: var(--el-text-color-regular);
}

.custom-pagination :deep(.el-pagination__jump) {
  font-weight: 500;
}

/* 移动端适配 */
@media (max-width: 640px) {
  .custom-pagination :deep(.el-pagination__sizes) {
    margin: 0 8px 0 0;
  }

  .custom-pagination :deep(.el-pagination__jump) {
    margin-left: 8px;
  }
}
</style>
