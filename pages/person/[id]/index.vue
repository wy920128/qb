<template>
  <!-- 外层容器：增加整体视觉包裹感 -->
  <div class="person-detail-container">
    <!-- 顶部操作栏：新增，提升操作便捷性 -->
    <div class="page-header">
      <h2 class="page-title">人员详情</h2>
      <div class="page-actions">
        <el-button
          type="primary"
          :icon="Refresh"
          @click="handleRefresh"
          class="action-btn"
        >
          刷新数据
        </el-button>
        <el-button
          type="success"
          :icon="Printer"
          @click="handlePrint"
          class="action-btn"
        >
          打印详情
        </el-button>
        <el-button
          type="warning"
          :icon="Download"
          @click="handleExport"
          class="action-btn"
        >
          导出数据
        </el-button>
      </div>
    </div>

    <!-- 上部：基本信息卡片 -->
    <el-card class="basic-info-card" shadow="hover">
      <template #header>
        <div class="card-header">
          <span class="card-title">基本信息</span>
          <el-divider direction="vertical" />
          <span class="card-subtitle">核心身份信息</span>
        </div>
      </template>

      <el-descriptions
        :column="isMobile ? 1 : 2"
        border
        class="info-descriptions"
      >
        <el-descriptions-item label="人员ID" class="desc-item">
          <span class="desc-value">{{ personData.id || "暂无" }}</span>
        </el-descriptions-item>
        <el-descriptions-item label="姓名" class="desc-item">
          <span class="desc-value name-value">{{
            personData.name || "暂无"
          }}</span>
        </el-descriptions-item>
        <el-descriptions-item label="性别" class="desc-item">
          <el-tag
            :type="personData.gender === '男' ? 'primary' : 'danger'"
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
        <el-descriptions-item
          label="分类标签"
          class="desc-item"
          v-if="personData.classify && personData.classify.length > 0"
          :span="isMobile ? 1 : 2"
        >
          <div class="classify-tags">
            <el-tag
              v-for="(classify, index) in personData.classify"
              :key="index"
              type="info"
              size="small"
              class="classify-tag"
              effect="plain"
            >
              {{ classify }}
            </el-tag>
          </div>
        </el-descriptions-item>
      </el-descriptions>
    </el-card>

    <!-- 中部：联系信息卡片 -->
    <el-card class="contact-info-card" shadow="hover">
      <template #header>
        <div class="card-header">
          <span class="card-title">联系信息</span>
          <el-divider direction="vertical" />
          <span class="card-subtitle">联系方式与地址</span>
        </div>
      </template>

      <el-descriptions :column="1" border class="info-descriptions">
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
                <el-tag type="info" size="small" class="info-type-tag"
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
                <el-tag type="success" size="small" class="info-type-tag"
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
                <el-tag type="warning" size="small" class="info-type-tag"
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

    <!-- 下部：相关记录表格 -->
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
        v-loading="recordsLoading"
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
          prop="id"
          label="记录ID"
          width="80"
          align="center"
          class-name="table-col-id"
        />
        <el-table-column
          prop="content"
          label="记录内容"
          min-width="300"
          show-overflow-tooltip
          class-name="table-col-content"
        />
        <el-table-column
          prop="created_time"
          label="创建时间"
          width="180"
          align="center"
          class-name="table-col-time"
        >
          <template #default="{ row }">
            {{ formatDate(row.created_time) }}
          </template>
        </el-table-column>
        <el-table-column
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
        v-if="!recordsLoading && personData.record?.length === 0"
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
          @size-change="handleSizeChange"
          @current-change="handleCurrentChange"
          background
          class="custom-pagination"
        />
      </div>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { Refresh, Printer, Download } from "@element-plus/icons-vue";
import { ElMessage, ElMessageBox } from "element-plus";
import type { PersonRes, Res, TimeStamp } from "~/types";
import { useWindowSize } from "@vueuse/core"; // 引入vueuse的窗口尺寸监听（需安装：npm i @vueuse/core）

