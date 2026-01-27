/*
 * @Author: 王野 18545455617@163.com
 * @Date: 2026-01-27 09:43:04
 * @LastEditors: 王野 18545455617@163.com
 * @LastEditTime: 2026-01-27 10:04:43
 * @FilePath: /qb/types/menu.ts
 * @Description: 菜单接口
 */
import type { Auth } from "./";

export interface Menu {
  index: string; // 菜单路由
  label: string; // 菜单名称
  icon: any; // 菜单图标
  divider?: boolean; // 是否显示分隔线
  show?: (user: Auth | null) => boolean; // 显示条件
}
