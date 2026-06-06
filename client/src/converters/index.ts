import type { LatexNode, FormatType, FormatResults } from '../types';

/**
 * 转换器抽象基类
 */
export abstract class BaseConverter {
  /** 将 LaTeX 字符串转换为目标格式 */
  abstract convert(latex: string): string;

  /** 解析 LaTeX 字符串为 AST */
  protected parseLatex(latex: string): LatexNode {
    return new LatexParser(latex).parse();
  }

  /** 命令映射（子类可覆盖） */
  protected mapCommand(_command: string, _args: string[]): string {
    return '';
  }
}

/**
 * LaTeX 递归下降解析器
 * 将 LaTeX 字符串解析为 AST 节点树
 */
export class LatexParser {
  private pos: number = 0;
  private readonly input: string;

  constructor(input: string) {
    this.input = input;
  }

  parse(): LatexNode {
    const children = this.parseGroupContent();
    if (children.length === 1) {
      return children[0];
    }
    return { type: 'group', children };
  }

  private parseGroupContent(stopChars?: Set<string>): LatexNode[] {
    const nodes: LatexNode[] = [];

    while (this.pos < this.input.length) {
      const ch = this.input[this.pos];

      if (ch === '}') {
        break;
      } else if (stopChars && stopChars.has(ch)) {
        break;
      } else if (ch === '{') {
        this.pos++; // skip {
        const children = this.parseGroupContent();
        this.pos++; // skip }
        nodes.push({ type: 'group', children });
      } else if (ch === '\\') {
        nodes.push(this.parseCommand(stopChars));
      } else if (ch === '^') {
        this.pos++; // skip ^
        const sup = this.parseArg();
        const base = nodes.pop() || { type: 'text', value: '' };
        nodes.push({ type: 'superscript', base, sup });
      } else if (ch === '_') {
        this.pos++; // skip _
        const sub = this.parseArg();
        const base = nodes.pop() || { type: 'text', value: '' };
        nodes.push({ type: 'subscript', base, sub });
      } else if (ch === '&') {
        this.pos++;
        nodes.push({ type: 'text', value: '&' });
      } else if (ch === ' ' || ch === '\t' || ch === '\n') {
        this.pos++;
      } else {
        // 累积连续普通字符为一个 text 节点
        let text = '';
        while (
          this.pos < this.input.length &&
          !this.isSpecial(this.input[this.pos]) &&
          !(stopChars && stopChars.has(this.input[this.pos]))
        ) {
          text += this.input[this.pos];
          this.pos++;
        }
        if (text) {
          nodes.push({ type: 'text', value: text });
        }
      }
    }

    return nodes;
  }

  private isSpecial(ch: string): boolean {
    return ch === '\\' || ch === '{' || ch === '}' || ch === '^' || ch === '_' || ch === '&';
  }

  private parseCommand(_stopChars?: Set<string>): LatexNode {
    this.pos++; // skip \

    // 检查 \begin{env}
    let name = '';
    while (this.pos < this.input.length && /[a-zA-Z]/.test(this.input[this.pos])) {
      name += this.input[this.pos];
      this.pos++;
    }

    // 单字符命令如 \, \; 等
    if (!name && this.pos < this.input.length) {
      name = this.input[this.pos];
      this.pos++;
    }

    // 跳过命令后的空格
    while (this.pos < this.input.length && this.input[this.pos] === ' ') {
      this.pos++;
    }

    if (name === 'begin') {
      return this.parseEnvironment();
    }

    // 解析命令参数
    const args: LatexNode[][] = [];
    // 对于已知需要参数的命令，尝试解析参数
    const commandsWithArgs = new Set([
      'frac', 'dfrac', 'tfrac', 'sqrt', 'binom',
      'overset', 'underset', 'stackrel',
      'hat', 'bar', 'vec', 'tilde', 'dot', 'ddot',
      'widehat', 'widetilde', 'overline', 'underline',
      'overrightarrow', 'overleftarrow',
      'text', 'mathrm', 'mathbf', 'mathit', 'mathsf', 'mathtt',
      'mathbb', 'mathcal', 'mathfrak',
      'operatorname', 'mathrm',
      'left', 'right', 'big', 'Big', 'bigg', 'Bigg',
    ]);

    if (commandsWithArgs.has(name)) {
      // \sqrt 可以有可选参数 [...]
      if (name === 'sqrt' && this.pos < this.input.length && this.input[this.pos] === '[') {
        this.pos++; // skip [
        const optionalNodes = this.parseGroupContent(new Set([']']));
        this.pos++; // skip ]
        args.push(optionalNodes);
      }

      // 解析花括号参数
      while (this.pos < this.input.length && this.input[this.pos] === '{') {
        this.pos++; // skip {
        const argNodes = this.parseGroupContent();
        this.pos++; // skip }
        args.push(argNodes);
      }
    }

    return { type: 'command', name, args };
  }