// 路由
const route = useRoute();
const personId = computed(() => route.params.id as string);

// 监听窗口尺寸，判断是否为移动端
const { width } = useWindowSize();
const isMobile = computed(() => width.value < 768);

// 响应式数据
const personData = ref<PersonRes>({
  id: 0,
  name: "",
  gender: "男",
  birthday: "",
  credential: [],
  contact: [],
  address: [],
  record: [],
  created_time: "",
  updated_time: "",
  deleted_time: null,
});

const recordsLoading = ref(false);

// 前端分页配置
const pagination = reactive({
  current: 1,
  size: 10,
});

// 计算属性：获取当前页显示的记录
const displayedRecords = computed(() => {
  if (!personData.value.record || personData.value.record.length === 0) {
    return [];
  }

  const startIndex = (pagination.current - 1) * pagination.size;
  const endIndex = startIndex + pagination.size;

  return personData.value.record.slice(startIndex, endIndex);
});

// 生命周期
onMounted(() => {
  loadPersonData();
});

// 数据加载方法
const loadPersonData = async () => {
  try {
    recordsLoading.value = true;
    const response: Res<PersonRes[]> = await $fetch(
      `/api/person/${personId.value}`,
    );

    if (response.code === 200 && response.data.list.length > 0) {
      personData.value = response.data.list[0]!;
      pagination.size = 10;
      pagination.current = 1;
    } else {
      ElMessage.error("人员不存在");
    }
  } catch (error) {
    ElMessage.error("获取人员信息失败");
    console.error("Error loading person data:", error);
  } finally {
    recordsLoading.value = false;
  }
};

// 工具函数
const formatDate = (dateString: TimeStamp) => {
  if (!dateString) return "";
  try {
    return new Date(dateString).toLocaleString("zh-CN", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    });
  } catch (error) {
    return dateString;
  }
};

// 刷新功能
const handleRefresh = () => {
  loadPersonData();
  ElMessage.success("数据已刷新");
};

// 分页处理
const handleSizeChange = (size: number) => {
  pagination.size = size;
  pagination.current = 1;
};

const handleCurrentChange = (page: number) => {
  pagination.current = page;
};

// 打印功能
const handlePrint = () => {
  window.print();
};

// 导出功能
const handleExport = () => {
  ElMessage.info("导出功能开发中...");
};
</script>

<style scoped>
/* 全局容器样式 */
.person-detail-container {
  padding: 24px;
  max-width: 1400px;
  margin: 0 auto;
  background-color: #f5f7fa;
  min-height: 100vh;
}

/* 页面头部 */
.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
  padding-bottom: 16px;
  border-bottom: 1px solid #e5e7eb;
}

.page-title {
  font-size: 22px;
  font-weight: 700;
  color: #1d2129;
  margin: 0;
}

.page-actions {
  display: flex;
  gap: 12px;
}

.action-btn {
  border-radius: 6px;
  transition: all 0.2s ease;
}

.action-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

/* 卡片通用样式 */
.basic-info-card,
.contact-info-card,
.records-card {
  margin-bottom: 24px;
  border-radius: 12px;
  border: 1px solid #e8ebf0;
  background-color: #ffffff;
  transition: all 0.3s ease;
}

.basic-info-card:hover,
.contact-info-card:hover,
.records-card:hover {
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.08);
}

/* 卡片头部 */
.card-header {
  display: flex;
  justify-content: flex-start;
  align-items: center;
  gap: 8px;
}

.card-title {
  font-size: 18px;
  font-weight: 600;
  color: #1d2129;
}

.card-subtitle {
  font-size: 14px;
  color: #666c78;
}

.record-count-badge {
  margin: 0 8px;
}

/* 描述列表样式 */
.info-descriptions {
  --el-descriptions-item-label-color: #4e5969;
  --el-descriptions-item-content-color: #1d2129;
  --el-descriptions-border-color: #e8ebf0;
  border-radius: 8px;
  overflow: hidden;
}

