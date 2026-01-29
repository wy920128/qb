<template>
  <div class="person-list-container">
    <!-- 搜索区域 -->
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
              </el-form-item>
            </el-col>

            <el-col :xs="24" :sm="12" :md="8" :lg="6">
              <el-form-item label="姓名">
                <el-input
                  v-model="searchForm.data.name"
                  placeholder="请输入姓名"
                  clearable
                  style="width: 100%"
                  @keyup.enter="handleSearch"
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
                  @keyup.enter="handleSearch"
                />
              </el-form-item>
            </el-col>

            <el-col :xs="24" :sm="12" :md="8" :lg="6">
              <el-form-item class="action-buttons">
                <el-button
                  type="primary"
                  :icon="Search"
                  @click="handleSearch"
                  :loading="tableData.loading"
                >
                  搜索
                </el-button>
                <el-button :icon="Refresh" @click="handleReset">
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
          :stripe="true"
          style="width: 100%"
          empty-text="暂无数据"
          :default-sort="{ prop: 'id', order: 'ascending' }"
          @sort-change="handleSortChange"
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
              <div class="action-buttons-container">
                <el-button
                  size="small"
                  type="primary"
                  link
                  @click="handleDetail(row)"
                  :disabled="tableData.loading"
                >
                  详情
                </el-button>
              </div>
            </template>

            <!-- 证件信息列自定义显示 -->
            <template v-else-if="col.prop === 'credential'" #default="{ row }">
              <div class="credential-cell">
                <template v-if="row.credential && row.credential.length > 0">
                  <div
                    v-for="(cred, index) in row.credential.slice(0, 2)"
                    :key="index"
                    class="credential-item"
                  >
                    <el-tag size="small" effect="plain" class="credential-tag">
                      {{ cred.type }}: {{ cred.value || "无" }}
                    </el-tag>
                  </div>
                  <el-tooltip
                    v-if="row.credential.length > 2"
                    content="查看更多证件信息"
                  >
                    <el-tag size="small" type="info" class="more-tag">
                      +{{ row.credential.length - 2 }}
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
                    size="small"
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
                    <el-tag size="small" type="info" class="more-tag">
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
                      :type="getBadgeType(tagInfo.count)"
                      :show-zero="false"
                    >
                      <el-tag
                        size="small"
                        type="info"
                        effect="plain"
                        class="record-tag"
                      >
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

    <!-- 分页区域 - 使用优化后的分页组件 -->
    <Pagination
      v-model:current-page="paginationData.current"
      v-model:page-size="paginationData.pageSize"
      :total="paginationData.total"
      :page-sizes="[10, 20, 50, 100]"
      :layout="'total, sizes, prev, pager, next, jumper'"
      :background="true"
      :small="false"
      :disabled="tableData.loading"
      @size-change="handlePageSizeChange"
      @current-change="handlePageChange"
      @prev-click="handlePrevPage"
      @next-click="handleNextPage"
    />

    <!-- 详情抽屉 -->
    <PersonDetailDrawer
      ref="detailDrawerRef"
      :person-id="currentDetailId"
      direction="rtl"
      size="50%"
      @close="handleDetailClose"
      @edit="handleEditFromDrawer"
    />
  </div>
</template>

<script setup lang="ts">
definePageMeta({
  requiresAuth: true,
  requiredRoles: ["user1", "admin", "superadmin"],
});

import { reactive, onMounted, ref, nextTick } from "vue";
import type { Classify, PersonVO, Res } from "~/types";
import { ElMessage, ElMessageBox } from "element-plus";
import { Search, Refresh, Plus } from "@element-plus/icons-vue";
import PersonDetailDrawer from "./detail.vue";
import Pagination from "~/components/pagination.vue";

// 搜索表单数据
const searchForm = reactive({
  classifyList: [] as Classify[],
  data: {
    classifyIds: [] as number[],
    name: "",
    id_number: "",
  },
  loading: false,
});

