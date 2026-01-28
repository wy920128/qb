<!-- components/PersonDetailDrawer.vue -->
<template>
  <el-drawer
    v-model="drawerVisible"
    :with-header="false"
    :direction="direction"
    :size="size"
    :close-on-click-modal="false"
    :close-on-press-escape="true"
    class="person-detail-drawer"
    @close="handleClose"
  >
    <!-- 详情内容 - 复用您现有的详情页面结构 -->
    <div class="person-detail-container" v-loading="loading">
      <!-- 基本信息卡片 -->
      <el-card class="basic-info-card" shadow="hover">
        <template #header>
          <div class="card-header">
            <span class="card-title">基本信息</span>
            <el-divider direction="vertical" />
            <span class="card-subtitle">核心身份信息</span>
          </div>
        </template>
        <el-descriptions :column="2" border class="info-descriptions">
          <el-descriptions-item label="姓名" class="desc-item">
            <span class="desc-value name-value">{{
              personData.name || "暂无"
            }}</span>
          </el-descriptions-item>
          <el-descriptions-item label="性别" class="desc-item">
            <el-tag
              :type="personData.gender === `男` ? `success` : `danger`"
              effect="plain"
              class="gender-tag"
            >
              {{ personData.gender || "未知" }}
            </el-tag>
          </el-descriptions-item>
          <el-descriptions-item label="出生日期" class="desc-item">
            <span class="desc-value">{{
              formatDate(personData.birthday) || "暂无"
            }}</span>
          </el-descriptions-item>
          <el-descriptions-item
            label="分类标签"
            class="desc-item"
            v-if="personData.classify && personData.classify.length > 0"
            :span="2"
          >
            <div class="classify-tags">
              <el-tag
                v-for="(classify, index) in personData.classify"
                :key="index"
                type="danger"
                size="default"
                class="classify-tag"
                effect="dark"
              >
                {{ classify }}
              </el-tag>
            </div>
          </el-descriptions-item>
          <el-descriptions-item label="创建时间" class="desc-item">
            <span class="desc-value">{{
              formatDate(personData.created_time) || "暂无"
            }}</span>
          </el-descriptions-item>
          <el-descriptions-item label="更新时间" class="desc-item">
            <span class="desc-value">{{
              formatDate(personData.updated_time) || "暂无"
            }}</span>
          </el-descriptions-item>
        </el-descriptions>
      </el-card>
      <!-- 联系信息卡片 -->
      <el-card class="contact-info-card" shadow="never">
        <template #header>
          <div class="card-header">
            <span class="card-title">联系信息</span>
            <el-divider direction="vertical" />
            <span class="card-subtitle">联系方式与地址</span>
          </div>
        </template>
        <el-descriptions :column="1" border>
          <!-- 证件信息数组展示 -->
          <el-descriptions-item label="证件信息" class="desc-item">
            <div class="info-array-container">
              <template
                v-if="personData.credential && personData.credential.length > 0"
              >
                <div
                  v-for="(cred, index) in personData.credential"
                  :key="index"
                  class="info-item"
                  hover
                >
                  <el-tag type="primary" size="small" class="info-type-tag"
                    >{{ cred.type }}:</el-tag
                  >
                  <span class="info-value">{{ cred.value }}</span>
                </div>
              </template>
              <div v-else class="empty-data-wrapper">
                <el-icon class="empty-icon"><DocumentEmpty /></el-icon>
                <span class="no-data">暂无证件信息</span>
              </div>
            </div>
          </el-descriptions-item>
          <!-- 联系方式数组展示 -->
          <el-descriptions-item label="联系方式" class="desc-item">
            <div class="info-array-container">
              <template
                v-if="personData.contact && personData.contact.length > 0"
              >
                <div
                  v-for="(contact, index) in personData.contact"
                  :key="index"
                  class="info-item"
                  hover
                >
                  <el-tag type="primary" size="small" class="info-type-tag"
                    >{{ contact.type }}:</el-tag
                  >
                  <span class="info-value">{{ contact.value }}</span>
                </div>
              </template>
              <div v-else class="empty-data-wrapper">
                <el-icon class="empty-icon"><PhoneEmpty /></el-icon>
                <span class="no-data">暂无联系方式</span>
              </div>
            </div>
          </el-descriptions-item>
          <!-- 联系地址数组展示 -->
          <el-descriptions-item label="联系地址" class="desc-item">
            <div class="info-array-container">
              <template
                v-if="personData.address && personData.address.length > 0"
              >
                <div
                  v-for="(addr, index) in personData.address"
                  :key="index"
                  class="info-item"
                  hover
                >
                  <el-tag type="primary" size="small" class="info-type-tag"
                    >{{ addr.type }}:</el-tag
                  >
                  <span class="info-value">{{ addr.value }}</span>
                </div>
              </template>
              <div v-else class="empty-data-wrapper">
                <el-icon class="empty-icon"><LocationEmpty /></el-icon>
                <span class="no-data">暂无地址信息</span>
              </div>
            </div>
          </el-descriptions-item>
        </el-descriptions>
      </el-card>
      <!-- 相关记录表格 -->
      <el-card class="records-card" shadow="hover">
        <template #header>
          <div class="card-header">
            <span class="card-title">相关记录</span>
            <el-badge
              :value="displayedRecords.length"
              class="record-count-badge"
              type="primary"
            />
            <el-divider direction="vertical" />
            <span class="card-subtitle"
              >共 {{ personData.record?.length || 0 }} 条记录</span
            >
          </div>
        </template>
        <!-- 记录表格 -->
        <el-table
          v-loading="loading"
          :data="displayedRecords"
          stripe
          border
          style="width: 100%"
          empty-text=""
          class="records-table"
          :loading-text="`加载中...`"
          :element-loading-spinner="`el-icon-loading`"
          :element-loading-background="`rgba(255, 255, 255, 0.8)`"
        >
          <el-table-column
            align="center"
            prop="id"
            label="记录ID"
            width="80"
            class-name="table-col-id"
          />
          <el-table-column
            align="center"
            prop="content"
            label="记录内容"
            min-width="300"
            show-overflow-tooltip
            class-name="table-col-content"
          />
          <el-table-column
            align="center"
            prop="created_time"
            label="创建时间"
            width="180"
            class-name="table-col-time"
          >
            <template #default="{ row }">
              {{ formatDate(row.created_time) }}
            </template>
          </el-table-column>
          <el-table-column
            align="center"
            label="关联标签"
            min-width="150"
            class-name="table-col-tags"
          >
            <template #default="{ row }">
              <div class="tag-container">
                <el-tag
                  v-for="tag in row.tag"
                  :key="tag.id"
                  type="info"
                  size="small"
                  class="record-tag"
                  effect="plain"
                >
                  {{ tag.name }}
                </el-tag>
                <div
                  v-if="!row.tag || row.tag.length === 0"
                  class="empty-data-wrapper"
                >
                  <span class="no-data">无标签</span>
                </div>
              </div>
            </template>
          </el-table-column>
        </el-table>
        <!-- 空记录提示 -->
        <div
          v-if="!loading && personData.record?.length === 0"
          class="table-empty-wrapper"
        >
          <el-icon class="table-empty-icon"><ListEmpty /></el-icon>
          <span class="table-empty-text">暂无相关记录</span>
        </div>
        <!-- 前端分页控件 -->
        <div
          class="pagination-container"
          v-if="personData.record && personData.record.length > 0"
        >
          <el-pagination
            v-model:current-page="pagination.current"
            v-model:page-size="pagination.size"
            :page-sizes="[5, 10, 20, 50]"
            :total="personData.record.length"
            layout="total, sizes, prev, pager, next, jumper"
            @size-change="pagination.handleSizeChange"
            @current-change="pagination.handleCurrentChange"
            background
            class="custom-pagination"
          />
        </div>
      </el-card>
      <!-- 空状态提示 -->
      <div v-if="!loading && !personData.id" class="empty-state">
        <el-empty description="暂无人员数据" />
      </div>
    </div>
    <template #footer>
      <div class="drawer-footer">
        <el-button @click="handleClose">关闭</el-button>
        <el-button type="primary" @click="handleEdit" v-if="personData.id">
          编辑
        </el-button>
      </div>
    </template>
  </el-drawer>
