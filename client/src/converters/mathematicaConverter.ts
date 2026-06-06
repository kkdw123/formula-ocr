import { BaseConverter, nodeToString } from './index';
import type { LatexNode } from '../types';

/**
 * 希腊字母映射到 Mathematica 符号
 */
const GREEK_MAP: Record<string, string> = {
  alpha: 'Alpha', beta: 'Beta', gamma: 'Gamma', delta: 'Delta',
  epsilon: 'Epsilon', varepsilon: 'Epsilon', zeta: 'Zeta', eta: 'Eta',
  theta: 'Theta', vartheta: 'Theta', iota: 'Iota', kappa: 'Kappa',
  lambda: 'Lambda', mu: 'Mu', nu: 'Nu', xi: 'Xi',
  pi: 'Pi', varpi: 'Pi', rho: 'Rho', varrho: 'Rho',
  sigma: 'Sigma', varsigma: 'Sigma', tau: 'Tau', upsilon: 'Upsilon',
  phi: 'Phi', varphi: 'Phi', chi: 'Chi', psi: 'Psi',
  omega: 'Omega',
  Gamma: 'CapitalGamma', Delta: 'CapitalDelta', Theta: 'CapitalTheta',
  Lambda: 'CapitalLambda', Xi: 'CapitalXi', Pi: 'CapitalPi',
  Sigma: 'CapitalSigma', Upsilon: 'CapitalUpsilon', Phi: 'CapitalPhi',
  Psi: 'CapitalPsi', Omega: 'CapitalOmega',
};

/**
 * 函数名映射到 Mathematica 函数名
 */
const FUNCTION_MAP: Record<string, string> = {
  sin: 'Sin', cos: 'Cos', tan: 'Tan',
  arcsin: 'ArcSin', arccos: 'ArcCos', arctan: 'ArcTan',
  sinh: 'Sinh', cosh: 'Cosh', tanh: 'Tanh',
  log: 'Log', ln: 'Log', exp: 'Exp',
  lim: 'Limit', max: 'Max', min: 'Min',
  det: 'Det', dim: 'Dimension',
  gcd: 'GCD', lcm: 'LCM',
  sec: 'Sec', csc: 'Csc', cot: 'Cot',
  arg: 'Arg', deg: 'Degree',
  ker: 'Kernel', hom: 'Hom',
  Pr: 'Probability', E: 'Expectation',
};

/**
 * 符号映射
 */
const SYMBOL_MAP: Record<string, string> = {
  infty: 'Infinity',
  partial: 'D',
  nabla: 'Del',
  forall: 'ForAll',
  exists: 'Exists',
  neg: 'Not',
  land: 'And',
  lor: 'Or',
  to: 'Rule',
  rightarrow: 'Rule',
  Rightarrow: 'Implies',
  leq: 'LessEqual',
  geq: 'GreaterEqual',
  neq: 'Unequal',
  approx: 'Approximate',
  equiv: 'Equivalent',
  cdot: 'CenterDot',
  times: 'Times',
  div: 'Divide',
  pm: 'PlusMinus',
  mp: 'MinusPlus',
  sum: 'Sum',
  prod: 'Product',
  coprod: 'Coproduct',
  int: 'Integrate',
  iint: 'Integrate',
  iiint: 'Integrate',
  oint: 'ContourIntegral',
  bigcup: 'Union',
  bigcap: 'Intersection',
  bigoplus: 'CirclePlus',
  bigotimes: 'CircleTimes',
  emptyset: 'EmptySet',
  varnothing: 'EmptySet',
  aleph: 'Aleph',
  Re: 'Re',
  Im: 'Im',
};

/**
 * LaTeX → Mathematica 转换器
 */
export class MathematicaConverter extends BaseConverter {
  convert(latex: string): string {
    try {
      const ast = this.parseLatex(latex);
      return this.convertNode(ast);
    } catch {
      return '';
    }
  }

