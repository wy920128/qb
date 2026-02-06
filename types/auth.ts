/*
 * @Author: 王野 18545455617@163.com
 * @Date: 2026-01-14 15:53:23
 * @LastEditors: 王野 18545455617@163.com
 * @LastEditTime: 2026-02-06 13:21:09
 * @FilePath: /vip/types/auth.ts
 * @Description: types/auth 用户表
 */
import type { PageParams, Time } from ".";

/** 用户-本体 */
export interface Auth {
  id: string; // 用户主键ID
  avatar?: string; // 用户头像
  username: string; // 登录用户名
  password: string; // 加密密码（前端展示时一般隐藏）
  role: string[]; // 用户角色(如superadmin=超级管理员, user1=普通用户)
}
/** 用户-后端返回 */
export interface AuthRes extends Omit<Auth, `password`>, Time {
  token: string;
}
/** 用户表-展示用VO */
export interface AuthVO extends Omit<Auth, `password`> {
  department_names?: string[]; // 关联的部门名称（前端展示用）
  classify_names?: string[]; // 关联的分类名称（前端展示用）
}
/** 用户表-提交用PO（创建/更新） */
export interface AuthPO {
  id?: number; // 更新时传，创建时不传
  username: string; // 登录用户名
  password?: string; // 密码（创建必传，更新可选）
  role: string[]; // 用户角色
}
/** 用户表-查询用GO（筛选条件） */
export interface AuthGO extends PageParams {
  id?: number;
  username?: string; // 模糊查询
  role?: string | string[]; // 角色筛选
  deleted_time?: null; // 筛选未删除数据
}
/** 登陆用PO（登录请求） */
export interface AuthLoginPO {
  username: string; // 登录用户名
  password: string; // 密码
  expiresIn: string; // 过期时间
}
/** 用户认证状态（登录后存储） */
export interface AuthState {
  token?: string; // 认证令牌
  user: Omit<Auth, `password`> | null; // 当前登录用户信息（不包含密码）
  expiresAt: number; // 过期时间戳
  isAuthenticated: boolean; // 是否已认证
}