</template>
<script setup lang="ts">
import { ElMessage } from "element-plus";
import type { PersonRes, Res, TimeStamp } from "~/types";
// Props
interface Props {
  personId?: number;
  direction?: "ltr" | "rtl" | "ttb" | "btt";
  size?: string | number;
}
const props = withDefaults(defineProps<Props>(), {
  personId: undefined,
  direction: "rtl", // 默认从右侧滑出
  size: "90%", // 默认宽度90%，与原Dialog保持一致
});
// Emits
const emit = defineEmits<{
  update: [person: PersonRes];
  edit: [personId: number];
  close: [];
}>();
// 响应式数据
const drawerVisible = ref(false);
const loading = ref(false);
const personData = ref<PersonRes>({
  id: 0,
  name: ``,
  gender: `男`,
  birthday: ``,
  credential: [],
  contact: [],
  address: [],
  record: [],
  created_time: ``,
  updated_time: ``,
  deleted_time: null,
});
const pagination = reactive({
  current: 1,
  size: 10,
  handleSizeChange: (size: number) => {
    pagination.size = size;
    pagination.current = 1;
  },
  handleCurrentChange: (page: number) => {
    pagination.current = page;
  },
});
// 计算属性
const displayedRecords = computed(() => {
  if (!personData.value.record || personData.value.record.length === 0) {
    return [];
  }
  const startIndex = (pagination.current - 1) * pagination.size;
  const endIndex = startIndex + pagination.size;
  return personData.value.record.slice(startIndex, endIndex);
});
// 方法
const formatDate = (dateString: TimeStamp) => {
  if (!dateString) return ``;
  try {
    return new Date(dateString).toLocaleString(`zh-CN`);
  } catch (error) {
    return dateString;
  }
};
const loadPersonData = async () => {
  if (!props.personId) return;
  try {
    loading.value = true;
    const response: Res<PersonRes[]> = await $fetch(
      `/api/person/${props.personId}`,
    );
    if (response.code === 200 && response.data?.list?.[0]) {
      personData.value = response.data.list[0];
      emit(`update`, personData.value);
    } else {
      ElMessage.error(`获取人员信息失败`);
      personData.value = {} as PersonRes;
    }
  } catch (error) {
    ElMessage.error(`获取人员信息失败`);
    console.error(`Error loading person data:`, error);
    personData.value = {} as PersonRes;
  } finally {
    loading.value = false;
  }
};
const handleEdit = () => {
  if (personData.value.id) {
    emit(`edit`, personData.value.id);
    drawerVisible.value = false;
  }
};
const handleClose = () => {
  drawerVisible.value = false;
  emit(`close`);
};
// 监听personId变化
watch(
  () => props.personId,
  (newVal) => {
    if (newVal && drawerVisible.value) {
      loadPersonData();
    }
  },
);
// 暴露方法
const open = () => {
  drawerVisible.value = true;
  if (props.personId) {
    loadPersonData();
  }
};
const close = () => {
  drawerVisible.value = false;
};
// 暴露方法给父组件
defineExpose({
  open,
  close,
});
</script>
<style scoped lang="scss">
.person-info {
  padding: $spacing-xl;

  .info-title {
    font-size: $font-size-lg;
    margin-bottom: $spacing-md;
    padding-bottom: $spacing-sm;
    border-bottom: 1px solid $border-color;
  }

  .info-item {
    margin-bottom: $spacing-sm;
    .info-label {
      color: $text-regular;
      width: 80px;
      display: inline-block;
    }
  }

  .btn {
    margin-top: $spacing-md;
  }
}
</style>
