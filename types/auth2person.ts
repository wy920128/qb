/*
 * @Author: 王野 18545455617@163.com
 * @Date: 2026-01-14 15:53:46
 * @LastEditors: 王野 18545455617@163.com
 * @LastEditTime: 2026-01-14 15:56:25
 * @FilePath: /vip/types/auth2person.ts
 * @Description: types/auth2person 用户关联人员表
 */
import type { PageParams, TimeStamp } from ".";

/** 用户关联人员表-本体 */
interface Auth2Person {
  auth_id: number; // 用户ID
  person_id: number; // 人员ID
  created_time: TimeStamp; // 创建时间
  updated_time: TimeStamp; // 更新时间
  deleted_time: TimeStamp; // 软删除标记
}
/** 用户关联人员表-展示用VO */
interface Auth2PersonVO extends Auth2Person {
  auth_username?: string; // 用户名
  person_name?: string; // 人员姓名
}
/** 用户关联人员表-提交用PO（创建/更新） */
interface Auth2PersonPO {
  auth_id: number; // 用户ID
  person_id: number; // 人员ID
}
/** 用户关联人员表-查询用GO（筛选条件） */
interface Auth2PersonGO extends PageParams {
  auth_id?: number;
  person_id?: number;
  deleted_time?: null; // 筛选未删除数据
}
