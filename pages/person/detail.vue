<template>
  <el-drawer
    v-model="data.drawerVisible"
    :with-header="false"
    :direction="direction"
    :size="size"
    :close-on-click-modal="false"
    :close-on-press-escape="true"
    class="person-detail-drawer"
    @close="data.methods.handleClose"
  >
    <!-- 关键：包裹所有动态数据区域，跳过服务端渲染，消除水合差异 -->
    <ClientOnly>
      <div class="person-detail-container" v-loading="data.loading">
        <!-- 标题区域 -->
        <div class="drawer-header">
          <h2 class="drawer-title">{{ data.computed.drawerTitle() }}</h2>
        </div>
        <el-card class="basic-info-card" shadow="hover">
          <template #header>
            <div class="card-header">
              <span class="card-title">基本信息</span>
              <el-button
                v-if="data.internalStatus === 'view'"
                type="primary"
                size="small"
                @click="data.methods.handleSwitchToEdit"
                class="switch-edit-btn"
              >
                切换到编辑模式
              </el-button>
            </div>
          </template>
          <el-form
            ref="formRef"
            :model="data.formData"
            :rules="data.formRules"
            :disabled="data.internalStatus === 'view'"
            label-width="100px"
          >
            <el-descriptions :column="2" border class="info-descriptions">
              <el-descriptions-item label="姓名" class="desc-item">
                <span
                  v-if="data.internalStatus === 'view'"
                  class="desc-value name-value"
                >
                  {{ data.formData.name || "暂无" }}
                </span>
                <el-form-item v-else prop="name" class="inline-form-item">
                  <el-input
                    v-model="data.formData.name"
                    placeholder="请输入姓名"
                    clearable
                  />
                </el-form-item>
              </el-descriptions-item>
              <el-descriptions-item label="性别" class="desc-item">
                <span
                  v-if="data.internalStatus === 'view'"
                  :class="
                    data.formData.gender === '男' ? 'text-male' : 'text-female'
                  "
                >
                  {{ data.formData.gender || "未知" }}
                </span>
                <el-form-item v-else prop="gender" class="inline-form-item">
                  <el-radio-group v-model="data.formData.gender">
                    <el-radio value="男">男</el-radio>
                    <el-radio value="女">女</el-radio>
                  </el-radio-group>
                </el-form-item>
              </el-descriptions-item>
              <el-descriptions-item label="出生日期" class="desc-item">
                <span v-if="data.internalStatus === 'view'" class="desc-value">
                  {{
                    data.methods.formatDate(data.formData.birthday) || "暂无"
                  }}
                </span>
                <el-form-item v-else prop="birthday" class="inline-form-item">
                  <el-date-picker
                    v-model="data.formData.birthday"
                    type="date"
                    placeholder="选择出生日期"
                    value-format="YYYY-MM-DD"
                    style="width: 100%"
                  />
                </el-form-item>
              </el-descriptions-item>
              <el-descriptions-item
                label="分类标签"
                class="desc-item"
                :span="2"
                v-if="
                  data.formData.classify && data.formData.classify.length > 0
                "
              >
                <div class="classify-tags">
                  <el-tag
                    v-for="(classify, index) in data.formData.classify"
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
              <el-descriptions-item
                label="创建时间"
                class="desc-item"
                v-if="data.internalStatus !== 'add'"
              >
                <span class="desc-value">{{
                  data.methods.formatDate(data.formData.created_time) || "暂无"
                }}</span>
              </el-descriptions-item>
              <el-descriptions-item
                label="更新时间"
                class="desc-item"
                v-if="data.internalStatus !== 'add'"
              >
                <span class="desc-value">{{
                  data.methods.formatDate(data.formData.updated_time) || "暂无"
                }}</span>
              </el-descriptions-item>
            </el-descriptions>
          </el-form>
        </el-card>
        <el-card class="contact-info-card" shadow="never">
          <template #header>
            <div class="card-header">
              <span class="card-title">联系信息</span>
              <el-divider direction="vertical" />
              <span class="card-subtitle">联系方式与地址</span>
            </div>
          </template>
          <el-form
            :model="data.formData"
            :disabled="data.internalStatus === 'view'"
          >
            <el-descriptions :column="1" border>
              <el-descriptions-item label="证件信息" class="desc-item">
                <div class="info-array-container">
                  <template v-if="data.internalStatus === 'view'">
                    <template
                      v-if="
                        data.formData.credential &&
                        data.formData.credential.length > 0
                      "
                    >
                      <div
                        v-for="(cred, index) in data.formData.credential"
                        :key="index"
                        class="info-item"
                        hover
                      >
                        <el-tag
                          type="primary"
                          size="small"
                          class="info-type-tag"
                          >{{ cred.type }}:</el-tag
                        >
                        <span class="info-value">{{ cred.value }}</span>
                      </div>
                    </template>
                    <div v-else class="empty-data-wrapper">
                      <span class="no-data">暂无证件信息</span>
                    </div>
                  </template>
                  <template v-else>
                    <div class="editable-credentials">
                      <div
                        v-for="(cred, index) in data.formData.credential"
                        :key="index"
                        class="credential-input-group"
                      >
                        <el-select
                          v-model="cred.type"
                          placeholder="证件类型"
                          style="width: 120px; margin-right: 10px"
                        >
                          <el-option label="身份证" value="身份证" />
                          <el-option label="护照" value="护照" />
                          <el-option label="驾驶证" value="驾驶证" />
                        </el-select>
                        <el-input
                          v-model="cred.value"
                          placeholder="证件号码"
                          style="flex: 1; margin-right: 10px"
                        />
                        <el-button
                          type="danger"
                          text
                          @click="data.methods.removeCredential(index)"
                          :icon="Delete"
                        >
                          删除
                        </el-button>
                      </div>
                      <el-button
                        type="primary"
                        text
                        @click="data.methods.addCredential"
                        :icon="Plus"
                        class="add-credential-btn"
                      >
                        添加证件
                      </el-button>
                    </div>
                  </template>
                </div>
              </el-descriptions-item>
              <el-descriptions-item label="联系方式" class="desc-item">
                <div class="info-array-container">
                  <template v-if="data.internalStatus === 'view'">
                    <template
                      v-if="
                        data.formData.contact &&
                        data.formData.contact.length > 0
                      "
                    >
                      <div
                        v-for="(contact, index) in data.formData.contact"
                        :key="index"
                        class="info-item"
                        hover
                      >
                        <el-tag
                          type="primary"
                          size="small"
                          class="info-type-tag"
                          >{{ contact.type }}:</el-tag
                        >
                        <span class="info-value">{{ contact.value }}</span>
                      </div>
                    </template>
                    <div v-else class="empty-data-wrapper">
                      <span class="no-data">暂无联系方式</span>
                    </div>
                  </template>
                  <template v-else>
                    <!-- 可编辑的联系方式区域 -->
                    <div class="editable-contacts">
                      <div
                        v-for="(contact, index) in data.formData.contact"
                        :key="index"
                        class="contact-input-group"
                      >
                        <el-select
                          v-model="contact.type"
                          placeholder="联系类型"
                          style="width: 120px; margin-right: 10px"
                        >
                          <el-option label="手机" value="手机" />
                          <el-option label="电话" value="电话" />
                          <el-option label="邮箱" value="邮箱" />
                        </el-select>
                        <el-input
                          v-model="contact.value"
                          placeholder="联系方式"
                          style="flex: 1; margin-right: 10px"
                        />
                        <el-button
                          type="danger"
                          text
                          @click="data.methods.removeContact(index)"
                          :icon="Delete"
                        >
                          删除
                        </el-button>
                      </div>
                      <el-button
                        type="primary"
                        text
                        @click="data.methods.addContact"
                        :icon="Plus"
                        class="add-contact-btn"
                      >
                        添加联系方式
                      </el-button>
                    </div>
                  </template>
                </div>
              </el-descriptions-item>
              <el-descriptions-item label="联系地址" class="desc-item">
                <div class="info-array-container">
                  <template v-if="data.internalStatus === 'view'">
                    <template
                      v-if="
                        data.formData.address &&
                        data.formData.address.length > 0
                      "
                    >
                      <div
                        v-for="(addr, index) in data.formData.address"
                        :key="index"
                        class="info-item"
                        hover
                      >
                        <el-tag
                          type="primary"
                          size="small"
                          class="info-type-tag"
                          >{{ addr.type }}:</el-tag
                        >
                        <span class="info-value">{{ addr.value }}</span>
                      </div>
                    </template>
                    <div v-else class="empty-data-wrapper">
                      <span class="no-data">暂无地址信息</span>
                    </div>
                  </template>
                  <template v-else>
                    <!-- 可编辑的地址区域 -->
                    <div class="editable-addresses">
                      <div
                        v-for="(addr, index) in data.formData.address"
                        :key="index"
                        class="address-input-group"
                      >
                        <el-select
                          v-model="addr.type"
                          placeholder="地址类型"
                          style="width: 120px; margin-right: 10px"
                        >
                          <el-option label="家庭地址" value="家庭地址" />
                          <el-option label="工作地址" value="工作地址" />
                          <el-option label="其他地址" value="其他地址" />
                        </el-select>
                        <el-input
                          v-model="addr.value"
                          placeholder="详细地址"
                          style="flex: 1; margin-right: 10px"
                        />
                        <el-button
                          type="danger"
                          text
                          @click="data.methods.removeAddress(index)"
                          :icon="Delete"
                        >
                          删除
                        </el-button>
                      </div>
                      <el-button
                        type="primary"
                        text
                        @click="data.methods.addAddress"
                        :icon="Plus"
                        class="add-address-btn"
                      >
                        添加地址
                      </el-button>
                    </div>
                  </template>
                </div>
              </el-descriptions-item>
            </el-descriptions>
          </el-form>
        </el-card>
        <!-- 记录信息区域（仅在查看和编辑模式显示） -->
        <el-card
          class="records-card"
          shadow="hover"
          v-if="
            data.internalStatus !== 'add' &&
            data.formData.record &&
            data.formData.record.length > 0
          "
        >
          <template #header>
            <div class="card-header">
              <span class="card-title">相关记录</span>
              <el-badge
                :value="data.computed.displayedRecords().length"
                class="record-count-badge"
                type="primary"
              />
              <el-divider direction="vertical" />
              <span class="card-subtitle"
                >共 {{ data.formData.record?.length || 0 }} 条记录</span
              >
            </div>
          </template>
          <el-table
            v-loading="data.loading"
            :data="data.computed.displayedRecords()"
            stripe
            border
            style="width: 100%"
            empty-text=""
            class="records-table"
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
                {{ data.methods.formatDate(row.created_time) }}
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
          <div
            class="pagination-container"
            v-if="data.formData.record && data.formData.record.length > 0"
          >
            <el-pagination
              v-model:current-page="data.pagination.current"
              v-model:page-size="data.pagination.size"
              :page-sizes="[5, 10, 20, 50]"
              :total="data.formData.record.length"
              layout="total, sizes, prev, pager, next, jumper"
              @size-change="data.pagination.handleSizeChange"
              @current-change="data.pagination.handleCurrentChange"
              background
              class="custom-pagination"
            />
          </div>
        </el-card>
        <div
          v-if="
            !data.loading && data.internalStatus !== 'add' && !data.formData.id
          "
          class="empty-state"
        >
          <el-empty description="暂无人员数据" />
        </div>
      </div>
    </ClientOnly>
    <!-- 抽屉底部按钮 -->
    <template #footer>
      <div class="drawer-footer">
        <el-button @click="data.methods.handleClose">关闭</el-button>
        <!-- 根据模式显示不同的操作按钮 -->
        <template v-if="data.internalStatus === 'add'">
          <el-button
            type="primary"
            @click="data.methods.handleAdd"
            :loading="data.submitLoading"
          >
            新增
          </el-button>
        </template>
        <template v-else-if="data.internalStatus === 'edit'">
          <el-button
            type="primary"
            @click="data.methods.handleSave"
            :loading="data.submitLoading"
          >
            保存
          </el-button>
          <el-button @click="data.methods.handleSwitchToView">取消</el-button>
        </template>
        <template v-else-if="data.internalStatus === 'view'">
          <el-button type="primary" @click="data.methods.handleSwitchToEdit">
            编辑
          </el-button>
        </template>
      </div>
    </template>
  </el-drawer>
