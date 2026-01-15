/*
 * @Author: 王野 18545455617@163.com
 * @Date: 2026-01-14 15:24:41
 * @LastEditors: 王野 18545455617@163.com
 * @LastEditTime: 2026-01-14 15:32:39
 * @FilePath: /vip/types/department.ts
 * @Description: types/department 部门
 */import type { PageParams, TimeStamp } from ".";/** 部门表-本体 */
interface Department {
  id: number; // 部门主键ID
  name: string; // 部门名称
  parent_id: number | null; // 上级部门ID
  level: 1 | 2 | 3; // 部门层级(1=处级/根部门, 2=科级，扩展3级)
  path: string; // 部门层级路径(如"1-3")
  created_time: TimeStamp; // 创建时间
  updated_time: TimeStamp; // 更新时间
  deleted_time: TimeStamp; // 软删除标记
}
/** 部门表-展示用VO（补充关联字段） */
interface DepartmentVO extends Department {
  parent_name?: string; // 上级部门名称
}
/** 部门表-提交用PO（创建/更新） */
interface DepartmentPO {
  id?: number; // 更新时传，创建时不传
  name: string; // 部门名称
  parent_id: number | null; // 上级部门ID
  level: 1 | 2 | 3; // 部门层级
  path: string; // 部门层级路径
}
/** 部门表-查询用GO（筛选条件） */
interface DepartmentGO extends PageParams {
  id?: number;
  name?: string; // 模糊查询
  parent_id?: number | null;
  level?: 1 | 2 | 3;
  deleted_time?: null; // 筛选未删除数据
}
