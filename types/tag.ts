/*
 * @Author: 王野 18545455617@163.com
 * @Date: 2026-01-14 15:40:41
 * @LastEditors: 王野 18545455617@163.com
 * @LastEditTime: 2026-01-22 14:49:09
 * @FilePath: /vip/types/tag.ts
 * @Description: types/tag 标签
 */
import type { PageParams, Time, TimeStamp } from ".";
/** 标签-本体 */
interface Tag {
  id: number; // 标签主键ID
  name: string; // 标签名称(如涉酒, 涉毒, 涉赌等)
  created_time: TimeStamp; // 创建时间
  updated_time: TimeStamp; // 更新时间
  deleted_time: TimeStamp; // 软删除标记
}
/** 标签-后端返回 */
export interface TagRes extends Tag, Time {}
/** 标签表-展示用VO */
interface TagVO extends Tag {}
/** 标签表-提交用PO（创建/更新） */
interface TagPO {
  id?: number; // 更新时传，创建时不传
  name: string; // 标签名称
}
/** 标签表-查询用GO（筛选条件） */
interface TagGO extends PageParams {
  id?: number;
  name?: string; // 模糊查询
  deleted_time?: null; // 筛选未删除数据
}
