/*
 * @Author: 王野 18545455617@163.com
 * @Date: 2025-12-24 09:46:58
 * @LastEditors: 王野 18545455617@163.com
 * @LastEditTime: 2026-01-15 08:58:25
 * @FilePath: /vip/types/person.ts
 * @Description: types/person 人员
 */import type { PageParams, TimeStamp } from ".";/** 人员证件项 */
interface CertificateItem {
  type: string; // 证件类型（如二代身份证、护照）
  value: string; // 证件号
}
/** 人员联系方式项 */
interface ContactItem {
  type: string; // 联系方式类型（如手机号、邮箱）
  value: string; // 联系方式值
}
/** 人员地址项 */
interface AddressItem {
  type: string; // 地址类型（如家庭地址、工作地址）
  value: string; // 地址内容
}
/** 人员表-本体 */
export interface Person {
  id: number; // 人员主键ID
  name: string; // 人员姓名
  gender: '男' | '女'; // 人员性别
  certificate: CertificateItem[]; // 证件信息(JSON数组)
  contact: ContactItem[]; // 联系方式(JSON数组)
  address: AddressItem[]; // 联系地址(JSON数组)
  created_time: TimeStamp; // 创建时间
  updated_time: TimeStamp; // 更新时间
  deleted_time: TimeStamp; // 软删除标记
}
/** 人员表-展示用VO */
export interface PersonVO extends Person {
  classify?: string | string[]; // 关联的分类名称
  tag?: string[]; // 关联的标签名称
  record?: string[]; // 关联的记录内容
}
/** 人员表-提交用PO（创建/更新） */
export interface PersonPO {
  id?: number; // 更新时传，创建时不传
  name: string; // 人员姓名
  gender: '男' | '女'; // 人员性别
  certificate: CertificateItem[]; // 证件信息
  contact: ContactItem[]; // 联系方式
  address: AddressItem[]; // 联系地址
}
/** 人员表-查询用GO（筛选条件） */
export interface PersonGO extends PageParams {
  id?: number;
  name?: string; // 模糊查询
  gender?: '男' | '女';
  classify_id?: number; // 关联分类筛选
  tag_id?: number; // 关联标签筛选
  deleted_time?: null; // 筛选未删除数据
}