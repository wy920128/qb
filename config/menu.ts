/*
 * @Author: 王野 18545455617@163.com
 * @Date: 2026-01-27 07:50:19
 * @LastEditors: 王野 18545455617@163.com
 * @LastEditTime: 2026-01-27 13:53:51
 * @FilePath: /qb/config/menu.ts
 * @Description: 菜单配置
 */
import { House, Setting, SwitchButton, User } from "@element-plus/icons-vue";
import type { Auth, Menu } from "~/types";

export const menuData: {
  header: Menu[];
  right: Menu[];
} = {
  header: [
    { index: `/`, icon: House, label: `首页`, show: () => true },
    {
      index: `/person/list`,
      icon: User,
      label: `重点人员`,
      show: (user) =>
        user?.role?.includes(`superadmin`) ||
        user?.role?.includes(`user1`) ||
        false,
    },
    {
      index: `/management`,
      icon: Setting,
      label: `平台管理`,
      show: (user) => user?.role?.includes(`superadmin`) || false,
    },
  ],
  right: [
    {
      index: `profile`,
      icon: User,
      label: `个人信息`,
      show: (user) => !!user,
    },
    {
      index: `settings`,
      icon: Setting,
      label: `系统设置`,
      show: (user: any) =>
        user?.role?.includes(`admin`) || user?.role?.includes(`superadmin`),
    },
    {
      index: `logout`,
      icon: SwitchButton,
      label: `退出登录`,
      show: (user: any) => !!user,
    },
  ],
};

export const getFilteredMenu: (user: Auth) => {
  header: Menu[];
  right: Menu[];
} = (user) => {
  if (!user) {
    return { header: menuData.header.filter((menu) => !menu.show), right: [] };
  }
  return {
    header: menuData.header.filter((menu) => {
      if (menu.show) {
        return menu.show(user);
      }
      return true;
    }),
    right: menuData.right.filter((menu) => {
      if (menu.show) {
        return menu.show(user);
      }
      return true;
    }),
  };
};
