<template>
  <el-drawer
    :model-value="visible"
    :with-header="false"
    :direction="direction"
    :size="size"
    :close-on-click-modal="false"
    :close-on-press-escape="true"
    @update:model-value="handleDrawerVisibleChange"
    class="person-detail-drawer"
    @close="handleClose"
  >
    <ClientOnly>
      <div
        class="person-detail-container"
        v-loading="drawerData.status.loading"
      >
        <!-- 抽屉头部 -->
        <div class="drawer-header">
          <h2 class="drawer-title">{{ drawerTitle }}</h2>
        </div>

        <!-- 基本信息卡片 -->
        <el-card class="basic-info-card" shadow="hover">
          <template #header>
            <div class="card-header">
              <span class="card-title">基本信息</span>
              <el-button
                v-if="mode === 'view'"
                type="primary"
                size="small"
                @click="switchToEditMode"
                class="switch-edit-btn"
              >
                切换到编辑模式
              </el-button>
            </div>
          </template>
          <el-form
            ref="formRef"
            :model="formData.data"
            :rules="formData.rules"
            :disabled="mode === 'view'"
            label-width="100px"
          >
            <el-descriptions :column="2" border class="info-descriptions">
              <!-- 姓名 -->
              <el-descriptions-item label="姓名" class="desc-item">
                <span v-if="mode === 'view'" class="desc-value name-value">
                  {{ formData.data.name || "暂无" }}
                </span>
                <el-form-item v-else prop="name" class="inline-form-item">
                  <el-input
                    v-model="formData.data.name"
                    placeholder="请输入姓名"
                    clearable
                  />
                </el-form-item>
              </el-descriptions-item>

              <!-- 性别 -->
              <el-descriptions-item label="性别" class="desc-item">
                <span
                  v-if="mode === 'view'"
                  :class="
                    formData.data.gender === '男' ? 'text-male' : 'text-female'
                  "
                >
                  {{ formData.data.gender || "未知" }}
                </span>
                <el-form-item v-else prop="gender" class="inline-form-item">
                  <el-radio-group v-model="formData.data.gender">
                    <el-radio value="男">男</el-radio>
                    <el-radio value="女">女</el-radio>
                  </el-radio-group>
                </el-form-item>
              </el-descriptions-item>

              <!-- 出生日期 -->
              <el-descriptions-item label="出生日期" class="desc-item">
                <span v-if="mode === 'view'" class="desc-value">
                  {{ formatDate(formData.data.birthday) || "暂无" }}
                </span>
                <el-form-item v-else prop="birthday" class="inline-form-item">
                  <el-date-picker
                    v-model="formData.data.birthday"
                    type="date"
                    placeholder="选择出生日期"
                    value-format="YYYY-MM-DD"
                    style="width: 100%"
                  />
                </el-form-item>
              </el-descriptions-item>

              <!-- 分类标签 -->
              <el-descriptions-item
                label="分类标签"
                class="desc-item"
                :span="2"
                v-if="
                  formData.data.classify && formData.data.classify.length > 0
                "
              >
                <div class="classify-tags">
                  <el-tag
                    v-for="(classify, index) in formData.data.classify"
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

              <!-- 创建时间（非新增模式） -->
              <el-descriptions-item
                label="创建时间"
                class="desc-item"
                v-if="mode !== 'add'"
              >
                <span class="desc-value">{{
                  formatDate(formData.data.created_time) || "暂无"
                }}</span>
              </el-descriptions-item>

              <!-- 更新时间（非新增模式） -->
              <el-descriptions-item
                label="更新时间"
                class="desc-item"
                v-if="mode !== 'add'"
              >
                <span class="desc-value">{{
                  formatDate(formData.data.updated_time) || "暂无"
                }}</span>
              </el-descriptions-item>
            </el-descriptions>
          </el-form>
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
          <el-form :model="formData.data" :disabled="mode === 'view'">
            <el-descriptions :column="1" border>
              <!-- 证件信息 -->
              <el-descriptions-item label="证件信息" class="desc-item">
                <div class="info-array-container">
                  <template v-if="mode === 'view'">
                    <template v-if="formData.data.credential.length > 0">
                      <div
                        v-for="(cred, index) in formData.data.credential"
                        :key="index"
                        class="info-item"
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
                        v-for="(cred, index) in formData.data.credential"
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
                          @click="formData.funcRemoveCredential(index)"
                          :icon="Delete"
                        >
                          删除
                        </el-button>
                      </div>
                      <el-button
                        type="primary"
                        text
                        @click="formData.funcAddCredential"
                        :icon="Plus"
                        class="add-credential-btn"
                      >
                        添加证件
                      </el-button>
                    </div>
                  </template>
                </div>
              </el-descriptions-item>

              <!-- 联系方式 -->
              <el-descriptions-item label="联系方式" class="desc-item">
                <div class="info-array-container">
                  <template v-if="mode === 'view'">
                    <template v-if="formData.data.contact.length > 0">
                      <div
                        v-for="(contact, index) in formData.data.contact"
                        :key="index"
                        class="info-item"
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
                    <div class="editable-contacts">
                      <div
                        v-for="(contact, index) in formData.data.contact"
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
                          @click="formData.funcRemoveContact(index)"
                          :icon="Delete"
                        >
                          删除
                        </el-button>
                      </div>
                      <el-button
                        type="primary"
                        text
                        @click="formData.funcAddContact"
                        :icon="Plus"
                        class="add-contact-btn"
                      >
                        添加联系方式
                      </el-button>
                    </div>
                  </template>
                </div>
              </el-descriptions-item>

              <!-- 联系地址 -->
              <el-descriptions-item label="联系地址" class="desc-item">
                <div class="info-array-container">
                  <template v-if="mode === 'view'">
                    <template v-if="formData.data.address.length > 0">
                      <div
                        v-for="(addr, index) in formData.data.address"
                        :key="index"
                        class="info-item"
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
                    <div class="editable-addresses">
                      <div
                        v-for="(addr, index) in formData.data.address"
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
                          @click="formData.funcRemoveAddress(index)"
                          :icon="Delete"
                        >
                          删除
                        </el-button>
                      </div>
                      <el-button
                        type="primary"
                        text
                        @click="formData.funcAddAddress"
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

        <!-- 相关记录卡片（非新增模式） -->
        <el-card
          class="records-card"
          shadow="hover"
          v-if="mode !== 'add' && formData.data.record.length > 0"
        >
          <template #header>
            <div class="card-header">
              <span class="card-title">相关记录</span>
            </div>
          </template>
          <el-table
            v-loading="drawerData.status.loading"
            :data="pagedRecordList"
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

          <!-- 记录分页 -->
          <div class="pagination-container">
            <el-pagination
              v-model:current-page="paginationData.current"
              v-model:page-size="paginationData.pageSize"
              :page-sizes="[5, 10, 20, 50]"
              :total="formData.data.record.length"
              layout="total, sizes, prev, pager, next, jumper"
              @size-change="handlePageSizeChange"
              @current-change="handlePageChange"
              background
              class="custom-pagination"
            />
          </div>
        </el-card>

        <!-- 空状态（非新增、无人员数据） -->
        <div
          v-if="
            !drawerData.status.loading && mode !== 'add' && !formData.data.id
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
        <el-button @click="handleClose">关闭</el-button>

        <!-- 新增模式按钮 -->
        <template v-if="mode === 'add'">
          <el-button
            type="primary"
            @click="handleAddSubmit"
            :loading="drawerData.status.submitLoading"
          >
            新增
          </el-button>
        </template>

        <!-- 编辑模式按钮 -->
        <template v-if="mode === 'edit'">
          <el-button
            type="primary"
            @click="handleSaveSubmit"
            :loading="drawerData.status.submitLoading"
          >
            保存
          </el-button>
          <el-button @click="switchToViewMode">取消</el-button>
        </template>

        <!-- 查看模式按钮 -->
        <template v-if="mode === 'view'">
          <el-button type="primary" @click="switchToEditMode">编辑</el-button>
        </template>
      </div>
    </template>
  </el-drawer>
