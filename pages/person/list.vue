<template>
  <div class="person-list-container">
    <div class="search-section">
      <el-card class="search-card" shadow="never">
        <template #header>
          <span class="search-title">人员筛选</span>
        </template>
        <el-form
          :model="pageData.form.data"
          class="search-form"
          ref="pageData.form.ref"
          label-width="100px"
        >
          <el-row :gutter="20">
            <el-col :xs="24" :sm="12" :md="8" :lg="6">
              <el-form-item label="人员姓名" prop="name">
                <el-input
                  v-model="pageData.form.data.name"
                  placeholder="请输入姓名模糊查询"
                  clearable
                  style="width: 100%"
                  @keyup.enter="pageData.form.funcSearch"
                />
              </el-form-item>
            </el-col>
            <el-col :xs="24" :sm="12" :md="8" :lg="6">
              <el-form-item label="人员性别" prop="gender">
                <el-select
                  v-model="pageData.form.data.gender"
                  placeholder="请选择性别"
                  clearable
                  style="width: 100%"
                >
                  <el-option label="男" value="男" />
                  <el-option label="女" value="女" />
                </el-select>
              </el-form-item>
            </el-col>
            <el-col :xs="24" :sm="12" :md="8" :lg="6">
              <el-form-item label="关联分类" prop="classify_id">
                <el-select
                  v-model="pageData.form.data.classifyIds"
                  placeholder="请选择分类"
                  clearable
                  style="width: 100%"
                >
                  <el-option
                    v-for="classify in pageData.form.classifyList"
                    :key="classify.id"
                    :label="classify.name"
                    :value="classify.id"
                  />
                </el-select>
              </el-form-item>
            </el-col>
            <el-col :xs="24" :sm="12" :md="8" :lg="6">
              <el-form-item class="action-buttons">
                <el-button
                  type="primary"
                  icon="Search"
                  @click="pageData.form.funcSearch"
                  :loading="pageData.status.loading"
                >
                  查询
                </el-button>
                <el-button icon="Refresh" @click="pageData.form.funcReset">
                  重置
                </el-button>
                <el-button
                  type="success"
                  icon="Plus"
                  :disabled="pageData.status.loading"
                  @click="pageData.drawer.funcOpen(`add`)"
                >
                  新增人员
                </el-button>
              </el-form-item>
            </el-col>
          </el-row>
        </el-form>
      </el-card>
    </div>
    <div class="table-section">
      <el-card shadow="never">
        <template #header>
          <div class="table-header">
            <span class="table-title">人员列表</span>
            <span class="table-count"
              >共 {{ pageData.pagination.total }} 条数据</span
            >
          </div>
        </template>
        <el-table
          :data="pageData.table.data"
          v-loading="pageData.status.loading"
          border
          stripe
          style="width: 100%"
          empty-text="暂无符合条件的人员数据"
          :default-sort="{ prop: `id`, order: `ascending` }"
        >
          <el-table-column
            type="index"
            label="序号"
            width="80"
            align="center"
          />
          <el-table-column
            prop="name"
            label="姓名"
            width="120"
            align="center"
            sortable
          />
          <el-table-column prop="gender" label="性别" width="80" align="center">
            <template #default="{ row }">
              <el-tag
                :type="row.gender === '男' ? 'primary' : 'danger'"
                effect="plain"
              >
                {{ row.gender }}
              </el-tag>
            </template>
          </el-table-column>
          <el-table-column
            prop="birthday"
            label="出生日期"
            width="120"
            align="center"
          >
            <template #default="{ row }">
              {{ formatDate(row.birthday) || "暂无" }}
            </template>
          </el-table-column>
          <el-table-column
            prop="classify"
            label="关联分类"
            min-width="150"
            align="center"
          >
            <template #default="{ row }">
              <div class="classify-tags">
                <el-tag
                  v-for="(item, index) in Array.isArray(row.classify)
                    ? row.classify
                    : [row.classify]"
                  :key="index"
                  size="small"
                  effect="plain"
                >
                  {{ item || "无" }}
                </el-tag>
              </div>
            </template>
          </el-table-column>
          <el-table-column
            prop="record_tag"
            label="关联标签"
            min-width="180"
            align="center"
          >
            <template #default="{ row }">
              <div class="tag-badges">
                <el-badge
                  v-for="(tag, index) in row.record_tag || []"
                  :key="index"
                  :value="tag.count"
                  :max="99"
                  type="info"
                  size="small"
                >
                  <el-tag size="small" effect="plain">{{
                    tag.tag_name
                  }}</el-tag>
                </el-badge>
                <span
                  v-if="!(row.record_tag && row.record_tag.length)"
                  class="no-data"
                  >无标签</span
                >
              </div>
            </template>
          </el-table-column>
          <el-table-column
            prop="created_time"
            label="创建时间"
            width="180"
            align="center"
            sortable
          >
            <template #default="{ row }">
              {{ formatDate(row.created_time) || "暂无" }}
            </template>
          </el-table-column>
          <el-table-column
            label="操作"
            width="120"
            align="center"
            fixed="right"
          >
            <template #default="{ row }">
              <el-button
                size="small"
                type="primary"
                link
                @click="pageData.drawer.funcOpen(`view`, row.id)"
                :disabled="pageData.status.loading"
              >
                详情
              </el-button>
              <el-button
                size="small"
                type="success"
                link
                @click="pageData.drawer.funcOpen(`edit`, row.id)"
                :disabled="pageData.status.loading"
              >
                编辑
              </el-button>
            </template>
          </el-table-column>
        </el-table>
      </el-card>
    </div>
    <el-pagination
      v-model:current-page="pageData.pagination.page"
      v-model:page-size="pageData.pagination.pageSize"
      :total="pageData.pagination.total"
      :page-sizes="[10, 20, 50, 100]"
      layout="total, sizes, prev, pager, next, jumper"
      background
      :disabled="pageData.status.loading"
      class="pagination-wrapper"
    />
    <PersonDetailDrawer
      :visible="pageData.drawer.status.visible"
      @update:visible="pageData.drawer.status.visible = $event"
      :mode="pageData.drawer.status.mode"
      @update:mode="pageData.drawer.status.mode = $event"
      :person-id="pageData.drawer.data.personId"
      :default-classify-ids="
        pageData.form.data.classifyIds ? pageData.form.data.classifyIds : []
      "
      @submit-success="pageData.form.funcSearch"
      @close="pageData.drawer.funcReset"
    />
  </div>
