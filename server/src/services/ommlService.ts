import { latexToOMML } from 'latex-to-omml';

/**
 * 将 LaTeX 转换为 OMML（Office Math Markup Language）
 */
export async function convertLatexToOmml(
  latex: string,
  displayMode: boolean = false,
): Promise<{ omml: string; error?: string }> {
  try {
    const result = await latexToOMML(latex, { displayMode });
    if (typeof result === 'string') {
      return { omml: result };
    }
    return { omml: '', error: 'OMML 转换结果格式异常' };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'OMML 转换失败';
    return { omml: '', error: message };
  }
}
