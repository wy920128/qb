/*
 * @Author: 王野 18545455617@163.com
 * @Date: 2026-01-16 10:51:23
 * @LastEditors: 王野 18545455617@163.com
 * @LastEditTime: 2026-02-02 15:54:01
 * @FilePath: /qb/server/utils/query.ts
 * @Description: 数据库查询工具函数
 */
import mariadb from "mariadb";
import { Pool, PoolConnection } from "mariadb";
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
export const getConnection = async (): Promise<PoolConnection> => {
  try {
    return await pool.getConnection();
  } catch (error) {
    throw new Error(
      `数据库连接失败 [${runtimeConfig.db_aliyun.dbHost}]: ${error}`,
    );
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
  params: any[] = [],
): Promise<T[]> {
  let conn: PoolConnection | null = null;
  try {
    conn = await getConnection();
    const result: T[] = await conn.query<T[]>(sql, params);
    return result;
  } catch (error) {
    throw new Error(`数据库查询失败: ${(error as Error).message}`);
  } finally {
    // 关键修复：连接池的连接需release（放回池），而非end（永久关闭）
    if (conn) conn.release();
  }
}

/**
 * 数据库事务执行函数（原子性操作：要么全成功，要么全回滚）
 * @template T - 事务回调返回值类型（默认any）
 * @param callback - 事务业务逻辑回调，接收连接实例，内部执行SQL
 * @returns 回调函数的返回结果
 * @throws 事务失败时抛出包含回滚信息的异常
 */
export async function utilsTransaction<T = any>(
  callback: (conn: PoolConnection) => Promise<T>,
): Promise<T> {
  let conn: PoolConnection | null = null;

  try {
    // 1. 获取专属连接（事务必须用独立连接）
    conn = await getConnection();
    // 2. 开启事务（关闭自动提交）
    await conn.beginTransaction();

    // 3. 执行事务内的业务逻辑
    const result = await callback(conn);

    // 4. 提交事务
    await conn.commit();
    return result;
  } catch (error) {
    // 5. 任意步骤失败，回滚所有操作
    if (conn) {
      try {
        await conn.rollback();
      } catch (rollbackErr) {
        console.error("事务回滚失败:", (rollbackErr as Error).message);
      }
    }
    throw new Error(`数据库事务执行失败: ${(error as Error).message}`);
  } finally {
    // 6. 释放连接（无论成功/失败，都放回连接池）
    if (conn) conn.release();
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
