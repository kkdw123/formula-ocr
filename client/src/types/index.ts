/** 识别引擎类型 */
export type Provider = 'gemini' | 'moonshot' | 'simpletex';

/** 支持的格式类型 */
export type FormatType = 'omml' | 'mathml' | 'mathematica' | 'matlab' | 'asciimath';

/** 格式转换结果集 */
export interface FormatResults {
  omml: string;
  mathml: string;
  mathematica: string;
  matlab: string;
  asciimath: string;
}

/** 识别历史记录 */
export interface HistoryRecord {
  id: string;
  imageName: string;
  imageBase64: string;
  latex: string;
  timestamp: number;
}

/** 识别接口响应 */
export interface RecognizeResponse {
  success: boolean;
  latex: string;
  error?: string;
}

/** OMML 转换接口响应 */
export interface OmmlResponse {
  success: boolean;
  omml: string;
  error?: string;
}

/** 识别接口请求 */
export interface RecognizeRequest {
  imageBase64: string;
  mimeType: string;
  apiKey?: string;
  provider?: Provider;
}

/** OMML 转换接口请求 */
export interface OmmlConvertRequest {
  latex: string;
  displayMode?: boolean;
}

/** LaTeX AST 节点类型 */
export type LatexNode =
  | { type: 'text'; value: string }
  | { type: 'command'; name: string; args: LatexNode[][] }
  | { type: 'superscript'; base: LatexNode; sup: LatexNode }
  | { type: 'subscript'; base: LatexNode; sub: LatexNode }
  | { type: 'group'; children: LatexNode[] }
  | { type: 'environment'; name: string; args: LatexNode[][]; body: LatexNode[] };

/** 格式标签映射 */
export const FORMAT_LABELS: Record<FormatType, string> = {
  omml: 'Word OMML',
  mathml: 'MathML',
  mathematica: 'Mathematica',
  matlab: 'MATLAB',
  asciimath: 'AsciiMath',
};
