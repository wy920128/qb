/*
 * @Author: 王野 18545455617@163.com
 * @Date: 2026-01-14 15:50:23
 * @LastEditors: 王野 18545455617@163.com
 * @LastEditTime: 2026-01-20 08:11:19
 * @FilePath: /vip/types/auth2department.ts
 * @Description: types/auth2department 用户关联部门表
 */
import type { PageParams, Time } from ".";

/** 用户关联部门表-本体 */
interface Auth2Department extends Time{
  auth_id: number; // 用户ID
  department_id: number; // 部门ID
}
/** 用户关联部门表-展示用VO */
interface Auth2DepartmentVO extends Auth2Department {
  auth_username?: string; // 用户名
  department_name?: string; // 部门名称
}
/** 用户关联部门表-提交用PO（创建/更新） */
interface Auth2DepartmentPO {
  auth_id: number; // 用户ID
  department_id: number; // 部门ID
}
/** 用户关联部门表-查询用GO（筛选条件） */
interface Auth2DepartmentGO extends PageParams {
  auth_id?: number;
  department_id?: number;
  deleted_time?: null; // 筛选未删除数据
}
