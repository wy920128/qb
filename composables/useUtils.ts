// composables/useUtils.ts

/**
 * 全局工具函数
 */
export const useUtils = () => {
  /**
   * 格式化时间显示
   */
  const formatTime = (time: Date | string | null): string => {
    if (!time) return '未填写'
    return new Date(time).toLocaleString('zh-CN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    })
  }

  /**
   * 安全JSON解析
   */
  const safeJsonParse = <T>(jsonString: string | null, defaultValue: T): T => {
    if (!jsonString) return defaultValue
    try {
      return JSON.parse(jsonString) as T
    } catch (e) {
      console.warn('JSON解析失败:', e)
      return defaultValue
    }
  }

  /**
   * 防抖函数
   */
  const debounce = <T extends (...args: any[]) => any>(
    func: T,
    delay: number
  ): ((...args: Parameters<T>) => void) => {
    let timeoutId: NodeJS.Timeout
    return (...args: Parameters<T>) => {
      clearTimeout(timeoutId)
      timeoutId = setTimeout(() => func.apply(null, args), delay)
    }
  }

  return {
    formatTime,
    safeJsonParse,
    debounce
  }
}