</template>
<script setup lang="ts">
import { reactive, ref, watch } from "vue";
import { ElMessage, type FormInstance, type FormRules } from "element-plus";
import { Delete, Plus } from "@element-plus/icons-vue";
import type {
  AddressItem,
  ContactItem,
  CredentialItem,
  PersonPO,
  PersonRes,
  Res,
  TimeStamp,
} from "~/types";
// 定义Props
interface Props {
  status?: "add" | "edit" | "view";
  personId?: number;
  direction?: `ltr` | `rtl` | `ttb` | `btt`;
  size?: string | number;
}
const props = withDefaults(defineProps<Props>(), {
  status: "view",
  personId: undefined,
  direction: `ltr`,
  size: `90%`,
});
// 定义事件
const emit = defineEmits<{
  update: [person: PersonRes];
  edit: [personId: number];
  add: [personData: PersonPO]; // 修正：匹配传递的 PersonPO 类型
  close: [];
  modeChange: [mode: "add" | "edit" | "view"];
  submitSuccess: [type: "add" | "edit"];
}>();
// 表单Ref（单独提取，用于表单验证）
const formRef = ref<FormInstance>();
// 核心：统一整合所有属性和方法到 data 响应式对象中
const data = reactive({
  // 1. 基础状态
  drawerVisible: false,
  loading: false,
  submitLoading: false,
  internalStatus: props.status as "add" | "edit" | "view", // 内部状态，避免直接依赖props
  // 2. 表单数据
  formData: {
    id: 0,
    name: "",
    gender: "男" as "男" | "女", // 修正：明确指定类型，匹配 Person 接口
    birthday: "",
    credential: [] as CredentialItem[],
    contact: [] as ContactItem[],
    address: [] as AddressItem[],
    classify: [] as string[], // 修正：明确指定数组类型
    record: [] as any[], // 修正：明确指定数组类型
    created_time: "",
    updated_time: "",
    deleted_time: null as null | string,
  } as PersonRes,
  // 3. 表单验证规则
  formRules: {
    name: [
      { required: true, message: "请输入姓名", trigger: "blur" },
      {
        min: 2,
        max: 50,
        message: "姓名长度在 2 到 50 个字符",
        trigger: "blur",
      },
    ],
    gender: [{ required: true, message: "请选择性别", trigger: "change" }],
    birthday: [
      { required: true, message: "请选择出生日期", trigger: "change" },
    ],
  } as FormRules,
  // 4. 分页设置（记录列表分页）
  pagination: {
    current: 1,
    size: 10,
    handleSizeChange: (size: number) => {
      data.pagination.size = size;
      data.pagination.current = 1;
    },
    handleCurrentChange: (page: number) => {
      data.pagination.current = page;
    },
  },
  // 5. 计算属性（集中管理派生数据）
  computed: {
    // 抽屉标题
    drawerTitle: () => {
      const titles = {
        add: "新增人员",
        edit: "编辑人员信息",
        view: "人员详情",
      };
      return titles[data.internalStatus];
    },
    // 显示的记录列表（分页后）
    displayedRecords: () => {
      if (!data.formData.record || data.formData.record.length === 0) {
        return [];
      }
      const startIndex = (data.pagination.current - 1) * data.pagination.size;
      const endIndex = startIndex + data.pagination.size;
      return data.formData.record.slice(startIndex, endIndex);
    },
  },
  // 6. 所有业务方法集中管理
  methods: {
    // 日期格式化（消除SSR差异，统一格式）
    formatDate: (dateString: TimeStamp) => {
      if (!dateString) return ``;
      try {
        const date = new Date(dateString);
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, "0");
        const day = String(date.getDate()).padStart(2, "0");
        const hours = String(date.getHours()).padStart(2, "0");
        const minutes = String(date.getMinutes()).padStart(2, "0");
        const seconds = String(date.getSeconds()).padStart(2, "0");
        return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
      } catch (error) {
        return String(dateString);
      }
    },
    // 证件信息 - 新增
    addCredential: () => {
      data.formData.credential.push({ type: "身份证", value: `` });
    },
    // 证件信息 - 删除
    removeCredential: (index: number) => {
      data.formData.credential.splice(index, 1);
    },
    // 联系方式 - 新增
    addContact: () => {
      data.formData.contact.push({ type: "手机", value: `` });
    },
    // 联系方式 - 删除
    removeContact: (index: number) => {
      data.formData.contact.splice(index, 1);
    },
    // 地址信息 - 新增
    addAddress: () => {
      data.formData.address.push({ type: "家庭地址", value: `` });
    },
    // 地址信息 - 删除
    removeAddress: (index: number) => {
      data.formData.address.splice(index, 1);
    },
    // 重置表单数据
    resetFormData: () => {
      data.formData = {
        id: 0,
        name: ``,
        gender: "男" as "男" | "女", // 修正：明确指定类型
        birthday: ``,
        credential: [],
        contact: [],
        address: [],
        classify: [],
        record: [],
        created_time: ``,
        updated_time: ``,
        deleted_time: null,
      } as PersonRes;
    },
    // 加载人员数据（仅客户端执行，避免服务端请求）
    loadPersonData: async () => {
      if (import.meta.server || !props.personId) return;
      try {
        data.loading = true;
        const response: Res<PersonRes[]> = await $fetch(
          `/api/person/${props.personId}`,
        );
        if (response.code === 200 && response.data?.list?.[0]) {
          data.formData = response.data.list[0];
          emit(`update`, data.formData);
        } else {
          ElMessage.error(`获取人员信息失败`);
          data.methods.resetFormData();
        }
      } catch (error) {
        ElMessage.error(`获取人员信息失败: ${error}`);
        data.methods.resetFormData();
      } finally {
        data.loading = false;
      }
    },
    // 新增人员
    handleAdd: async () => {
      if (!formRef.value) return;
      try {
        await formRef.value.validate();
        data.submitLoading = true;
        // 格式化新增数据，传递给父组件
        const newPersonData: PersonPO = {
          name: data.formData.name,
          gender: data.formData.gender,
          birthday: data.formData.birthday,
          credential: data.formData.credential,
          contact: data.formData.contact,
          address: data.formData.address,
        };
        emit(`add`, newPersonData);
        emit(`submitSuccess`, "add");
        ElMessage.success(`新增人员成功`);
        data.drawerVisible = false;
      } catch (error) {
        ElMessage.error(`表单验证失败，请检查输入`);
      } finally {
        data.submitLoading = false; // 修正：笔误，改为 submitLoading
      }
    },
    // 保存编辑数据
    handleSave: async () => {
      if (!formRef.value) return;
      try {
        await formRef.value.validate();
        data.submitLoading = true;
        emit(`edit`, data.formData.id!);
        emit(`submitSuccess`, "edit");
        ElMessage.success(`保存人员信息成功`);
        data.drawerVisible = false;
      } catch (error) {
        ElMessage.error(`保存失败，请检查表单填写`);
      } finally {
        data.submitLoading = false;
      }
    },
    // 切换到编辑模式
    handleSwitchToEdit: () => {
      data.internalStatus = "edit";
      emit(`modeChange`, "edit");
    },
    // 切换到查看模式
    handleSwitchToView: () => {
      data.internalStatus = "view";
      emit(`modeChange`, "view");
    },
    // 关闭抽屉
    handleClose: () => {
      data.drawerVisible = false;
      emit(`close`);
    },
  },
});
// 监听props.status变化，同步内部状态
watch(
  () => props.status,
  (newVal) => {
    data.internalStatus = newVal;
    if (newVal === "add") {
      data.methods.resetFormData();
    } else if (newVal === "view" && props.personId) {
      data.methods.loadPersonData();
    }
  },
  { immediate: true },
);
// 监听props.personId变化，加载人员数据
watch(
  () => props.personId,
  (newVal) => {
    if (
      import.meta.client &&
      newVal &&
      data.drawerVisible &&
      data.internalStatus !== "add"
    ) {
      data.methods.loadPersonData();
    }
  },
);
// 监听抽屉可见性变化，加载对应数据
watch(
  () => data.drawerVisible,
  (newVal) => {
    if (import.meta.client && newVal) {
      if (data.internalStatus === "add") {
        data.methods.resetFormData();
      } else if (props.personId) {
        data.methods.loadPersonData();
      }
    }
  },
);
// 暴露给父组件的方法
defineExpose({
  open: (mode: "add" | "edit" | "view" = props.status) => {
    data.internalStatus = mode;
    data.drawerVisible = true;
  },
  close: () => {
    data.drawerVisible = false;
  },
});
</script>
<style scoped lang="scss">
.person-detail-container {
  padding: $spacing-xl;
  display: flex;
  flex-direction: column;
  gap: $spacing-md;
}
.drawer-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: $spacing-md;
  padding-bottom: $spacing-md;
  border-bottom: 1px solid #e5e5e5;
  .drawer-title {
    margin: 0;
    font-size: $font-size-xl;
    color: $text-primary;
  }
}
.switch-edit-btn {
  margin-left: auto;
}
.inline-form-item {
  margin-bottom: 0;
  :deep(.el-form-item__content) {
    margin-left: 0 !important;
  }
}
.editable-credentials,
.editable-contacts,
.editable-addresses {
  display: flex;
  flex-direction: column;
  gap: $spacing-sm;
}
.credential-input-group,
.contact-input-group,
.address-input-group {
  display: flex;
  align-items: center;
  gap: $spacing-sm;
}
.add-credential-btn,
.add-contact-btn,
.add-address-btn {
  align-self: flex-start;
}
.info-array-container {
  min-height: 40px;
}
.empty-data-wrapper {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 40px;
  color: $text-info;
}
.drawer-footer {
  display: flex;
  justify-content: flex-end;
  gap: $spacing-sm;
  padding: $spacing-md;
  border-top: 1px solid #e5e5e5;
}
.text-male {
  color: #409eff;
}
.text-female {
  color: #f56c6c;
}
:deep(.el-descriptions__label) {
  font-weight: bold;
}
:deep(.el-descriptions__content) {
  padding: $spacing-sm;
}
.classify-tags {
  display: flex;
  flex-wrap: wrap;
  gap: $spacing-sm;
}
.records-card {
  margin-top: $spacing-md;
}
.pagination-container {
  display: flex;
  justify-content: flex-end;
  margin-top: $spacing-md;
  padding-right: $spacing-sm;
}
</style>
