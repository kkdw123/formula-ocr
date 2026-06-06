import { BaseConverter, nodeToString } from './index';
import type { LatexNode } from '../types';

/**
 * 希腊字母映射到 MATLAB 符号
 */
const GREEK_MAP: Record<string, string> = {
  alpha: 'alpha', beta: 'beta', gamma: 'gamma', delta: 'delta',
  epsilon: 'epsilon', varepsilon: 'epsilon', zeta: 'zeta', eta: 'eta',
  theta: 'theta', vartheta: 'theta', iota: 'iota', kappa: 'kappa',
  lambda: 'lambda', mu: 'mu', nu: 'nu', xi: 'xi',
  pi: 'pi', varpi: 'pi', rho: 'rho', varrho: 'rho',
  sigma: 'sigma', varsigma: 'sigma', tau: 'tau', upsilon: 'upsilon',
  phi: 'phi', varphi: 'phi', chi: 'chi', psi: 'psi',
  omega: 'omega',
  Gamma: 'Gamma', Delta: 'Delta', Theta: 'Theta',
  Lambda: 'Lambda', Xi: 'Xi', Pi: 'Pi',
  Sigma: 'Sigma', Upsilon: 'Upsilon', Phi: 'Phi',
  Psi: 'Psi', Omega: 'Omega',
};

/**
 * 函数名映射到 MATLAB 函数名
 */
const FUNCTION_MAP: Record<string, string> = {
  sin: 'sin', cos: 'cos', tan: 'tan',
  arcsin: 'asin', arccos: 'acos', arctan: 'atan',
  sinh: 'sinh', cosh: 'cosh', tanh: 'tanh',
  log: 'log', ln: 'log', exp: 'exp',
  lim: 'limit', max: 'max', min: 'min',
  det: 'det', sec: 'sec', csc: 'csc', cot: 'cot',
  sqrt: 'sqrt',
};

/**
 * 符号映射
 */
const SYMBOL_MAP: Record<string, string> = {
  infty: 'Inf',
  partial: 'diff',
  nabla: 'gradient',
  pi: 'pi',
  sum: 'symsum',
  prod: 'prod',
  int: 'int',
  iint: 'int2',
  iiint: 'int3',
  oint: 'integral',
  leq: '<=',
  geq: '>=',
  neq: '~=',
  approx: '~=',
  equiv: '==',
  to: '->',
  rightarrow: '->',
  cdot: '*',
  times: '.*',
  div: '/',
  pm: '+-',
  mp: '-+',
};

/**
 * LaTeX → MATLAB 转换器
 */
export class MATLABConverter extends BaseConverter {
  convert(latex: string): string {
    try {
      const ast = this.parseLatex(latex);
      return this.convertNode(ast);
    } catch {
      return '';
    }
  }

  /** 将 AST 节点转换为 MATLAB 表达式 */
  private convertNode(node: LatexNode): string {
    switch (node.type) {
      case 'text':
        return this.convertText(node.value);
      case 'command':
        return this.convertCommand(node.name, node.args);
      case 'superscript':
        return this.convertSuperscript(node);
      case 'subscript':
        return this.convertSubscript(node);
      case 'group':
        return node.children.map((n) => this.convertNode(n)).join('');
      case 'environment':
        return this.convertEnvironment(node);
    }
  }

  /** 文本转换 */
  private convertText(value: string): string {
    return value
      .replace(/×/g, '*')
      .replace(/÷/g, '/')
      .replace(/±/g, '+-');
  }

  /** 命令转换 */
  private convertCommand(name: string, args: LatexNode[][]): string {
    // \frac{a}{b} → a/b
    if (name === 'frac' || name === 'dfrac' || name === 'tfrac') {
      if (args.length >= 2) {
        const num = this.convertNode({ type: 'group', children: args[0] });
        const den = this.convertNode({ type: 'group', children: args[1] });
        return `(${num})/(${den})`;
      }
      return '';
    }

    // \sqrt{x} → sqrt(x)
    if (name === 'sqrt') {
      if (args.length >= 2) {
        // \sqrt[n]{x} → nthroot(x, n) 或 x^(1/n)
        const x = this.convertNode({ type: 'group', children: args[1] || args[0] });
        const n = this.convertNode({ type: 'group', children: args[0] });
        return `nthroot(${x}, ${n})`;
      }
      if (args.length >= 1) {
        const x = this.convertNode({ type: 'group', children: args[0] });
        return `sqrt(${x})`;
      }
      return '';
    }

    // \binom{n}{k} → nchoosek(n, k)
    if (name === 'binom') {
      if (args.length >= 2) {
        const n = this.convertNode({ type: 'group', children: args[0] });
        const k = this.convertNode({ type: 'group', children: args[1] });
        return `nchoosek(${n}, ${k})`;
      }
      return '';
    }

    // 希腊字母
    if (GREEK_MAP[name]) {
      return GREEK_MAP[name];
    }

    // 函数名
    if (FUNCTION_MAP[name]) {
      return FUNCTION_MAP[name];
    }

    // 符号
    if (SYMBOL_MAP[name]) {
      return SYMBOL_MAP[name];
    }

    // \left \right 等定界符命令
    if (name === 'left' || name === 'right' || name === 'big' || name === 'Big' || name === 'bigg' || name === 'Bigg') {
      if (args.length > 0) {
        return this.convertNode({ type: 'group', children: args[0] });
      }
      return '';
    }

    // 装饰命令
    if (['hat', 'bar', 'vec', 'tilde', 'dot', 'ddot', 'widehat', 'widetilde', 'overline', 'underline', 'overrightarrow', 'overleftarrow'].includes(name)) {
      if (args.length >= 1) {
        return this.convertNode({ type: 'group', children: args[0] });
      }
      return '';
    }

    // 字体命令
    if (['text', 'mathrm', 'mathbf', 'mathit', 'mathsf', 'mathtt', 'mathbb', 'mathcal', 'mathfrak', 'operatorname'].includes(name)) {
      if (args.length >= 1) {
        return this.convertNode({ type: 'group', children: args[0] });
      }
      return '';
    }

    // 默认映射
    const mapped = this.mapCommand(name, args.map((a) => a.map((n) => nodeToString(n)).join('')));
    if (mapped) return mapped;

    return `\\${name}`;
  }

  /** 上标转换 */
  private convertSuperscript(node: LatexNode & { type: 'superscript' }): string {
    const base = this.convertNode(node.base);
    const sup = this.convertNode(node.sup);
    return `${base}^${sup}`;
  }

  /** 下标转换 */
  private convertSubscript(node: LatexNode & { type: 'subscript' }): string {
    const base = this.convertNode(node.base);
    const sub = this.convertNode(node.sub);
    return `${base}(${sub})`;
  }

  /** 环境转换 */
  private convertEnvironment(node: LatexNode & { type: 'environment' }): string {
    const name = node.name;
    const bodyStr = node.body.map((n) => this.convertNode(n)).join(' ');

    // 矩阵类环境 → MATLAB 矩阵语法
    if (['matrix', 'pmatrix', 'bmatrix', 'vmatrix', 'Vmatrix'].includes(name)) {
      const rows = bodyStr.split('\\\\').map((row) => {
        const cols = row.split('&').map((c) => c.trim()).filter((c) => c);
        return cols.join(' ');
      });
      return `[${rows.join('; ')}]`;
    }

    // cases 环境
    if (name === 'cases') {
      return bodyStr;
    }

    // 默认返回内容
    return bodyStr;
  }
}