</template>

<script setup lang="ts">
import { reactive, ref, watch, computed } from "vue";
import { ElMessage, type FormInstance, type FormRules } from "element-plus";
import { Delete, Plus } from "@element-plus/icons-vue";
import type {
  PersonRes,
  Res,
  PersonVO,
  PersonPO,
  CredentialItem,
  ContactItem,
  AddressItem,
  RecordRes,
} from "~/types";
import { formatDate } from "~/utils/formatData.util";

// ---------------------- 1. Props 定义（完善类型 + 双向绑定支持） ----------------------
interface Props {
  visible: boolean;
  mode: "add" | "edit" | "view";
  personId?: number;
  direction?: "ltr" | "rtl" | "ttb" | "btt";
  size?: string | number;
  defaultClassifyIds?: number[];
}

const props = withDefaults(defineProps<Props>(), {
  visible: false,
  mode: "view",
  personId: 0,
  direction: "ltr",
  size: "90%",
  defaultClassifyIds: () => [],
});

// ---------------------- 2. Emit 定义（完善事件类型 + 双向绑定） ----------------------
const emit = defineEmits<{
  (e: "update:visible", value: boolean): void;
  (e: "update:mode", value: "add" | "edit" | "view"): void;
  (e: "close"): void;
  (e: "submit-success"): void;
}>();

