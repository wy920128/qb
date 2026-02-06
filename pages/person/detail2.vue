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
        <div class="drawer-header">
          <h2 class="drawer-title">{{ drawerTitle }}</h2>
        </div>
        <el-card class="basic-info-card" shadow="hover">
          <template #header>
            <div class="card-header">
              <span class="card-title">基本信息</span>
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
              <el-descriptions-item
                label="分类标签"
                class="desc-item"
                :span="2"
              >
                <div class="classify-tags">
                  <template
                    v-if="
                      formData.data.classify &&
                      formData.data.classify.length > 0
                    "
                  >
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
                  </template>
                  <span v-else class="no-data">暂无分类标签</span>
                </div>
              </el-descriptions-item>
              <el-descriptions-item
                label="创建时间"
                class="desc-item"
                v-if="mode !== 'add'"
              >
                <span class="desc-value">{{
                  formatDateTime(formData.data.created_time) || "暂无"
                }}</span>
              </el-descriptions-item>
              <el-descriptions-item
                label="更新时间"
                class="desc-item"
                v-if="mode !== 'add'"
              >
                <span class="desc-value">{{
                  formatDateTime(formData.data.updated_time) || "暂无"
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
          <el-form :model="formData.data" :disabled="mode === 'view'">
            <el-descriptions :column="1" border>
              <el-descriptions-item label="证件信息" class="desc-item">
                <div class="info-array-container">
                  <template v-if="mode === 'view'">
                    <template
                      v-if="
                        formData.data.credential &&
                        formData.data.credential.length > 0
                      "
                    >
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
              <el-descriptions-item label="联系方式" class="desc-item">
                <div class="info-array-container">
                  <template v-if="mode === 'view'">
                    <template
                      v-if="
                        formData.data.contact &&
                        formData.data.contact.length > 0
                      "
                    >
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
              <el-descriptions-item label="联系地址" class="desc-item">
                <div class="info-array-container">
                  <template v-if="mode === 'view'">
                    <template
                      v-if="
                        formData.data.address &&
                        formData.data.address.length > 0
                      "
                    >
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
        <!-- 相关记录模块 - 适配 string 类型 flag_inJQ -->
        <el-card class="records-card" shadow="hover" v-if="mode !== 'add'">
          <template #header>
            <div class="card-header">
              <span class="card-title">相关记录</span>
              <!-- 编辑模式显示添加记录按钮 -->
              <el-button
                v-if="mode === 'edit'"
                type="primary"
                text
                :icon="Plus"
                @click="showAddRecordForm = true"
                class="add-record-btn"
              >
                添加记录
              </el-button>
            </div>
          </template>

          <!-- 编辑模式下的新增记录表单 -->
          <el-form
            v-if="mode === 'edit' && showAddRecordForm"
            ref="recordFormRef"
            :model="newRecordForm"
            :rules="recordFormRules"
            inline
            class="add-record-form"
          >
            <el-form-item prop="content">
              <el-input
                v-model="newRecordForm.content"
                placeholder="请输入记录内容"
                type="textarea"
                :rows="3"
                style="width: 600px"
              />
            </el-form-item>
            <el-form-item prop="flag_inJQ">
              <el-radio-group v-model="newRecordForm.flag_inJQ">
                <!-- 适配 string 类型：value 为 "是"/"否" -->
                <el-radio value="是">是</el-radio>
                <el-radio value="否">否</el-radio>
              </el-radio-group>
              <span class="form-tip">是否在警情中记录</span>
            </el-form-item>
            <el-form-item>
              <el-button
                type="primary"
                @click="handleAddRecord"
                :loading="drawerData.status.addRecordLoading"
              >
                提交
              </el-button>
              <el-button text @click="showAddRecordForm = false"
                >取消</el-button
              >
            </el-form-item>
          </el-form>

          <!-- 记录表格：直接展示 string 类型的 flag_inJQ -->
          <el-table
            v-loading="drawerData.status.loading"
            :data="pagedRecordList"
            stripe
            border
            style="width: 100%"
            empty-text="暂无相关记录"
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
              prop="flag_inJQ"
              label="是否在警情中记录"
              width="180"
              class-name="table-col-bool"
            >
              <template #default="{ row }">
                <!-- 直接展示字符串值（是/否），无需转换 -->
                {{ row.flag_inJQ || "否" }}
              </template>
            </el-table-column>
            <el-table-column
              align="center"
              prop="created_time"
              label="创建时间"
              width="180"
              class-name="table-col-time"
            >
              <template #default="{ row }">
                {{ formatDateTime(row.created_time) }}
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
                    v-for="tag in row.tag || []"
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
          <div class="pagination-container">
            <el-pagination
              v-model:current-page="paginationData.current"
              v-model:page-size="paginationData.pageSize"
              :page-sizes="[5, 10, 20, 50]"
              :total="formData.data.record?.length || 0"
              layout="total, sizes, prev, pager, next, jumper"
              @size-change="handlePageSizeChange"
              @current-change="handlePageChange"
              background
              class="custom-pagination"
            />
          </div>
        </el-card>
        <div
          v-if="
            !drawerData.status.loading &&
            mode !== 'add' &&
            (!formData.data.id || formData.data.id === 0)
          "
          class="empty-state"
        >
          <el-empty description="暂无人员数据" />
        </div>
      </div>
    </ClientOnly>
    <template #footer>
      <div class="drawer-footer">
        <el-button @click="handleClose">关闭</el-button>
        <template v-if="mode === 'add'">
          <el-button
            type="primary"
            @click="handleAddSubmit"
            :loading="drawerData.status.submitLoading"
          >
            新增
          </el-button>
        </template>
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
        <template v-if="mode === 'view'">
          <el-button type="primary" @click="switchToEditMode">编辑</el-button>
        </template>
      </div>
    </template>
  </el-drawer>
</template>

<script setup lang="ts">
import { reactive, ref, watch, computed, onMounted } from "vue";
import { ElMessage, type FormInstance, type FormRules } from "element-plus";
import { Delete, Plus } from "@element-plus/icons-vue";
import type {
  PersonRes,
  Res,
  PersonPO,
  CredentialItem,
  ContactItem,
  AddressItem,
  Classify,
} from "~/types";
// 导入 Record 相关类型（已调整 flag_inJQ 为 string 类型）
import type { RecordRes, RecordPO } from "~/types";
import { formatDateTime } from "~/utils/formatData.util";

// ---------------------- 1. Props 定义 ----------------------
interface Props {
  visible: boolean;
  mode: `add` | `edit` | `view`;
  personId?: number;
  direction?: `ltr` | `rtl` | `ttb` | `btt`;
  size?: string | number;
  classifyIds?: number[];
}
const props = withDefaults(defineProps<Props>(), {
  visible: false,
  mode: `view`,
  personId: 0,
  direction: `ltr`,
  size: `90%`,
  classifyIds: () => [],
});

// ---------------------- 2. Emit 定义 ----------------------
const emit = defineEmits<{
  (e: `update:visible`, value: boolean): void;
  (e: `update:mode`, value: `add` | `edit` | `view`): void;
  (e: `close`): void;
  (e: `submit-success`): void;
}>();

// ---------------------- 3. 响应式数据 ----------------------
const drawerData = reactive({
  status: {
    loading: false,
    submitLoading: false,
    // 添加记录的加载状态
    addRecordLoading: false,
  },
});
const formRef = ref<FormInstance>();

// 记录表单相关响应式数据（适配 string 类型 flag_inJQ）
const recordFormRef = ref<FormInstance>();
const showAddRecordForm = ref(false); // 控制新增记录表单显示/隐藏
const newRecordForm = reactive<Partial<RecordRes>>({
  content: "",
  flag_inJQ: "否", // 默认值改为 string 类型的 "否"
});

// 记录表单验证规则（适配 string 类型 flag_inJQ）
const recordFormRules = reactive<FormRules>({
  content: [
    { required: true, message: "请输入记录内容", trigger: "blur" },
    { min: 1, max: 500, message: "记录内容长度1-500字符", trigger: "blur" },
  ],
  flag_inJQ: [
    { required: true, message: "请选择是否在警情中记录", trigger: "change" },
    {
      validator: (rule, value, callback) => {
        // 验证值必须是 "是" 或 "否"
        if (value === "是" || value === "否") {
          callback();
        } else {
          callback(new Error("请选择正确的选项（是/否）"));
        }
      },
      trigger: "change",
    },
  ],
});

const formData = reactive({
  data: {
    id: 0,
    name: ``,
    gender: `男`,
    birthday: ``,
    credential: [] as CredentialItem[],
    contact: [] as ContactItem[],
    address: [] as AddressItem[],
    classify: [] as string[],
    record: [] as RecordRes[], // 明确指定 RecordRes 类型（flag_inJQ 为 string）
    created_time: ``,
    updated_time: ``,
    deleted_time: null,
  },
  rules: {
    name: [
      { required: true, message: `请输入姓名`, trigger: `blur` },
      {
        min: 2,
        max: 50,
        message: `姓名长度在 2 到 50 个字符`,
        trigger: `blur`,
      },
    ],
    gender: [{ required: true, message: `请选择性别`, trigger: `change` }],
    birthday: [
      { required: true, message: `请选择出生日期`, trigger: `change` },
    ],
  } as FormRules,
  // 表单操作方法
  funcAddAddress: () => {
    formData.data.address.push({ type: `家庭地址`, value: `` });
  },
  funcAddContact: () => {
    formData.data.contact.push({ type: `手机`, value: `` });
  },
  funcAddCredential: () => {
    formData.data.credential.push({ type: `身份证`, value: `` });
  },
  funcReset: () => {
    formData.data = {
      id: 0,
      name: ``,
      gender: `男`,
      birthday: ``,
      credential: [],
      contact: [],
      address: [],
      classify: [],
      record: [],
      created_time: ``,
      updated_time: ``,
      deleted_time: null,
    };
    formRef.value?.clearValidate();
    // 重置记录表单
    showAddRecordForm.value = false;
    newRecordForm.content = "";
    newRecordForm.flag_inJQ = "否"; // 重置为 string 类型的 "否"
    recordFormRef.value?.clearValidate();
  },
  funcRemoveAddress: (index: number) => {
    formData.data.address.splice(index, 1);
  },
  funcRemoveContact: (index: number) => {
    formData.data.contact.splice(index, 1);
  },
  funcRemoveCredential: (index: number) => {
    formData.data.credential.splice(index, 1);
  },
  funcGetClassify: async () => {
    try {
      const response = await $fetch<Res<Classify[]>>(`/api/classify/get`, {
        method: `GET`,
        params: { id: props.classifyIds.join(`,`) },
      });
      if (response.code === 200) {
        formData.data.classify.splice(
          0,
          formData.data.classify.length,
          ...(response.data?.list?.map((item) => item.name || ``) || []),
        );
      }
    } catch (error) {
      ElMessage.error(`加载分类列表失败：${error}`);
      console.error(`分类列表加载异常：`, error);
    }
  },
  funcLoad: async () => {
    // Nuxt 4 服务端保护
    if (import.meta.server || !props.personId) return;
    try {
      drawerData.status.loading = true;
      const response = await $fetch<Res<PersonRes[]>>(
        `/api/person/${props.personId}`,
        { method: `GET` },
      );
      if (response.code === 200 && response.data) {
        const personList: PersonRes[] = response.data.list || [];
        const targetPerson = personList[0];
        if (targetPerson) {
          formData.data = {
            id: targetPerson.id || 0,
            name: targetPerson.name || ``,
            gender: targetPerson.gender || `男`,
            birthday: targetPerson.birthday || ``,
            credential: targetPerson.credential || [],
            contact: targetPerson.contact || [],
            address: targetPerson.address || [],
            classify: targetPerson.classify ?? [],
            record: targetPerson.record || [], // RecordRes 中 flag_inJQ 为 string 类型
            created_time: targetPerson.created_time || ``,
            updated_time: targetPerson.updated_time || ``,
            deleted_time: null,
          };
        } else {
          ElMessage.error(`未找到人员信息`);
          formData.funcReset();
        }
      } else {
        ElMessage.error(`获取人员信息失败`);
        formData.funcReset();
      }
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : `未知错误`;
      ElMessage.error(`获取人员信息失败：${errorMsg}`);
      formData.funcReset();
    } finally {
      drawerData.status.loading = false;
    }
  },
  funcValidate: async (): Promise<boolean> => {
    if (!formRef.value) return false;
    try {
      await formRef.value.validate();
      return true;
    } catch (error) {
      ElMessage.error(`表单验证失败，请检查输入`);
      return false;
    }
  },
});

const paginationData = reactive({
  current: 1,
  pageSize: 10,
});

// ---------------------- 4. 计算属性 ----------------------
const pagedRecordList = computed(() => {
  const records = formData.data.record || [];
  const start = (paginationData.current - 1) * paginationData.pageSize;
  const end = start + paginationData.pageSize;
  return records.slice(start, end);
});
const drawerTitle = computed(() => {
  const titleMap = {
    add: `新增人员`,
    edit: `编辑人员信息`,
    view: `人员详情`,
  };
  return titleMap[props.mode];
});

// ---------------------- 5. 方法 ----------------------
const handlePageChange = (page: number) => {
  paginationData.current = page;
};
const handlePageSizeChange = (size: number) => {
  paginationData.pageSize = size;
  paginationData.current = 1;
};

// 处理添加记录逻辑（适配 string 类型 flag_inJQ）
const handleAddRecord = async () => {
  if (!recordFormRef.value) return;
  try {
    // 表单验证
    await recordFormRef.value.validate();
    drawerData.status.addRecordLoading = true;

    // 构造提交数据（flag_inJQ 为 string 类型的 "是"/"否"）
    const submitData: RecordPO = {
      content: newRecordForm.content!.trim(),
      flag_inJQ: newRecordForm.flag_inJQ!, // 直接传递 string 类型值
      // 如需关联人员ID，补充 person_id
      // person_id: formData.data.id,
    };

    // 调用新增记录接口（替换为项目真实接口）
    // const response = await $fetch<Res<RecordRes[]>>(`/api/record/post`, {
    //   method: `POST`,
    //   body: submitData,
    // });

    // 模拟接口成功（实际开发删除此段，使用真实接口）
    const mockNewRecord: RecordRes = {
      id: Math.floor(Math.random() * 10000), // 模拟ID
      content: newRecordForm.content!,
      flag_inJQ: newRecordForm.flag_inJQ!, // string 类型的 "是"/"否"
      created_time: new Date().toDateString(), // 模拟时间戳
      updated_time: new Date().toDateString(), // 模拟时间戳
      deleted_time: null,
      tag: [], // 暂无标签
    };

    // 成功处理（真实接口逻辑）
    // if (response.code === 200 && response.data) {
    //   const newRecord = response.data.list?.[0];
    //   if (newRecord) {
    //     formData.data.record.unshift(newRecord); // 添加到列表头部
    //   }
    // }

    // 模拟成功：添加到本地列表
    formData.data.record.unshift(mockNewRecord);
    ElMessage.success("新增记录成功");
    // 重置表单
    showAddRecordForm.value = false;
    newRecordForm.content = "";
    newRecordForm.flag_inJQ = "否"; // 重置为 string 类型的 "否"
    recordFormRef.value.clearValidate();
  } catch (error) {
    const errorMsg = error instanceof Error ? error.message : `未知错误`;
    ElMessage.error(`新增记录失败：${errorMsg}`);
  } finally {
    drawerData.status.addRecordLoading = false;
  }
};

const switchToEditMode = () => {
  emit(`update:mode`, `edit`);
};
const switchToViewMode = () => {
  emit(`update:mode`, `view`);
  formRef.value?.clearValidate();
  // 切换回查看模式时隐藏记录表单
  showAddRecordForm.value = false;
  recordFormRef.value?.clearValidate();
};
const handleClose = () => {
  emit(`update:visible`, false);
  emit(`close`);
  formData.funcReset();
  drawerData.status.submitLoading = false;
};
const handleDrawerVisibleChange = (newVisible: boolean) => {
  emit(`update:visible`, newVisible);
  if (!newVisible) {
    formData.funcReset();
    drawerData.status.submitLoading = false;
  }
};
const handleAddSubmit = async () => {
  const isValid = await formData.funcValidate();
  if (!isValid) return;
  try {
    drawerData.status.submitLoading = true;
    const submitData: PersonPO = {
      name: formData.data.name.trim(),
      gender: formData.data.gender as `男` | `女`,
      birthday: formData.data.birthday,
      credential: (formData.data.credential || []).filter(
        (item) => item.value.trim() !== ``,
      ),
      contact: (formData.data.contact || []).filter(
        (item) => item.value.trim() !== ``,
      ),
      address: (formData.data.address || []).filter(
        (item) => item.value.trim() !== ``,
      ),
      classifyIds: props.classifyIds || [],
    };
    const response = await $fetch<Res<PersonRes[]>>(`/api/person/post`, {
      method: `POST`,
      body: submitData,
    });
    if (response.code === 200 && response.data) {
      const personList: PersonRes[] = response.data.list || [];
      const newPerson = personList[0];
      if (newPerson) {
        ElMessage.success(`新增人员成功`);
        emit(`submit-success`);
        handleClose();
      } else {
        ElMessage.error(`新增人员成功但返回数据异常`);
      }
    } else {
      ElMessage.error(`新增人员失败：${response.message}`);
    }
  } catch (error) {
    const errorMsg = error instanceof Error ? error.message : `未知错误`;
    ElMessage.error(`新增人员失败：${errorMsg}`);
  } finally {
    drawerData.status.submitLoading = false;
  }
};
const handleSaveSubmit = async () => {
  const isValid = await formData.funcValidate();
  if (!isValid) return;
  if (!formData.data.id) {
    ElMessage.error(`人员ID不存在，无法保存`);
    return;
  }
  try {
    drawerData.status.submitLoading = true;
    const submitData: PersonPO = {
      id: formData.data.id,
      name: formData.data.name.trim(),
      gender: formData.data.gender as `男` | `女`,
      birthday: formData.data.birthday,
      credential: (formData.data.credential || []).filter(
        (item) => item.value.trim() !== ``,
      ),
      contact: (formData.data.contact || []).filter(
        (item) => item.value.trim() !== ``,
      ),
      address: (formData.data.address || []).filter(
        (item) => item.value.trim() !== ``,
      ),
      classifyIds: props.classifyIds || [],
    };
    const response = await $fetch<Res<PersonRes[]>>(
      `/api/person/${formData.data.id}`,
      {
        method: `PATCH`,
        body: submitData,
      },
    );
    if (response.code === 200 && response.data) {
      const personList: PersonRes[] = response.data.list || [];
      const updatedPerson = personList[0];
      if (updatedPerson) {
        ElMessage.success(`保存人员信息成功`);
        const updatedData = {
          id: updatedPerson.id || formData.data.id,
          name: updatedPerson.name || formData.data.name,
          gender: updatedPerson.gender || formData.data.gender,
          birthday: updatedPerson.birthday || formData.data.birthday,
          credential: updatedPerson.credential || formData.data.credential,
          contact: updatedPerson.contact || formData.data.contact,
          address: updatedPerson.address || formData.data.address,
          classify: updatedPerson.classify ?? formData.data.classify,
          record: updatedPerson.record || formData.data.record, // 保留 string 类型的 flag_inJQ
          created_time:
            updatedPerson.created_time || formData.data.created_time,
          updated_time:
            updatedPerson.updated_time || formData.data.updated_time,
          deleted_time: null,
        };
        formData.data = updatedData;
        emit(`submit-success`);
        switchToViewMode();
      } else {
        ElMessage.error(`保存成功但返回数据异常`);
      }
    } else {
      ElMessage.error(`保存人员信息失败：${response.message}`);
    }
  } catch (error) {
    const errorMsg = error instanceof Error ? error.message : `未知错误`;
    ElMessage.error(`保存人员信息失败：${errorMsg}`);
  } finally {
    drawerData.status.submitLoading = false;
  }
};

// ---------------------- 6. 监听器 ----------------------
watch(
  () => [props.mode, props.personId, props.classifyIds, props.visible],
  (newValues, oldValues) => {
    if (import.meta.server) return;
    const [newMode, newPersonId, newClassifyIds, newVisible] = newValues;
    const [oldMode, oldPersonId, oldClassifyIds, oldVisible] = oldValues || [];
    if (newVisible) {
      if (newMode === `add`) {
        formData.funcReset();
        formData.funcGetClassify();
        paginationData.current = 1;
      } else if (
        newPersonId &&
        (newPersonId !== oldPersonId || newMode !== oldMode)
      ) {
        formData.funcLoad();
      }
    }
  },
  { immediate: true },
);

// 客户端初始化
onMounted(() => {
  if (
    import.meta.client &&
    props.visible &&
    props.mode !== `add` &&
    props.personId
  ) {
    formData.funcLoad();
  }
});

// 补充 formatDate 方法（适配日期格式化）
const formatDate = (dateStr: string) => {
  if (!dateStr) return "";
  return formatDateTime(dateStr); // 复用已有的 formatDateTime
};
</script>

<style scoped lang="scss">
// 全局 SCSS 变量 fallback
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

// 记录相关样式
.add-record-btn {
  margin-left: auto;
}

.add-record-form {
  margin-bottom: $spacing-md;
  padding: $spacing-sm;
  border: 1px solid #f0f0f0;
  border-radius: 4px;

  .form-tip {
    margin-left: $spacing-sm;
    color: $text-info;
    font-size: 12px;
  }
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

.empty-state {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 200px;
}

.no-data {
  color: $text-info;
  font-style: italic;
}

// 响应式设计
@media (max-width: 768px) {
  .person-detail-container {
    padding: $spacing-md;
  }

  .drawer-footer {
    flex-direction: column;
    gap: $spacing-sm;

    .el-button {
      width: 100%;
      margin-left: 0;
    }
  }

  :deep(.el-descriptions) {
    &.info-descriptions {
      .el-descriptions__header {
        display: none;
      }

      .el-descriptions-item {
        display: block;
        width: 100%;

        .el-descriptions-item__label {
          width: 100px;
        }

        .el-descriptions-item__content {
          flex: 1;
        }
      }
    }
  }

  // 响应式：适配新增记录表单
  .add-record-form {
    :deep(.el-input) {
      width: 100% !important;
    }
  }
}
</style>
