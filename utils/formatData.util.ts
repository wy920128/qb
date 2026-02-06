import type { TimeStamp } from "~/types";

export const formatDateTime = (dateString: TimeStamp) => {
  if (!dateString) return ``;
  try {
    const date = new Date(dateString);
    return date.toLocaleString(`zh-CN`);
  } catch (error) {
    return String(dateString);
  }
};
export const formatDate = (dateString: TimeStamp) => {
  if (!dateString) return ``;
  try {
    const date = new Date(dateString);
    return date.toLocaleDateString(`zh-CN`);
  } catch (error) {
    return String(dateString);
  }
};
