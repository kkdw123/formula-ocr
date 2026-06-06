import temml from 'temml';
import { BaseConverter } from './index';

/**
 * LaTeX → MathML 转换器
 * 基于 Temml 库的 renderToString 方法
 * Temml 的 renderToString 直接输出 <math> MathML 标签
 */
export class MathMLConverter extends BaseConverter {
  convert(latex: string): string {
    if (!latex.trim()) return '';
    try {
      const result = temml.renderToString(latex, {
        throwOnError: false,
        strict: false,
      });
      return result || '';
    } catch {
      return '';
    }
  }
}
