/**
 * 格式化数字，大数字以 k/M 为单位显示
 * @param num 数字
 * @returns 格式化后的字符串
 */
export function formatNumber(num: number): string {
  if (num < 1000) {
    return num.toString();
  }

  if (num < 1000000) {
    // 千：1.2k, 12.3k, 123.5k
    return (num / 1000).toFixed(1).replace(/\.0$/, '') + 'k';
  }

  // 百万：1.2M, 12.3M
  return (num / 1000000).toFixed(1).replace(/\.0$/, '') + 'M';
}
