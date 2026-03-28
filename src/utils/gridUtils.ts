// Excel 网格工具函数

/**
 * 生成列字母数组
 * @param cols 列数（从 B 列开始计数）
 * @returns 列字母数组，如 ['B', 'C', ..., 'AD']
 */
export function generateColLetters(cols: number): string[] {
  return Array.from({ length: cols }, (_, i) => {
    let result = '';
    let n = i + 1;
    while (n > 0) {
      n--;
      result = String.fromCharCode(65 + (n % 26)) + result;
      n = Math.floor(n / 26);
    }
    return result;
  });
}

/**
 * 生成简单的列字母数组（从 A 开始）
 * @param count 列数
 * @returns 列字母数组，如 ['A', 'B', 'C', ...]
 */
export function generateSimpleColLetters(count: number): string[] {
  return Array.from({ length: count }, (_, i) => {
    let result = '';
    let n = i + 1;
    while (n > 0) {
      n--;
      result = String.fromCharCode(65 + (n % 26)) + result;
      n = Math.floor(n / 26);
    }
    return result;
  });
}

/**
 * 将列号转换为 Excel 列字母
 * @param colNum 列号（1-based，1=A, 2=B, ...）
 * @returns 列字母
 */
export function colNumToLetter(colNum: number): string {
  let result = '';
  let n = colNum;
  while (n > 0) {
    n--;
    result = String.fromCharCode(65 + (n % 26)) + result;
    n = Math.floor(n / 26);
  }
  return result;
}

/**
 * 将 Excel 列字母转换为列号
 * @param colLetter 列字母（如 'A', 'B', 'AD'）
 * @returns 列号（1-based）
 */
export function colLetterToNum(colLetter: string): number {
  let result = 0;
  for (let i = 0; i < colLetter.length; i++) {
    result = result * 26 + (colLetter.charCodeAt(i) - 64);
  }
  return result;
}
