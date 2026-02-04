import type { TimeStamp } from "~/types";

export const formatDate = (dateString: TimeStamp) => {
  if (!dateString) return ``;
  try {
    const date = new Date(dateString);
    return date.toLocaleString(`zh-CN`);
  } catch (error) {
    return String(dateString);
  }
};
