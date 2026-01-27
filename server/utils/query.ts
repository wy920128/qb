/*
 * @Author: 王野 18545455617@163.com
 * @Date: 2026-01-16 10:51:23
 * @LastEditors: 王野 18545455617@163.com
 * @LastEditTime: 2026-01-26 16:17:01
 * @FilePath: /qb/server/utils/query.ts
 * @Description: 数据库查询工具函数
 */
import mariadb from "mariadb";
import { Pool } from "mariadb";
import type { Connection } from "mariadb/promise";
import type { PoolConfig } from "mariadb";

const runtimeConfig = useRuntimeConfig();
// 配置连接池
const poolConfig: PoolConfig = {
  host: runtimeConfig.db_aliyun.dbHost,
  user: runtimeConfig.db_aliyun.dbUser,
  password: runtimeConfig.db_aliyun.dbPassword,
  database: runtimeConfig.db_aliyun.dbName,
  port: parseInt(runtimeConfig.db_aliyun.dbPort!),
  connectionLimit: 10,
  connectTimeout: 5000,
};

// 创建连接池
export const pool: Pool = mariadb.createPool(poolConfig);

/**
 * 获取数据库连接
 * @returns 数据库连接实例
 */
export const getConnection = async (): Promise<Connection> => {
  try {
    return await pool.getConnection();
  } catch (error) {
    throw new Error(`数据库连接失败 [${runtimeConfig.db_aliyun.dbHost}]: ${error}`);
  }
};

/**
 * 通用查询函数（适用于 SELECT 等返回结果集的操作）
 * @param sql SQL语句
 * @param params 参数数组
 * @returns 查询结果（泛型类型，由调用方指定）
 */
export async function utilsQuery<T = any>(
  sql: string,
  params: any[] = []
): Promise<T[]> {
  let conn: Connection | null = null;
  try {
    conn = await getConnection();
    const result: T[] = await conn.query<T[]>(sql, params);
    return result;
  } catch (error) {
    throw new Error(`数据库查询失败: ${(error as Error).message}`);
  } finally {
    if (conn) conn.end();
  }
}

/**
 * 关闭连接池（应用退出时调用）
 */
export const closePool = async (): Promise<void> => {
  try {
    await pool.end();
  } catch (error) {
    throw error;
  }
};
