<template>
  <div class="person-list-container">
    <!-- 搜索区域 -->
    <div class="search-section">
      <el-card class="search-card" shadow="never">
        <template #header>
          <span class="search-title">搜索区域</span>
        </template>
        <el-form :model="data.searchForm.data" class="search-form">
          <el-row :gutter="20">
            <el-col :xs="24" :sm="12" :md="8" :lg="6">
              <el-form-item label="分类">
                <el-select
                  v-model="data.searchForm.data.classifyIds"
                  multiple
                  placeholder="请选择分类"
                  clearable
                  style="width: 100%"
                  :disabled="data.searchForm.classifyList.length === 0"
                >
                  <el-option
                    v-for="classify in data.searchForm.classifyList"
                    :key="classify.id"
                    :label="classify.name"
                    :value="classify.id"
                  />
                </el-select>
              </el-form-item>
            </el-col>
            <el-col :xs="24" :sm="12" :md="8" :lg="6">
              <el-form-item label="姓名">
                <el-input
                  v-model="data.searchForm.data.name"
                  placeholder="请输入姓名"
                  clearable
                  style="width: 100%"
                  @keyup.enter="data.methods.handleSearch"
                />
              </el-form-item>
            </el-col>
            <el-col :xs="24" :sm="12" :md="8" :lg="6">
              <el-form-item label="证件号码">
                <el-input
                  v-model="data.searchForm.data.id_number"
                  placeholder="请输入身份证/护照号码"
                  clearable
                  maxlength="20"
                  show-word-limit
                  style="width: 100%"
                  @keyup.enter="data.methods.handleSearch"
                />
              </el-form-item>
            </el-col>
            <el-col :xs="24" :sm="12" :md="8" :lg="6">
              <el-form-item class="action-buttons">
                <el-button
                  type="primary"
                  :icon="Search"
                  @click="data.methods.handleSearch"
                  :loading="data.tableData.loading"
                >
                  搜索
                </el-button>
                <el-button :icon="Refresh" @click="data.methods.handleReset">
                  重置
                </el-button>
                <el-tooltip
                  content="请先选择分类后再新增人员"
                  placement="top"
                  :disabled="
                    !(
                      data.searchForm.data.classifyIds.length === 0 &&
                      !data.tableData.loading
                    )
                  "
                >
                  <el-button
                    type="success"
                    :icon="Plus"
                    :disabled="
                      data.tableData.loading ||
                      data.searchForm.data.classifyIds.length === 0
                    "
                    @click="data.methods.handleOpenAddDrawer"
                  >
                    新增人员
                  </el-button>
                </el-tooltip>
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
            <span class="table-title">数据区域</span>
          </div>
        </template>
        <el-table
          :data="data.tableData.list"
          v-loading="data.tableData.loading"
          :border="true"
          :stripe="true"
          style="width: 100%"
          empty-text="暂无数据"
          :default-sort="{ prop: `id`, order: `ascending` }"
        >
          <el-table-column
            v-for="col in data.tableData.columns"
            align="center"
            :type="col.type"
            :key="col.prop"
            :prop="col.prop"
            :label="col.label"
            :width="col.width"
            :min-width="col.minWidth"
            :fixed="col.fixed"
            :formatter="col.formatter"
            :sortable="col.sortable"
            :resizable="false"
          >
            <template v-if="col.label === `操作`" #default="{ row }">
              <div class="action-buttons-container">
                <el-button
                  size="small"
                  type="primary"
                  link
                  @click="data.methods.handleDetail(row)"
                  :disabled="data.tableData.loading"
                >
                  详情
                </el-button>
              </div>
            </template>
            <!-- 证件信息列自定义显示 -->
            <template v-else-if="col.prop === 'credential'" #default="{ row }">
              <div class="credential-container">
                <template v-if="row.credential && row.credential.length > 0">
                  <div
                    v-for="(cred, index) in row.credential.slice(0, 3)"
                    :key="index"
                    class="credential-item"
                  >
                    <el-tag effect="plain" class="credential-tag">
                      {{ cred.type }}: {{ cred.value || "无" }}
                    </el-tag>
                  </div>
                  <el-tooltip
                    v-if="row.credential.length > 3"
                    content="查看更多证件信息"
                  >
                    <el-tag type="info" class="more-tag">
                      +{{ row.credential.length - 3 }}
                    </el-tag>
                  </el-tooltip>
                </template>
                <span v-else class="no-data-text">暂无证件信息</span>
              </div>
            </template>
            <!-- 分类信息列自定义显示 -->
            <template v-else-if="col.prop === 'classify'" #default="{ row }">
              <div class="classify-tags-container">
                <template v-if="row.classify && row.classify.length > 0">
                  <el-tag
                    v-for="(classifyItem, index) in row.classify.slice(0, 3)"
                    :key="index"
                    type="danger"
                    effect="plain"
                    class="classify-tag"
                  >
                    {{ classifyItem }}
                  </el-tag>
                  <el-tooltip
                    v-if="row.classify.length > 3"
                    :content="`共${row.classify.length}个分类`"
                  >
                    <el-tag type="info" class="more-tag">
                      +{{ row.classify.length - 3 }}
                    </el-tag>
                  </el-tooltip>
                </template>
                <span v-else class="no-data-text">暂无分类</span>
              </div>
            </template>
            <!-- 标签信息列自定义显示 -->
            <template v-else-if="col.prop === 'record_tag'" #default="{ row }">
              <div class="record-tag-container">
                <template v-if="row.record_tag && row.record_tag.length > 0">
                  <div
                    v-for="(tagInfo, index) in row.record_tag.slice(0, 2)"
                    :key="index"
                    class="tag-badge-item"
                  >
                    <el-badge
                      :value="tagInfo.count"
                      :max="99"
                      :offset="[8, 8]"
                      :type="data.methods.getBadgeType(tagInfo.count)"
                      :show-zero="false"
                    >
                      <el-tag type="info" effect="plain" class="record-tag">
                        {{ tagInfo.tag_name }}
                      </el-tag>
                    </el-badge>
                  </div>
                  <el-tooltip
                    v-if="row.record_tag.length > 2"
                    :content="`共${row.record_tag.length}个标签`"
                  >
                    <el-tag size="small" type="info" class="more-tag">
                      +{{ row.record_tag.length - 2 }}
                    </el-tag>
                  </el-tooltip>
                </template>
                <span v-else class="no-data-text">暂无标签</span>
              </div>
            </template>
          </el-table-column>
        </el-table>
      </el-card>
    </div>
    <!-- 分页区域 -->
    <el-pagination
      v-model:current-page="data.paginationData.current"
      v-model:page-size="data.paginationData.pageSize"
      :total="data.paginationData.total"
      :page-sizes="[10, 20, 50, 100]"
      :layout="'total, sizes, prev, pager, next, jumper'"
      :background="true"
      :small="false"
      :disabled="data.tableData.loading"
      @size-change="data.methods.handlePageSizeChange"
      @current-change="data.methods.handlePageChange"
    />
    <!-- 详情抽屉 -->
    <PersonDetailDrawer
      ref="detailDrawerRef"
      :status="data.drawerMode"
      :person-id="data.currentDetailId"
      direction="ltr"
      size="50%"
      @close="data.methods.handleDetailClose"
      @edit="data.methods.handleEditFromDrawer"
      @add="data.methods.handleAddFromDrawer"
      @submit-success="data.methods.handleDrawerSubmitSuccess"
    />
  </div>
