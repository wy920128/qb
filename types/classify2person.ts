import type { PageParams, TimeStamp } from ".";

/** 人员关联分类表-本体 */
interface classify2person {
  person_id: number; // 人员ID
  classify_id: number; // 分类ID
  created_time: TimeStamp; // 创建时间
  updated_time: TimeStamp; // 更新时间
  deleted_time: TimeStamp; // 软删除标记
}
/** 人员关联分类表-展示用VO */
interface classify2personVO extends classify2person {
  person_name?: string; // 人员姓名
  classify_name?: string; // 分类名称
}
/** 人员关联分类表-提交用PO（创建/更新） */
interface classify2personPO {
  person_id: number; // 人员ID
  classify_id: number; // 分类ID
}
/** 人员关联分类表-查询用GO（筛选条件） */
interface classify2personGO extends PageParams {
  person_id?: number;
  classify_id?: number;
  deleted_time?: null; // 筛选未删除数据
}
