<script setup lang="ts">
definePageMeta({
  requiresAuth: true,
  requiredRoles: [`user1`, `admin`, `superadmin`],
});
import { reactive, onMounted, ref } from "vue";
import type { AuthState, Classify, PersonVO, Res } from "~/types";
import { ElMessage } from "element-plus";
import { Search, Refresh, Plus } from "@element-plus/icons-vue";
import PersonDetailDrawer from "./detail.vue";
// 从cookie中获取用户认证数据
// const authCookie = useCookie<AuthState | null>(`auth-data`);
// const currentUserId = ref<number | null>(null);
// 获取当前用户ID
// const getCurrentUserId = (): number | null => {
//   try {
//     if (
//       authCookie.value &&
//       authCookie.value?.user &&
//       authCookie.value!.user.id
//     ) {
//       return Number(authCookie.value!.user.id);
//     }
//     return null;
//   } catch (error) {
//     ElMessage.error(`解析用户ID失败: ${error}`);
//     return null;
//   }
// };
// 获取分类列表
const getClassifyList = async (): Promise<Classify[]> => {
  try {
    // const userId = getCurrentUserId();
    // if (!userId) {
    //   ElMessage.warning("未获取到用户信息，请重新登录");
    //   return [];
    // }
    const response: Res<Classify[]> = await $fetch(`/api/classify/get`, {
      method: `GET`,
      // params: {
      //   auth_id: userId,
      // },
    });
    if (response.code === 200) {
      return response.data?.list || [];
    } else {
      ElMessage.error(response.message || `获取分类失败`);
      return [];
    }
  } catch (error) {
    ElMessage.error(`获取分类失败，请重试: ${error}`);
    return [];
  }
};
// 搜索表单数据与方法
const searchForm = reactive({
  classifyList: [] as Classify[],
  data: {
    classifyIds: [] as number[],
    name: ``,
    id_number: ``,
  },
  loading: false,
  // 初始化分类数据
  fnc_init: async () => {
    try {
      searchForm.loading = true;
      const classifyData = await getClassifyList();
      searchForm.classifyList = classifyData;
    } catch (error) {
      ElMessage.error(`获取分类失败，请重试`);
    } finally {
      searchForm.loading = false;
    }
  },
  // 搜索方法
  btn_search: async () => {
    try {
      tableData.loading = true;
      const params = {
        classifyIds: searchForm.data.classifyIds.join(`,`),
        id_number: searchForm.data.id_number,
        name: searchForm.data.name,
        page: paginationData.current,
        pageSize: paginationData.pageSize,
      };
      const response: Res<PersonVO[]> = await $fetch(`/api/person/get`, {
        method: `GET`,
        params,
      });
      if (response.code === 200) {
        paginationData.current = response.data?.pagination?.page || 1;
        paginationData.pageSize = response.data?.pagination?.pageSize || 10;
        paginationData.total = response.data?.pagination?.total || 0;
        // 使用安全JSON解析工具处理分类数据
        tableData.list = response.data?.list;
      } else {
        ElMessage.error(response.message || `获取人员数据失败`);
      }
    } catch (error) {
      ElMessage.error(`获取人员数据失败，请重试: ${error}`);
    } finally {
      tableData.loading = false;
    }
  },
  // 重置搜索条件
  btn_reset: () => {
    searchForm.data.classifyIds = [];
    searchForm.data.name = ``;
    searchForm.data.id_number = ``;
    paginationData.current = 1;
    searchForm.btn_search();
  },
});
// 表格数据 - 根据API返回结果重写列定义
const tableData = reactive({
  columns: [
    {
      prop: `id`,
      label: `ID`,
      width: 80,
      sortable: true,
    },
    {
      prop: `name`,
      label: `姓名`,
      width: 120,
      sortable: true,
    },
    {
      prop: `gender`,
      label: `性别`,
      width: 80,
      formatter: (row: any) => {
        return row.gender === `男`
          ? `男`
          : row.gender === `女`
            ? `女`
            : row.gender || `未知`;
      },
    },
    {
      prop: `credential`,
      label: `证件信息`,
      minWidth: 250,
      formatter: (row: any) => {
        if (!row.credential || !Array.isArray(row.credential)) return ``;
        return row.credential
          .map((cred: any) => {
            return `${cred.type || `证件`}: ${cred.value || `无`}`;
          })
          .join(`; `);
      },
    },
    {
      prop: `classify`,
      label: `分类`,
      minWidth: 150,
      formatter: (row: any) => {
        if (!row.classify || !Array.isArray(row.classify)) return ``;
        return row.classify.map((c: any) => c.name || `未知分类`).join(`, `);
      },
    },
    {
      prop: `record_tag`,
      label: `标签`,
      minWidth: 150,
      formatter: (row: any) => {
        if (!row.record_tag || !Array.isArray(row.record_tag)) return ``;
        return row.record_tag.map((t: any) => t.name || `未知标签`).join(`, `);
      },
    },
    {
      prop: `created_time`,
      label: `创建时间`,
      width: 180,
      formatter: (row: any) => {
        if (!row.created_time) return ``;
        return new Date(row.created_time).toLocaleString(`zh-CN`);
      },
      sortable: true,
    },
    {
      prop: `updated_time`,
      label: `更新时间`,
      width: 180,
      formatter: (row: any) => {
        if (!row.updated_time) return ``;
        return new Date(row.updated_time).toLocaleString(`zh-CN`);
      },
      sortable: true,
    },
    {
      label: `操作`,
      width: 200,
      fixed: `right`,
    },
  ],
  list: [] as PersonVO[],
  loading: false,
});
// 分页数据
const paginationData = reactive({
  current: 1,
  pageSize: 10,
  total: 0,
  func_currentChange: async (page: number) => {
    paginationData.current = page;
    await searchForm.btn_search();
  },
  func_sizeChange: async (size: number) => {
    paginationData.pageSize = size;
    paginationData.current = 1;
    await searchForm.btn_search();
  },
});
// 路由导航
const router = useRouter();
// 导航方法
const goToCreate = () => {
  router.push(`/person/create`);
};
const goToDetail = (id: number) => {
  router.push(`/person/${id}`);
};
const goToEdit = (id: number) => {
  router.push(`/person/${id}/edit`);
};
// 操作列方法
const handleEdit = (row: PersonVO) => {
  goToEdit(row.id!);
};
const handleDetail = (row: PersonVO) => {
  currentDetailId.value = row.id!;
  // 使用nextTick确保组件已渲染
  nextTick(() => {
    detailDrawerRef.value?.open();
  });
};
const handleDetailClose = () => {
  currentDetailId.value = undefined
}
// 检查用户认证状态
// const checkAuthStatus = () => {
//   const userId = getCurrentUserId();
//   if (!userId) {
//     return false;
//   }
//   currentUserId.value = userId;
//   return true;
// };
const detailDrawerRef = ref();
const currentDetailId = ref<number>();
// 初始化函数
const init = async () => {
  // 先检查认证状态
  // if (!checkAuthStatus()) {
  //   return;
  // }
  await searchForm.fnc_init(); // 初始化分类数据
  await searchForm.btn_search(); // 初始加载人员数据
};
onMounted(async () => {
  await init();
});
</script>
<template>
  <div class="person-list-container">
    <div class="search-section">
      <el-card class="search-card" shadow="never">
        <template #header>
          <div class="search-header">
            <span class="search-title">人员搜索</span>
            <el-tag v-if="searchForm.loading" type="info" size="small">
              加载中...
            </el-tag>
          </div>
        </template>
        <el-form :model="searchForm.data" class="search-form">
          <el-row :gutter="20">
            <el-col :xs="24" :sm="12" :md="8" :lg="6">
              <el-form-item label="分类">
                <el-select
                  v-model="searchForm.data.classifyIds"
                  multiple
                  placeholder="请选择分类"
                  clearable
                  style="width: 100%"
                  :disabled="searchForm.classifyList.length === 0"
                >
                  <el-option
                    v-for="classify in searchForm.classifyList"
                    :key="classify.id"
                    :label="classify.name"
                    :value="classify.id"
                  />
                </el-select>
                <div
                  class="select-tip"
                  v-if="searchForm.classifyList.length === 0"
                >
                  <el-text type="warning">暂无可用分类</el-text>
                </div>
              </el-form-item>
            </el-col>
            <el-col :xs="24" :sm="12" :md="8" :lg="6">
              <el-form-item label="姓名">
                <el-input
                  v-model="searchForm.data.name"
                  placeholder="请输入姓名"
                  clearable
                  style="width: 100%"
                />
              </el-form-item>
            </el-col>
            <el-col :xs="24" :sm="12" :md="8" :lg="6">
              <el-form-item label="证件号码">
                <el-input
                  v-model="searchForm.data.id_number"
                  placeholder="请输入身份证/护照号码"
                  clearable
                  maxlength="20"
                  show-word-limit
                  style="width: 100%"
                />
              </el-form-item>
            </el-col>
            <el-col :xs="24" :sm="12" :md="8" :lg="6">
              <el-form-item class="action-buttons">
                <el-button
                  type="primary"
                  :icon="Search"
                  @click="searchForm.btn_search"
                  :loading="tableData.loading"
                >
                  搜索
                </el-button>
                <el-button :icon="Refresh" @click="searchForm.btn_reset">
                  重置
                </el-button>
                <el-button type="success" :icon="Plus" @click="goToCreate">
                  新增人员
                </el-button>
              </el-form-item>
            </el-col>
          </el-row>
        </el-form>
      </el-card>
    </div>
    <!-- 表格区域 -->
    <div class="table-section">
      <el-card shadow="never">
        <template #header>
          <div class="table-header">
            <span class="table-title">人员列表</span>
            <span class="table-total"
              >共 {{ paginationData.total }} 条记录</span
            >
          </div>
        </template>
        <el-table
          :data="tableData.list"
          v-loading="tableData.loading"
          :border="true"
          :stripe="false"
          style="width: 100%"
          empty-text="暂无数据"
          :default-sort="{ prop: 'id', order: 'ascending' }"
        >
          <el-table-column
            v-for="col in tableData.columns"
            :key="col.prop"
            :prop="col.prop"
            :label="col.label"
            :width="col.width"
            :min-width="col.minWidth"
            :fixed="col.fixed"
            :formatter="col.formatter"
            :sortable="col.sortable"
          >
            <template v-if="col.label === '操作'" #default="{ row }">
              <el-button
                size="small"
                type="primary"
                link
                @click="handleDetail(row)"
              >
                详情
              </el-button>
              <el-button
                size="small"
                type="warning"
                link
                @click="handleEdit(row)"
              >
                编辑
              </el-button>
            </template>
            <!-- 证件信息列自定义显示 -->
            <template v-else-if="col.prop === 'credential'" #default="{ row }">
              <div class="credential-cell">
                <el-descriptions
                  v-if="row.credential && row.credential.length > 0"
                  :column="3"
                  :border="true"
                  size="small"
                  direction="horizontal"
                >
                  <el-descriptions-item
                    v-for="(cred, index) in row.credential"
                    :key="index"
                    :label="cred.type || `证件类型`"
                  >
                    {{ cred.value || "无" }}
                  </el-descriptions-item>
                </el-descriptions>
                <span v-else>暂无证件信息</span>
              </div>
            </template>
            <!-- 分类信息列自定义显示 -->
            <template v-else-if="col.prop === 'classify'" #default="{ row }">
              <div class="classify-tags-container">
                <el-tag
                  v-for="(classifyItem, index) in row.classify"
                  :key="index"
                  size="default"
                  type="danger"
                  effect="plain"
                  class="classify-tag"
                >
                  {{ classifyItem }}
                </el-tag>
                <!-- 如果没有分类信息，显示提示 -->
                <span
                  v-if="!row.classify || row.classify.length === 0"
                  class="no-classify-tip"
                >
                  暂无分类
                </span>
              </div>
            </template>
            <!-- 标签信息列自定义显示 -->
            <template v-else-if="col.prop === 'record_tag'" #default="{ row }">
              <div class="record-tag-container">
                <template
                  v-if="
                    row.record_tag &&
                    row.record_tag.length > 0 &&
                    row.record_tag[0].tag_name
                  "
                >
                  <div
                    v-for="(tagInfo, index) in row.record_tag"
                    :key="index"
                    class="tag-badge-item"
                  >
                    <el-badge
                      :value="tagInfo.count"
                      :max="99"
                      :type="tagInfo.count <= 5 ? `warning` : `danger`"
                      :show-zero="false"
                      :offset="[0, 10]"
                    >
                      <el-tag
                        size="default"
                        type="info"
                        effect="plain"
                        class="record-tag"
                      >
                        {{ tagInfo.tag_name }}
                      </el-tag>
                    </el-badge>
                  </div>
                </template>
                <span v-else class="no-record-tag-tip"> 暂无标签 </span>
              </div>
            </template>
          </el-table-column>
        </el-table>
      </el-card>
    </div>
    <!-- 分页区域 -->
    <div class="pagination-section" v-if="paginationData.total > 0">
      <el-pagination
        v-model:current-page="paginationData.current"
        v-model:page-size="paginationData.pageSize"
        :page-sizes="[10, 20, 50, 100]"
        :total="paginationData.total"
        layout="total, sizes, prev, pager, next, jumper"
        @size-change="paginationData.func_sizeChange"
        @current-change="paginationData.func_currentChange"
      />
    </div>
    <!-- 详情弹窗 -->
    <!-- <PersonDetailDialog
      ref="detailDialogRef"
      :person-id="currentDetailId"
      @close="handleDetailClose"
    /> -->
    <PersonDetailDrawer
      ref="detailDrawerRef"
      :person-id="currentDetailId"
      direction="ltr"
      size="60%"
      @close="handleDetailClose"
    />
  </div>