.desc-item {
  padding: 12px 16px;
}

.desc-value {
  font-size: 14px;
  color: #1d2129;
}

.name-value {
  font-weight: 600;
  color: #1989fa;
}

.gender-tag {
  border-radius: 4px;
  font-weight: 500;
}

/* 分类标签样式 */
.classify-tags {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
  padding: 4px 0;
}

.classify-tag {
  border-radius: 4px;
  transition: all 0.2s ease;
}

.classify-tag:hover {
  transform: scale(1.05);
}

/* 信息数组容器 */
.info-array-container {
  display: flex;
  flex-direction: column;
  gap: 12px;
  padding: 4px 0;
}

.info-item {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 12px;
  border-radius: 6px;
  background-color: #f8f9fa;
  transition: all 0.2s ease;
}

.info-item:hover {
  background-color: #eef2f7;
  transform: translateX(4px);
}

.info-type-tag {
  border-radius: 4px;
  font-weight: 500;
  min-width: 60px;
  text-align: center;
}

.info-value {
  font-family: "Inter", "Courier New", monospace;
  font-size: 14px;
  color: #1d2129;
  flex: 1;
}

/* 空数据样式 */
.empty-data-wrapper {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 16px;
  justify-content: center;
  color: #909399;
}

.empty-icon {
  font-size: 20px;
  color: #c0c4cc;
}

.no-data {
  color: #909399;
  font-style: italic;
  font-size: 14px;
}

/* 表格样式 */
.records-table {
  --el-table-header-text-color: #4e5969;
  --el-table-row-hover-bg-color: #f8f9fa;
  --el-table-border-color: #e8ebf0;
  border-radius: 8px;
  overflow: hidden;
  margin-bottom: 16px;
}

.table-col-id {
  color: #666c78;
  font-weight: 500;
}

.table-col-content {
  line-height: 1.6;
}

.table-col-time {
  color: #666c78;
}

.table-col-tags {
  padding: 8px 0;
}

/* 表格空数据 */
.table-empty-wrapper {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 48px 0;
  color: #909399;
}

.table-empty-icon {
  font-size: 48px;
  color: #c0c4cc;
  margin-bottom: 16px;
}

.table-empty-text {
  font-size: 16px;
  color: #909399;
}

/* 标签容器样式 */
.tag-container {
  display: flex;
  gap: 6px;
  flex-wrap: wrap;
  justify-content: center;
  padding: 4px 0;
}

.record-tag {
  border-radius: 4px;
  transition: all 0.2s ease;
}

.record-tag:hover {
  transform: scale(1.05);
}

/* 分页样式 */
.pagination-container {
  margin-top: 24px;
  display: flex;
  justify-content: center;
}

.custom-pagination {
  --el-pagination-button-bg-color: #ffffff;
  --el-pagination-button-hover-bg-color: #eef2f7;
  --el-pagination-current-page-bg-color: #1989fa;
  border-radius: 6px;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .person-detail-container {
    padding: 16px;
  }

  .page-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 16px;
    margin-bottom: 16px;
  }

  .page-actions {
    width: 100%;
    justify-content: flex-end;
    flex-wrap: wrap;
  }

  .page-title {
    font-size: 18px;
  }

  .card-header {
    flex-wrap: wrap;
  }

  .card-subtitle {
    font-size: 12px;
  }

  .desc-item {
    padding: 8px 12px;
  }

  .info-item {
    flex-wrap: wrap;
  }

  .info-type-tag {
    min-width: 50px;
  }

  .table-empty-icon {
    font-size: 32px;
  }

  .table-empty-text {
    font-size: 14px;
  }
}

/* 打印样式适配 */
@media print {
  .page-actions,
  .pagination-container {
    display: none;
  }

  .basic-info-card,
  .contact-info-card,
  .records-card {
    box-shadow: none;
    border: 1px solid #ddd;
    margin-bottom: 16px;
  }

  .person-detail-container {
    background-color: #ffffff;
    padding: 0;
  }
}
</style>
