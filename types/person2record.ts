/*
 * @Author: 王野 18545455617@163.com
 * @Date: 2026-01-14 15:59:45
 * @LastEditors: 王野 18545455617@163.com
 * @LastEditTime: 2026-01-14 16:06:26
 * @FilePath: /vip/types/person2record.ts
 * @Description: types/person2record 人员关联记录表
 */
import type { PageParams, TimeStamp } from ".";

/** 人员关联记录表-本体 */
interface Person2Record {
  person_id: number; // 人员ID
  record_id: number; // 记录ID
  created_time: TimeStamp; // 创建时间
  updated_time: TimeStamp; // 更新时间
  deleted_time: TimeStamp; // 软删除标记
}
/** 人员关联记录表-展示用VO */
interface Person2RecordVO extends Person2Record {
  person_name?: string; // 人员姓名
  record_content?: string; // 记录内容
}
/** 人员关联记录表-提交用PO（创建/更新） */
interface Person2RecordPO {
  person_id: number; // 人员ID
  record_id: number; // 记录ID
}
/** 人员关联记录表-查询用GO（筛选条件） */
interface Person2RecordGO extends PageParams {
  person_id?: number;
  record_id?: number;
  deleted_time?: null; // 筛选未删除数据
}
