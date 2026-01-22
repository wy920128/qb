/*
 * @Author: 王野 18545455617@163.com
 * @Date: 2025-12-25 15:25:00
 * @LastEditors: 王野 18545455617@163.com
 * @LastEditTime: 2026-01-22 09:33:23
 * @FilePath: /vip/types/classify.ts
 * @Description: types/classify 分类
 */
import type { PageParams, Time } from ".";
/** 分类-本体 */
export interface Classify {
  id: number; // 分类主键ID
  name: string; // 分类名称(如涉酒, 涉毒, 涉赌等)
}
/** 分类-后端返回 */
export interface ClassifyRes extends Classify, Time {}
/** 分类表-展示用VO */
export interface ClassifyVO extends Classify {}
/** 分类表-提交用PO（创建/更新） */
export interface ClassifyPO {
  id?: number; // 更新时传，创建时不传
  name: string; // 分类名称
}
/** 分类表-查询用GO（筛选条件） */
export interface ClassifyGO extends PageParams {
  id?: number;
  name?: string; // 模糊查询
  deleted_time?: null; // 筛选未删除数据
}
