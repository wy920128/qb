/*
 * @Author: 王野 18545455617@163.com
 * @Date: 2026-01-14 15:57:28
 * @LastEditors: 王野 18545455617@163.com
 * @LastEditTime: 2026-01-15 07:55:59
 * @FilePath: /vip/types/record2tag.ts
 * @Description: types/record2tag 记录关联标签表
 */
import type { PageParams, TimeStamp } from ".";

/** 记录关联标签表-本体 */
interface Record2Tag {
  record_id: number; // 记录ID
  tag_id: number; // 标签ID
  created_time: TimeStamp; // 创建时间
  updated_time: TimeStamp; // 更新时间
  deleted_time: TimeStamp; // 软删除标记
}
/** 记录关联标签表-展示用VO */
interface Record2TagVO extends Record2Tag {
  record_content?: string; // 记录内容
  tag_name?: string; // 标签名称
}
/** 记录关联标签表-提交用PO（创建/更新） */
interface Record2TagPO {
  record_id: number; // 记录ID
  tag_id: number; // 标签ID
}
/** 记录关联标签表-查询用GO（筛选条件） */
interface Record2TagGO extends PageParams {
  record_id?: number;
  tag_id?: number;
  deleted_time?: null; // 筛选未删除数据
}
