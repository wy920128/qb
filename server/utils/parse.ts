/*
 * @Author: 王野 18545455617@163.com
 * @Date: 2026-01-22 16:06:20
 * @LastEditors: 王野 18545455617@163.com
 * @LastEditTime: 2026-01-22 16:06:47
 * @FilePath: /qb/server/utils/parse.ts
 * @Description: 这是默认设置,请设置`customMade`, 打开koroFileHeader查看配置 进行设置: https://github.com/OBKoro1/koro1FileHeader/wiki/%E9%85%8D%E7%BD%AE
 */
export const safeJsonParse = (data: any, defaultValue: any = null) => {
  if (data === null || data === undefined) return defaultValue;
  if (typeof data !== `string`) return data; // 已经不是字符串, 直接返回

  try {
    // 检查是否是有效的JSON字符串
    const trimmed = data.trim();
    if (
      (trimmed.startsWith(`[`) && trimmed.endsWith(`]`)) ||
      (trimmed.startsWith(`{`) && trimmed.endsWith(`}`))
    ) {
      return JSON.parse(data);
    }
    // 如果是普通字符串, 尝试包装为数组
    if (trimmed) {
      return [trimmed]; // 将单个字符串转换为数组
    }
    return defaultValue;
  } catch (error) {
    console.warn(`JSON解析失败, 返回原始数据:`, error);
    return data; // 解析失败返回原始数据
  }
};