</template>
<script setup lang="ts">
definePageMeta({
  requiresAuth: true,
  requiredRoles: ["user1", "admin", "superadmin"],
});
import { reactive, ref, nextTick } from "vue";
import type { Classify, PersonPO, PersonVO } from "~/types";
import { ElMessage } from "element-plus";
import { Search, Refresh, Plus } from "@element-plus/icons-vue";
import PersonDetailDrawer from "./detail.vue";
// 路由
const router = useRouter();
// 抽屉Ref
const detailDrawerRef = ref();
// 核心：统一整合所有属性和方法到一个 data 响应式对象中
const data = reactive({
  // 1. 搜索表单相关
  searchForm: {
    classifyList: [] as Classify[],
    data: {
      classifyIds: [] as number[],
      name: "",
      id_number: "",
    },
    loading: false,
  },
  // 2. 表格相关
  tableData: {
    columns: [
      {
        type: `index`,
        label: `序号`,
        width: 80,
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
      },
      {
        prop: `classify`,
        label: `分类`,
        minWidth: 150,
      },
      {
        prop: `record_tag`,
        label: `标签`,
        minWidth: 150,
      },
      {
        prop: `created_time`,
        label: `创建时间`,
        width: 180,
        formatter: (row: any) => {
          if (!row.created_time) return ``;
          // 统一日期格式化，消除SSR差异
          const date = new Date(row.created_time);
          return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")} ${String(date.getHours()).padStart(2, "0")}:${String(date.getMinutes()).padStart(2, "0")}:${String(date.getSeconds()).padStart(2, "0")}`;
        },
        sortable: true,
      },
      {
        prop: `updated_time`,
        label: `更新时间`,
        width: 180,
        formatter: (row: any) => {
          if (!row.updated_time) return ``;
          // 统一日期格式化，消除SSR差异
          const date = new Date(row.updated_time);
          return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")} ${String(date.getHours()).padStart(2, "0")}:${String(date.getMinutes()).padStart(2, "0")}:${String(date.getSeconds()).padStart(2, "0")}`;
        },
        sortable: true,
      },
      {
        label: `操作`,
        width: 100,
        fixed: `right`,
      },
    ],
    list: [] as PersonVO[],
    loading: false,
  },
  // 3. 分页相关
  paginationData: {
    current: 1,
    pageSize: 10,
    total: 0,
  },
  // 4. 抽屉相关
  drawerMode: "view" as "add" | "edit" | "view",
  currentDetailId: undefined as number | undefined,
  // 5. 所有方法统一整合在这里
  methods: {
    // 获取fetchKey（用于useAsyncData缓存）
    getFetchKey: () => {
      return `person-list-data-${data.paginationData.current}-${data.paginationData.pageSize}-${data.searchForm.data.name}-${data.searchForm.data.id_number}-${data.searchForm.data.classifyIds.join(",")}`;
    },
    // 日期格式化（统一复用）
    formatDate: (dateString: string) => {
      if (!dateString) return ``;
      const date = new Date(dateString);
      return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")} ${String(date.getHours()).padStart(2, "0")}:${String(date.getMinutes()).padStart(2, "0")}:${String(date.getSeconds()).padStart(2, "0")}`;
    },
    // 获取徽章类型
    getBadgeType: (count: number) => {
      if (count <= 5) return `warning`;
      if (count <= 20) return `primary`;
      return `danger`;
    },
    // 搜索
    handleSearch: async () => {
      data.paginationData.current = 1;
      await refreshData();
    },
    // 重置
    handleReset: () => {
      data.searchForm.data.classifyIds = [];
      data.searchForm.data.name = ``;
      data.searchForm.data.id_number = ``;
      data.paginationData.current = 1;
      refreshData();
    },
    // 页码改变
    handlePageChange: async (page: number) => {
      data.paginationData.current = page;
      await refreshData();
    },
    // 页大小改变
    handlePageSizeChange: async (size: number) => {
      data.paginationData.pageSize = size;
      data.paginationData.current = 1;
      await refreshData();
    },
    // 查看详情（打开抽屉查看模式）
    handleDetail: (row: PersonVO) => {
      data.currentDetailId = row.id!;
      data.drawerMode = "view";
      nextTick(() => {
        detailDrawerRef.value?.open();
      });
    },
    // 打开新增抽屉（新增模式）
    handleOpenAddDrawer: () => {
      data.drawerMode = "add";
      data.currentDetailId = undefined;
      nextTick(() => {
        detailDrawerRef.value?.open("add");
      });
    },
    // 跳转到编辑页
    handleEdit: (row: PersonVO) => {
      router.push(`/person/${row.id}/edit`);
    },
    // 抽屉关闭（重置状态）
    handleDetailClose: () => {
      data.currentDetailId = undefined;
      data.drawerMode = "view";
    },
    // 抽屉内编辑完成（跳转+刷新）
    handleEditFromDrawer: (personId: number) => {
      detailDrawerRef.value?.close();
      const person = data.tableData.list.find((p) => p.id === personId);
      if (person) {
        data.methods.handleEdit(person);
      }
    },
    // 抽屉内新增完成（刷新列表）
    handleAddFromDrawer: (newPersonData: PersonPO) => {
      detailDrawerRef.value?.close();
      ElMessage.info("新增人员成功，正在刷新列表...");
      refreshData();
    },
    // 抽屉提交成功（统一刷新）
    handleDrawerSubmitSuccess: (type: "add" | "edit") => {
      ElMessage.success(
        `${type === "add" ? "新增" : "编辑"}成功，正在刷新列表...`,
      );
      refreshData();
    },
  },
});
// useAsyncData 获取数据（依赖 data 中的配置）
const {
  data: pageData,
  pending: tableLoading,
  refresh: refreshData,
} = await useAsyncData(
  data.methods.getFetchKey(),
  async () => {
    try {
      const params = {
        classifyIds: data.searchForm.data.classifyIds.join(`,`),
        id_number: data.searchForm.data.id_number,
        name: data.searchForm.data.name,
        page: data.paginationData.current,
        pageSize: data.paginationData.pageSize,
      };
      // 并行获取分类和人员数据
      const [classifyResponse, personResponse] = await Promise.all([
        $fetch(`/api/classify/get`, { method: `GET` }),
        $fetch(`/api/person/get`, { method: `GET`, params }),
      ]);
      return {
        classifyList:
          classifyResponse.code === 200
            ? classifyResponse.data?.list || []
            : [],
        personList:
          personResponse.code === 200
            ? personResponse.data
            : {
                list: [],
                pagination: {
                  page: 1,
                  pageSize: 10,
                  total: 0,
                },
              },
      };
    } catch (error) {
      ElMessage.error(`数据获取失败，请重试`);
      return {
        classifyList: [],
        personList: {
          list: [],
          pagination: {
            page: 1,
            pageSize: 10,
            total: 0,
          },
        },
      };
    }
  },
  {
    server: true,
    immediate: true,
    default: () => ({
      classifyList: [],
      personList: {
        list: [],
        pagination: {
          page: 1,
          pageSize: 10,
          total: 0,
        },
      },
    }),
  },
);
// 响应式更新数据到 data 对象中
watchEffect(() => {
  if (pageData.value) {
    data.searchForm.classifyList = pageData.value.classifyList;
    data.tableData.list = (pageData.value.personList.list as PersonVO[]) || [];
    data.paginationData.current =
      pageData.value.personList.pagination?.page || 1;
    data.paginationData.pageSize =
      pageData.value.personList.pagination.pageSize || 10;
    data.paginationData.total =
      pageData.value.personList.pagination?.total || 0;
  }
});
// 更新加载状态到 data 对象中
watchEffect(() => {
  data.tableData.loading = tableLoading.value;
});
</script>
<style scoped lang="scss">
.person-list-container {
  padding: $spacing-xl;
  display: flex;
  flex-direction: column;
  gap: $spacing-md;
}
.credential-container,
.record-tag-container,
.classify-tags-container {
  display: flex;
  flex-direction: row;
  flex-wrap: wrap;
  align-items: center;
  min-height: 32px;
}
.credential-container {
  gap: $spacing-md;
}
.record-tag-container {
  gap: $spacing-2xl;
}
.classify-tags-container {
  gap: $spacing-sm;
}
.credential-item,
.tag-badge-item {
  display: inline-flex;
  margin-bottom: 4px;
}
.credential-tag,
.record-tag,
.classify-tag {
  white-space: nowrap;
  max-width: 200px;
  overflow: hidden;
  text-overflow: ellipsis;
}
.more-tag {
  flex-shrink: 0;
}
.no-data-text {
  color: #999;
  font-size: 12px;
}
</style>