  /** 将 AST 节点转换为 Mathematica 表达式 */
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
        return node.children.map((n) => this.convertNode(n)).join(' ');
      case 'environment':
        return this.convertEnvironment(node);
    }
  }

  /** 文本转换 */
  private convertText(value: string): string {
    // 替换常见文本符号
    return value
      .replace(/×/g, '*')
      .replace(/÷/g, '/')
      .replace(/±/g, 'PlusMinus');
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

    // \sqrt{x} → Sqrt[x]
    if (name === 'sqrt') {
      if (args.length >= 2) {
        // \sqrt[n]{x} → Surd[x, n] 或 x^(1/n)
        const x = this.convertNode({ type: 'group', children: args[1] || args[0] });
        const n = this.convertNode({ type: 'group', children: args[0] });
        return `Surd[${x}, ${n}]`;
      }
      if (args.length >= 1) {
        const x = this.convertNode({ type: 'group', children: args[0] });
        return `Sqrt[${x}]`;
      }
      return '';
    }

    // \binom{n}{k} → Binomial[n, k]
    if (name === 'binom') {
      if (args.length >= 2) {
        const n = this.convertNode({ type: 'group', children: args[0] });
        const k = this.convertNode({ type: 'group', children: args[1] });
        return `Binomial[${n}, ${k}]`;
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

    // \left \right 等定界符命令，忽略
    if (name === 'left' || name === 'right' || name === 'big' || name === 'Big' || name === 'bigg' || name === 'Bigg') {
      if (args.length > 0) {
        return this.convertNode({ type: 'group', children: args[0] });
      }
      return '';
    }

    // 装饰命令：\hat{x} → Hat[x]
    const accentMap: Record<string, string> = {
      hat: 'Hat', bar: 'OverBar', vec: 'OverVector',
      tilde: 'OverTilde', dot: 'OverDot', ddot: 'OverDot',
      widehat: 'Hat', widetilde: 'OverTilde',
      overline: 'OverBar', underline: 'UnderBar',
      overrightarrow: 'OverVector', overleftarrow: 'OverVector',
    };
    if (accentMap[name] && args.length >= 1) {
      const inner = this.convertNode({ type: 'group', children: args[0] });
      return `${accentMap[name]}[${inner}]`;
    }

    // 字体命令，只提取内容
    if (['text', 'mathrm', 'mathbf', 'mathit', 'mathsf', 'mathtt', 'mathbb', 'mathcal', 'mathfrak', 'operatorname'].includes(name)) {
      if (args.length >= 1) {
        return this.convertNode({ type: 'group', children: args[0] });
      }
      return '';
    }

    // \overset{a}{b} → Overscript[b, a]
    if (name === 'overset' && args.length >= 2) {
      const a = this.convertNode({ type: 'group', children: args[0] });
      const b = this.convertNode({ type: 'group', children: args[1] });
      return `Overscript[${b}, ${a}]`;
    }
    if (name === 'underset' && args.length >= 2) {
      const a = this.convertNode({ type: 'group', children: args[0] });
      const b = this.convertNode({ type: 'group', children: args[1] });
      return `Underscript[${b}, ${a}]`;
    }

    // 默认：尝试映射
    const mapped = this.mapCommand(name, args.map((a) => a.map((n) => nodeToString(n)).join('')));
    if (mapped) return mapped;

    // 无法映射则输出原始命令
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
    return `Subscript[${base}, ${sub}]`;
  }

  /** 环境转换 */
  private convertEnvironment(node: LatexNode & { type: 'environment' }): string {
    const name = node.name;
    const bodyStr = node.body.map((n) => this.convertNode(n)).join(', ');

    // 矩阵类环境
    if (['matrix', 'pmatrix', 'bmatrix', 'vmatrix', 'Vmatrix'].includes(name)) {
      // 将 \\ 和 & 替换为 Mathematica 矩阵语法
      const rows = bodyStr.split('\\\\').map((row) => {
        const cols = row.split('&').map((c) => c.trim()).filter((c) => c);
        return `{${cols.join(', ')}}`;
      });
      const rowsJoined = rows.join('}, {');
      return `MatrixForm[{{{${rowsJoined}}}}]`;
    }

    // cases 环境
    if (name === 'cases') {
      const rows = bodyStr.split('\\\\').map((row) => row.trim()).filter((r) => r);
      return `Piecewise[{${rows.join(', ')}}]`;
    }

    // aligned/align 环境
    if (name === 'aligned' || name === 'align' || name === 'alignat') {
      return bodyStr;
    }

    // 默认返回内容
    return bodyStr;
  }
}