// 表格数据
const tableData = reactive({
  columns: [
    {
      prop: "id",
      label: "ID",
      width: 80,
      sortable: true,
    },
    {
      prop: "name",
      label: "姓名",
      width: 120,
      sortable: true,
    },
    {
      prop: "gender",
      label: "性别",
      width: 80,
      formatter: (row: any) => {
        return row.gender === "男"
          ? "男"
          : row.gender === "女"
            ? "女"
            : row.gender || "未知";
      },
    },
    {
      prop: "credential",
      label: "证件信息",
      minWidth: 250,
    },
    {
      prop: "classify",
      label: "分类",
      minWidth: 150,
    },
    {
      prop: "record_tag",
      label: "标签",
      minWidth: 150,
    },
    {
      prop: "created_time",
      label: "创建时间",
      width: 180,
      formatter: (row: any) => {
        if (!row.created_time) return "";
        return new Date(row.created_time).toLocaleString("zh-CN");
      },
      sortable: true,
    },
    {
      prop: "updated_time",
      label: "更新时间",
      width: 180,
      formatter: (row: any) => {
        if (!row.updated_time) return "";
        return new Date(row.updated_time).toLocaleString("zh-CN");
      },
      sortable: true,
    },
    {
      label: "操作",
      width: 200,
      fixed: "right",
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
});

// 详情抽屉相关
const detailDrawerRef = ref();
const currentDetailId = ref<number>();

// 路由
const router = useRouter();

// 方法定义
const getClassifyList = async (): Promise<Classify[]> => {
  try {
    const response: Res<Classify[]> = await $fetch("/api/classify/get", {
      method: "GET",
    });

    if (response.code === 200) {
      return response.data?.list || [];
    } else {
      ElMessage.error(response.message || "获取分类失败");
      return [];
    }
  } catch (error) {
    ElMessage.error("获取分类失败，请重试");
    return [];
  }
};

const loadPersonData = async () => {
  try {
    tableData.loading = true;
    const params = {
      classifyIds: searchForm.data.classifyIds.join(","),
      id_number: searchForm.data.id_number,
      name: searchForm.data.name,
      page: paginationData.current,
      pageSize: paginationData.pageSize,
    };

    const response: Res<PersonVO[]> = await $fetch("/api/person/get", {
      method: "GET",
      params,
    });

    if (response.code === 200) {
      paginationData.current = response.data?.pagination?.page || 1;
      paginationData.pageSize = response.data?.pagination?.pageSize || 10;
      paginationData.total = response.data?.pagination?.total || 0;
      tableData.list = response.data?.list || [];
    } else {
      ElMessage.error(response.message || "获取人员数据失败");
      tableData.list = [];
    }
  } catch (error) {
    ElMessage.error("获取人员数据失败，请重试");
    tableData.list = [];
  } finally {
    tableData.loading = false;
  }
};

const initializeClassify = async () => {
  try {
    searchForm.loading = true;
    const classifyData = await getClassifyList();
    searchForm.classifyList = classifyData;
  } catch (error) {
    console.error("初始化分类数据失败:", error);
  } finally {
    searchForm.loading = false;
  }
};

// 事件处理
const handleSearch = async () => {
  paginationData.current = 1;
  await loadPersonData();
};

const handleReset = () => {
  searchForm.data.classifyIds = [];
  searchForm.data.name = "";
  searchForm.data.id_number = "";
  paginationData.current = 1;
  loadPersonData();
};

const handlePageChange = async (page: number) => {
  paginationData.current = page;
  await loadPersonData();
};

const handlePageSizeChange = async (size: number) => {
  paginationData.pageSize = size;
  paginationData.current = 1;
  await loadPersonData();
};

const handlePrevPage = (page: number) => {
  console.log("上一页:", page);
};

const handleNextPage = (page: number) => {
  console.log("下一页:", page);
};

const handleSortChange = ({ prop, order }: any) => {
  console.log("排序变化:", prop, order);
  // 可以在这里添加排序逻辑
};

const getBadgeType = (count: number) => {
  if (count <= 5) return "warning";
  if (count <= 20) return "primary";
  return "danger";
};

// 人员操作
const handleDetail = (row: PersonVO) => {
  currentDetailId.value = row.id!;
  nextTick(() => {
    detailDrawerRef.value?.open();
  });
};

const handleEdit = (row: PersonVO) => {
  router.push(`/person/${row.id}/edit`);
};

const handleDetailClose = () => {
  currentDetailId.value = undefined;
};

const handleEditFromDrawer = (personId: number) => {
  detailDrawerRef.value?.close();
  handleEdit(tableData.list.find((p) => p.id === personId)!);
};

const goToCreate = () => {
  router.push("/person/create");
};

// 初始化
const init = async () => {
  await initializeClassify();
  await loadPersonData();
};

onMounted(() => {
  init();
});
</script>