  private parseEnvironment(): LatexNode {
    // 读取环境名: \begin{name}
    // 此时 pos 在 \begin{ 之后的花括号位置
    let name = '';
    if (this.input[this.pos] === '{') {
      this.pos++; // skip {
      while (this.pos < this.input.length && this.input[this.pos] !== '}') {
        name += this.input[this.pos];
        this.pos++;
      }
      this.pos++; // skip }
    }

    // 跳过空格
    while (this.pos < this.input.length && this.input[this.pos] === ' ') {
      this.pos++;
    }

    // 解析环境体直到 \end{name}
    const body: LatexNode[] = [];
    const endMarker = `\\end{${name}}`;

    while (this.pos < this.input.length) {
      // 检查是否到达 \end{name}
      if (this.input.substring(this.pos).startsWith(endMarker)) {
        this.pos += endMarker.length;
        break;
      }

      const ch = this.input[this.pos];
      if (ch === '\\') {
        body.push(this.parseCommand());
      } else if (ch === '{') {
        this.pos++;
        const children = this.parseGroupContent();
        this.pos++;
        body.push({ type: 'group', children });
      } else if (ch === ' ' || ch === '\n' || ch === '\t') {
        this.pos++;
      } else if (!this.isSpecial(ch)) {
        let text = '';
        while (this.pos < this.input.length && !this.isSpecial(this.input[this.pos])) {
          if (this.input.substring(this.pos).startsWith(endMarker)) break;
          text += this.input[this.pos];
          this.pos++;
        }
        if (text) {
          body.push({ type: 'text', value: text });
        }
      } else {
        this.pos++;
      }
    }

    return { type: 'environment', name, args: [], body };
  }

  private parseArg(): LatexNode {
    // 跳过空格
    while (this.pos < this.input.length && this.input[this.pos] === ' ') {
      this.pos++;
    }

    if (this.pos < this.input.length && this.input[this.pos] === '{') {
      this.pos++; // skip {
      const children = this.parseGroupContent();
      this.pos++; // skip }
      if (children.length === 1) {
        return children[0];
      }
      return { type: 'group', children };
    }

    // If starts with \, parse as a command
    if (this.pos < this.input.length && this.input[this.pos] === '\\') {
      return this.parseCommand();
    }

    // 单字符参数
    if (this.pos < this.input.length) {
      const ch = this.input[this.pos];
      this.pos++;
      return { type: 'text', value: ch };
    }

    return { type: 'text', value: '' };
  }
}

/**
 * 将 AST 节点转换为纯字符串（用于参数提取）
 */
export function nodeToString(node: LatexNode): string {
  switch (node.type) {
    case 'text':
      return node.value;
    case 'command': {
      const args = node.args.map((arg) =>
        arg.map((n) => nodeToString(n)).join(''),
      );
      if (args.length > 0) {
        return `\\${node.name}${args.map((a) => `{${a}}`).join('')}`;
      }
      return `\\${node.name}`;
    }
    case 'superscript':
      return `${nodeToString(node.base)}^{${nodeToString(node.sup)}}`;
    case 'subscript':
      return `${nodeToString(node.base)}_{${nodeToString(node.sub)}}`;
    case 'group':
      return node.children.map((n) => nodeToString(n)).join('');
    case 'environment':
      return `\\begin{${node.name}}${node.body.map((n) => nodeToString(n)).join('')}\\end{${node.name}}`;
  }
}

/**
 * 转换器注册表
 */
class ConverterRegistryClass {
  private converters: Map<FormatType, BaseConverter> = new Map();

  /** 注册转换器 */
  register(format: FormatType, converter: BaseConverter): void {
    this.converters.set(format, converter);
  }

  /** 转换为指定格式 */
  convert(latex: string, format: FormatType): string {
    const converter = this.converters.get(format);
    if (!converter) return '';
    try {
      return converter.convert(latex);
    } catch {
      return '';
    }
  }

  /** 转换所有前端格式（不含 OMML） */
  convertAll(latex: string): Omit<FormatResults, 'omml'> {
    const formats: (keyof Omit<FormatResults, 'omml'>)[] = ['mathml', 'mathematica', 'matlab', 'asciimath'];
    const results = {} as Omit<FormatResults, 'omml'>;
    for (const fmt of formats) {
      results[fmt] = this.convert(latex, fmt);
    }
    return results;
  }
}

export const converterRegistry = new ConverterRegistryClass();
