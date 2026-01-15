/*
 * @Author: 王野 18545455617@163.com
 * @Date: 2026-01-14 15:49:44
 * @LastEditors: 王野 18545455617@163.com
 * @LastEditTime: 2026-01-14 15:50:04
 * @FilePath: /vip/types/record.ts
 * @Description: types/record 记录
 */
import type { PageParams, TimeStamp } from ".";

/** 记录表-本体 */
interface Record {
  id: number; // 记录主键ID
  content: string; // 事件内容
  created_time: TimeStamp; // 创建时间
  updated_time: TimeStamp; // 更新时间
  deleted_time: TimeStamp; // 软删除标记
}
/** 记录表-展示用VO */
interface RecordVO extends Record {
  person_names?: string[]; // 关联的人员名称
  tag_names?: string[]; // 关联的标签名称
}
/** 记录表-提交用PO（创建/更新） */
interface RecordPO {
  id?: number; // 更新时传，创建时不传
  content: string; // 事件内容
}
/** 记录表-查询用GO（筛选条件） */
interface RecordGO extends PageParams {
  id?: number;
  content?: string; // 全文模糊查询
  person_id?: number; // 关联人员筛选
  tag_id?: number; // 关联标签筛选
  deleted_time?: null; // 筛选未删除数据
}