</template>

<script setup lang="ts">
definePageMeta({
  requiresAuth: true,
  requiredRoles: [`user1`, `admin`, `superadmin`],
});
import { ElMessage, type FormInstance } from "element-plus";
import PersonDetailDrawer from "./detail.vue";
import type { PersonGO, PersonRes, Classify, Res, PersonVO } from "~/types";
import { formatDate } from "~/utils/formatData.util";
const pageData: {
  status: {
    loading: boolean;
  };
  drawer: {
    status: {
      visible: boolean;
      mode: `add` | `view` | `edit`;
    };
    data: {
      personId: number;
    };
    funcOpen: (mode: `view` | `add` | `edit`, personId?: number) => void;
    funcClose: () => void;
    funcReset: () => void;
  };
  form: {
    classifyList: Classify[];
    data: PersonGO;
    ref: Ref<FormInstance | null>;
    funcGetClassifyList: () => Promise<void>;
    funcSearch: () => Promise<void>;
    funcReset: () => void;
  };
  table: {
    data: PersonVO[];
    funcGetPersonList: () => Promise<void>;
  };
  pagination: {
    page: number;
    pageSize: number;
    total: number;
  };
} = {
  status: reactive({
    loading: false,
  }),
  form: {
    classifyList: reactive([]),
    data: reactive({
      name: ``,
      gender: undefined,
      classifyIds: undefined,
      id: undefined,
      deleted_time: null,
    }),
    ref: ref(null),
    funcGetClassifyList: async () => {
      try {
        const response = await $fetch<Res<Classify[]>>(`/api/classify/get`, {
          method: `GET`,
        });
        if (response.code === 200) {
          pageData.form.classifyList.splice(
            0,
            pageData.form.classifyList.length,
            ...(response.data?.list || []),
          );
        }
      } catch (error) {
        ElMessage.error(`加载分类列表失败：${error}`);
        console.error(`分类列表加载异常：`, error);
      }
    },
    funcSearch: async () => {
      await pageData.table.funcGetPersonList();
    },
    funcReset: () => {
      if (pageData.form.ref.value) {
        pageData.form.ref.value.resetFields();
      }
    },
  },
  table: reactive({
    data: [],
    funcGetPersonList: async () => {
      try {
        pageData.status.loading = true;
        const queryParams: PersonGO = {
          ...pageData.form.data,
          page: pageData.pagination.page,
          pageSize: pageData.pagination.pageSize,
        };
        const response = await $fetch<Res<PersonRes[]>>(`/api/person/get`, {
          method: `GET`,
          params: queryParams,
        });
        if (response.code === 200) {
          pageData.table.data.splice(
            0,
            pageData.table.data.length,
            ...(response.data?.list.map((item) => {
              const { record, ...restItem } = item;
              return restItem;
            }) || []),
          );
          pageData.pagination.total = response.data?.pagination.total || 0;
        } else {
          ElMessage.error(`获取人员列表失败：${response.message}`);
        }
      } catch (error) {
        ElMessage.error(`获取人员列表失败，请重试：${error}`);
        console.error("人员列表查询异常：", error);
      } finally {
        console.log(pageData.table.data);
        pageData.status.loading = false;
      }
    },
  }),
  pagination: reactive({
    page: 1,
    pageSize: 10,
    total: 0,
  }),
  drawer: {
    status: reactive({
      visible: false,
      mode: `view`,
    }),
    data: reactive({
      personId: 0,
    }),
    funcOpen: (mode, personId) => {
      pageData.drawer.status.visible = true;
      pageData.drawer.status.mode = mode;
      pageData.drawer.data.personId = personId || 0;
    },
    funcClose: () => {
      pageData.drawer.status.visible = false;
    },
    funcReset: () => {
      pageData.drawer.status.visible = false;
      pageData.drawer.status.mode = `view`;
      pageData.drawer.data.personId = 0;
    },
  },
};
watchEffect(async () => {
  await pageData.form.funcGetClassifyList();
  await pageData.table.funcGetPersonList();
});
watch(
  () => pageData.form.data.classifyIds,
  async () => {
    if (pageData.status.loading) return;
    pageData.pagination.page = 1;
    await pageData.table.funcGetPersonList();
  },
);
</script>

<style scoped lang="scss">
.person-list-container {
  padding: 20px;
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.search-form {
  margin-top: 10px;
}

.action-buttons {
  display: flex;
  gap: 8px;
  margin-top: 24px;
}

.table-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.table-count {
  font-size: 12px;
  color: #999;
}

.classify-tags,
.tag-badges {
  display: flex;
  flex-wrap: wrap;
  gap: 4px;
  justify-content: center;
}

.no-data {
  font-size: 12px;
  color: #999;
}

.pagination-wrapper {
  display: flex;
  justify-content: flex-end;
  margin-top: 16px;
}
</style>
