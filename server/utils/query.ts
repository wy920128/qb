/*
 * @Author: 王野 18545455617@163.com
 * @Date: 2026-01-16 10:51:23
 * @LastEditors: 王野 18545455617@163.com
 * @LastEditTime: 2026-02-06 12:50:24
 * @FilePath: /qb/server/utils/query.ts
 * @Description: 修复数据库查询工具函数 - 解决迭代器错误
 */
import mariadb from "mariadb";
import { Pool, PoolConnection } from "mariadb";
import type { PoolConfig } from "mariadb";

const runtimeConfig = useRuntimeConfig();

// 配置连接池
const poolConfig: PoolConfig = {
  host: runtimeConfig.db.dbHost,
  user: runtimeConfig.db.dbUser,
  password: runtimeConfig.db.dbPassword,
  database: runtimeConfig.db.dbName,
  port: parseInt(runtimeConfig.db.dbPort!),
  connectionLimit: 10,
  connectTimeout: 5000,
  multipleStatements: false,
  rowsAsArray: false,
};

const pool: Pool = mariadb.createPool(poolConfig);

/**
 * 获取数据库连接
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
 * 安全执行函数 - 修复迭代器问题
 */
const execute = async (
  sql: string,
  params: any[] = [],
  conn?: PoolConnection,
) => {
  let connection: PoolConnection | null = conn || null;
  const isExternalConn = !!conn;

  try {
    if (!connection) connection = await getConnection();

    // 使用更安全的查询方式
    const result = await connection.query(sql, params);

    // 修复：确保返回格式统一，避免迭代器错误
    return safeNormalizeResult(result);
  } catch (error) {
    console.error("SQL执行错误:", {
      sql: sql.substring(0, 200),
      params,
      error: error instanceof Error ? error.message : String(error),
    });
    throw new Error(`SQL执行失败: ${(error as Error).message}`);
  } finally {
    if (connection && !isExternalConn) connection.release();
  }
};

/**
 * 安全规范化结果 - 核心修复函数
 */
const safeNormalizeResult = (result: any) => {
  // 如果结果是数组，直接返回
  if (Array.isArray(result)) {
    return result;
  }

  // 如果结果是对象且有 insertId/lastInsertId，说明是插入操作
  if (result && typeof result === "object") {
    // 检查是否是MariaDB的ResultSet对象
    if (result.insertId !== undefined || result.affectedRows !== undefined) {
      return result;
    }

    // 如果是普通对象，包装成数组（单行查询结果）
    return [result];
  }

  // 其他情况返回空数组
  console.warn("无法识别的查询结果格式:", typeof result, result);
  return [];
};

/**
 * 修复版通用查询函数
 */
export async function utilsQuery<T = any>(
  sql: string,
  params: any[] = [],
  conn?: PoolConnection,
): Promise<T[]> {
  const result = await execute(sql, params, conn);

  // 确保返回的是数组
  if (Array.isArray(result)) {
    return result as T[];
  }

  // 如果是单个对象，包装成数组
  if (result && typeof result === "object") {
    return [result] as T[];
  }

  return [] as T[];
}

/**
 * 关闭连接池
 */
export const closePool = async (): Promise<void> => {
  try {
    await pool.end();
  } catch (error) {
    throw error;
  }
};

/**
 * 健康检查函数
 */
export const checkDatabaseHealth = async (): Promise<boolean> => {
  try {
    const conn = await getConnection();
    const result = await conn.query("SELECT 1 as health_check");
    conn.release();
    return !!result;
  } catch (error) {
    console.error("数据库健康检查失败:", error);
    return false;
  }
};
