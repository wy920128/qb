/*
 * @Author: 王野 18545455617@163.com
 * @Date: 2026-01-14 15:53:23
 * @LastEditors: 王野 18545455617@163.com
 * @LastEditTime: 2026-01-20 08:10:57
 * @FilePath: /vip/types/auth2classify.ts
 * @Description: types/auth2classify 用户关联分类表
 */
import type { PageParams, Time } from ".";

/** 用户关联分类表-本体 */
export interface Auth2Classify extends Time {
  auth_id: number; // 用户ID
  classify_id: number; // 分类ID
}
/** 用户关联分类表-展示用VO */
interface Auth2ClassifyVO extends Auth2Classify {
  auth_username?: string; // 用户名
  classify_name?: string; // 分类名称
}
/** 用户关联分类表-提交用PO（创建/更新） */
interface Auth2ClassifyPO {
  auth_id: number; // 用户ID
  classify_id: number; // 分类ID
}
/** 用户关联分类表-查询用GO（筛选条件） */
interface Auth2ClassifyGO extends PageParams {
  auth_id?: number;
  classify_id?: number;
  deleted_time?: null; // 筛选未删除数据
}