// ---------------------- 3. 抽屉状态管理（响应式 + 明确类型） ----------------------
const drawerData = reactive({
  status: {
    loading: false, // 数据加载中
    submitLoading: false, // 提交中
  },
});

// ---------------------- 4. 表单引用 + 数据 + 验证规则（复用 types 接口，无冗余） ----------------------
const formRef = ref<FormInstance>();
const formData = reactive({
  // 表单数据（复用 PersonVO + 补充字段，避免重复定义）
  data: {} as PersonVO & {
    record: RecordRes[]; // 关联记录（明确为 RecordRes[]，替代 any[]）
  },
  // 表单验证规则（明确 FormRules 类型）
  rules: {
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

  // ---------------------- 表单方法（增删改查 + 重置 + 验证） ----------------------
  /** 新增地址项 */
  funcAddAddress: () => {
    const newAddress: AddressItem = { type: "家庭地址", value: "" };
    formData.data.address = formData.data.address || [];
    formData.data.address.push(newAddress);
  },

  /** 新增联系方式项 */
  funcAddContact: () => {
    const newContact: ContactItem = { type: "手机", value: "" };
    formData.data.contact = formData.data.contact || [];
    formData.data.contact.push(newContact);
  },

  /** 新增证件项 */
  funcAddCredential: () => {
    const newCredential: CredentialItem = { type: "身份证", value: "" };
    formData.data.credential = formData.data.credential || [];
    formData.data.credential.push(newCredential);
  },

  /** 重置表单数据 + 验证状态 */
  funcReset: () => {
    // 重置表单数据（复用接口默认值，无冗余）
    formData.data = {
      id: 0,
      name: "",
      gender: "男",
      birthday: "",
      credential: [],
      contact: [],
      address: [],
      classify: [],
      record: [],
      created_time: "",
      updated_time: "",
      deleted_time: null,
    } as PersonVO & { record: RecordRes[] };

    // 重置表单验证状态
    formRef.value?.clearValidate();
  },

  /** 删除地址项 */
  funcRemoveAddress: (index: number) => {
    formData.data.address?.splice(index, 1);
  },

  /** 删除联系方式项 */
  funcRemoveContact: (index: number) => {
    formData.data.contact?.splice(index, 1);
  },

  /** 删除证件项 */
  funcRemoveCredential: (index: number) => {
    formData.data.credential?.splice(index, 1);
  },

  /** 加载人员详情数据（单个人员，修正接口泛型） */
  funcLoad: async () => {
    if (import.meta.server || !props.personId) return;
    try {
      drawerData.status.loading = true;
      const response = await $fetch<Res<PersonRes[]>>(
        `/api/person/${props.personId}`,
        { method: "GET" },
      );
      const personList: PersonRes[] = response.data?.list || [];
      if (response.code === 200 && response.data) {
        const targetPerson = personList[0] || {};
        formData.data = {
          ...targetPerson,
        } as PersonVO & { record: RecordRes[] };
      } else {
        ElMessage.error("获取人员信息失败");
        formData.funcReset();
      }
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : "未知错误";
      ElMessage.error(`获取人员信息失败：${errorMsg}`);
      formData.funcReset();
    } finally {
      drawerData.status.loading = false;
    }
  },

  /** 表单验证 */
  funcValidate: async (): Promise<boolean> => {
    if (!formRef.value) return false;

    try {
      await formRef.value.validate();
      return true;
    } catch (error) {
      ElMessage.error("表单验证失败，请检查输入");
      return false;
    }
  },
});

// ---------------------- 5. 本地分页数据（响应式 + 明确类型） ----------------------
const paginationData = reactive({
  current: 1, // 当前页码
  pageSize: 10, // 每页条数
});

// ---------------------- 6. 计算属性（分页记录 + 抽屉标题，无冗余逻辑） ----------------------
/** 分页后的记录列表 */
const pagedRecordList = computed(() => {
  const start = (paginationData.current - 1) * paginationData.pageSize;
  const end = start + paginationData.pageSize;
  return formData.data.record?.slice(start, end) || [];
});

/** 抽屉标题 */
const drawerTitle = computed(() => {
  const titleMap = {
    add: "新增人员",
    edit: "编辑人员信息",
    view: "人员详情",
  };
  return titleMap[props.mode];
});

// ---------------------- 7. 分页事件处理 ----------------------
const handlePageChange = (page: number) => {
  paginationData.current = page;
};

const handlePageSizeChange = (size: number) => {
  paginationData.pageSize = size;
  paginationData.current = 1; // 切换每页条数，重置为第1页
};

// ---------------------- 8. 模式切换（完善双向绑定，父组件同步更新） ----------------------
const switchToEditMode = () => {
  emit("update:mode", "edit");
};

const switchToViewMode = () => {
  emit("update:mode", "view");
  formRef.value?.clearValidate(); // 取消编辑时，重置表单验证状态
};

// ---------------------- 9. 抽屉关闭处理（重置表单 + 通知父组件） ----------------------
const handleClose = () => {
  // 通知父组件关闭抽屉（兼容两种 v-model 绑定）
  emit("update:visible", false);
  emit("close");

  // 重置表单数据和提交状态
  formData.funcReset();
  drawerData.status.submitLoading = false;
};

// ---------------------- 10. 新增提交处理 ----------------------
const handleAddSubmit = async () => {
  const isValid = await formData.funcValidate();
  if (!isValid) return;

  try {
    drawerData.status.submitLoading = true;
    // 构造提交数据（复用 PersonPO 接口，过滤无关字段）
    const submitData: PersonPO = {
      name: formData.data.name,
      gender: formData.data.gender as "男" | "女",
      birthday: formData.data.birthday,
      credential: formData.data.credential || [],
      contact: formData.data.contact || [],
      address: formData.data.address || [],
      classifyIds: [], // 可从父组件传入，或补充逻辑
    };

    const response = await $fetch<Res<PersonRes>>(`/api/person`, {
      method: "POST",
      body: submitData,
    });

    if (response.code === 200) {
      ElMessage.success("新增人员成功");
      emit("submit-success");
      handleClose();
    } else {
      ElMessage.error(`新增人员失败：${response.message}`);
    }
  } catch (error) {
    const errorMsg = error instanceof Error ? error.message : "未知错误";
    ElMessage.error(`新增人员失败：${errorMsg}`);
  } finally {
    drawerData.status.submitLoading = false;
  }
};

// ---------------------- 11. 保存编辑提交处理 ----------------------
const handleSaveSubmit = async () => {
  const isValid = await formData.funcValidate();
  if (!isValid) return;
  if (!formData.data.id) {
    ElMessage.error("人员ID不存在，无法保存");
    return;
  }

  try {
    drawerData.status.submitLoading = true;
    // 构造提交数据（复用 PersonPO 接口，包含 ID 用于更新）
    const submitData: PersonPO = {
      id: formData.data.id,
      name: formData.data.name,
      gender: formData.data.gender as "男" | "女",
      birthday: formData.data.birthday,
      credential: formData.data.credential || [],
      contact: formData.data.contact || [],
      address: formData.data.address || [],
      classifyIds: [], // 可从父组件传入，或补充逻辑
    };

    const response = await $fetch<Res<PersonRes>>(
      `/api/person/${formData.data.id}`,
      {
        method: "PATCH",
        body: submitData,
      },
    );

    if (response.code === 200) {
      ElMessage.success("保存人员信息成功");
      emit("submit-success");
      switchToViewMode(); // 保存成功，切换回查看模式
    } else {
      ElMessage.error(`保存人员信息失败：${response.message}`);
    }
  } catch (error) {
    const errorMsg = error instanceof Error ? error.message : "未知错误";
    ElMessage.error(`保存人员信息失败：${errorMsg}`);
  } finally {
    drawerData.status.submitLoading = false;
  }
};
const handleDrawerVisibleChange = (newVisible: boolean) => {
  // 发射 update:visible 事件，让父组件修改 visible 的值
  emit("update:visible", newVisible);
  
  // 若抽屉关闭，同步执行原有关闭逻辑（重置表单、提交状态）
  if (!newVisible) {
    formData.funcReset();
    drawerData.status.submitLoading = false;
  }
};
// ---------------------- 12. 监听 Props 变化，自动加载/重置数据 ----------------------
watch(
  () => [props.mode, props.personId, props.visible],
  ([newMode, newPersonId, newVisible]) => {
    if (import.meta.client && newVisible) {
      if (newMode === "add") {
        formData.funcReset(); // 新增模式，重置表单
      } else if (newPersonId) {
        formData.funcLoad(); // 查看/编辑模式，加载人员详情
      }
    }
  },
  { immediate: true, deep: true },
);
</script>

<style scoped lang="scss">
// 全局 SCSS 变量 fallback（若项目未定义，避免报错）
$spacing-sm: 8px !default;
$spacing-md: 16px !default;
$spacing-xl: 24px !default;
$font-size-xl: 18px !default;
$text-primary: #333 !default;
$text-info: #999 !default;

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

// 可编辑区域样式
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

// 信息容器样式
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

// 抽屉底部样式
.drawer-footer {
  display: flex;
  justify-content: flex-end;
  gap: $spacing-sm;
  padding: $spacing-md;
  border-top: 1px solid #e5e5e5;
}

// 性别文字颜色
.text-male {
  color: #409eff;
}

.text-female {
  color: #f56c6c;
}

// 描述列表样式
:deep(.el-descriptions__label) {
  font-weight: bold;
}

:deep(.el-descriptions__content) {
  padding: $spacing-sm;
}

// 分类标签样式
.classify-tags {
  display: flex;
  flex-wrap: wrap;
  gap: $spacing-sm;
}

// 记录卡片样式
.records-card {
  margin-top: $spacing-md;
}

// 分页容器样式
.pagination-container {
  display: flex;
  justify-content: flex-end;
  margin-top: $spacing-md;
  padding-right: $spacing-sm;
}
</style>
