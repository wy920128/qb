/**
 * 分页查询参数接口 (通常与Res配合使用)
 */
export interface PageParams {
  page?: number; // 当前页码
  pageSize?: number; // 每页大小
}

/** 通用时间字段类型（后端返回的时间戳/ISO字符串） */
export type TimeStamp = string | null;

/**
 * 通用API响应接口
 * @param T 数据类型泛型，默认为any
 */
export interface Res<T = any> {
  // 状态码 (通常200或0表示成功)
  code: number;
  // 响应消息 (成功或错误信息)
  message: string;
  // 核心响应数据 (使用泛型)
  data: {
    list: T;
    pagination: {
      page: number; // 当前页码
      pageSize: number; // 每页大小
      total: number; // 总数
      totalPages: number; // 总页数
    };
  };
  success: boolean;
  // 可选字段：分页信息 (对于列表数据)
  pagination?: {
    current: number; // 当前页码
    pageSize: number; // 每页大小
    total: number; // 总数
    totalPages: number; // 总页数
  };
  // 可选字段：时间戳
  timestamp: TimeStamp;
}

export * from "./auth";
export * from "./auth2classify";
export * from "./auth2department";
export * from "./auth2person";
export * from "./classify";
export * from "./department";
export * from "./person";
export * from "./person2classify";
export * from "./person2record";
export * from "./record";
export * from "./record2tag";
export * from "./tag";