</template>
<style scoped lang="scss">
// 设计变量
$spacing: 20px;
$spacing-sm: 12px;
$border-radius: 8px;
$gray-light: #909399;
$mobile-breakpoint: 768px;
.person-list-container {
  padding: $spacing;
  // 搜索区域
  .search-section {
    margin-bottom: $spacing;
    .search-card {
      border-radius: $border-radius;
      .search-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        .search-title {
          font-size: 16px;
          font-weight: 600;
          color: #303133;
        }
      }
    }
  }
  // 表格区域
  .table-section {
    margin-bottom: $spacing;
    .table-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      .table-title {
        font-size: 16px;
        font-weight: 600;
      }
      .table-total {
        font-size: 14px;
        color: $gray-light;
      }
    }
  }
  // 分页区域
  .pagination-section {
    display: flex;
    justify-content: center;
    padding: $spacing;
    background: #ffffff;
    border-radius: $border-radius;
  }
  // 标签容器样式
  .classify-tags-container {
    display: flex;
    flex-wrap: wrap;
    gap: 10px;
    align-items: center;
    .classify-tag {
      margin: 1px;
      white-space: nowrap;
    }
    .no-classify-tip {
      color: $gray-light;
      font-size: 12px;
      font-style: italic;
    }
  }
  // 记录标签容器 - 横向排列自动换行
  .record-tag-container {
    display: flex;
    flex-wrap: wrap;
    gap: 10px;
    justify-content: flex-start;
    align-items: flex-start;
    min-height: 32px;
    .tag-badge-item {
      flex-shrink: 0;
      :deep(.el-badge) {
        display: inline-flex;
      }
      :deep(.el-tag) {
        white-space: nowrap;
      }
    }
    .no-record-tag-tip {
      color: $gray-light;
      font-size: 12px;
      line-height: 32px;
    }
  }
  // 响应式设计
  @media (max-width: $mobile-breakpoint) {
    padding: $spacing-sm;
    // 移动端按钮组
    .search-form .action-buttons {
      flex-direction: column;
      .el-button {
        margin-bottom: 8px;
        width: 100%;
      }
    }
    // 移动端表格头部
    .table-header {
      flex-direction: column;
      align-items: flex-start;
      gap: 8px;
    }
    // 移动端标签调整
    .classify-tags-container {
      gap: 2px;
      .classify-tag {
        font-size: 10px;
        padding: 2px 6px;
      }
    }
    .record-tag-container {
      gap: 6px;
      .tag-badge-item :deep(.el-tag) {
        font-size: 12px;
        padding: 4px 8px;
      }
    }
  }
}
// 全局样式调整（可选）
:global(.el-card) {
  border: 1px solid #e4e7ed;
}
:global(.el-table) {
  font-size: 14px;
}
</style>
