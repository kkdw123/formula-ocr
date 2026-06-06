import { GoogleGenerativeAI } from '@google/generative-ai';

/** Gemini API 代理服务 */
export async function recognizeWithGemini(
  imageBase64: string,
  mimeType: string,
  clientApiKey?: string,
): Promise<{ latex: string; error?: string }> {
  // API Key 优先从环境变量读取
  const apiKey = process.env.GEMINI_API_KEY || clientApiKey;

  if (!apiKey) {
    return { latex: '', error: '未提供 API Key，请在设置中配置或在服务端设置 GEMINI_API_KEY 环境变量' };
  }

  try {
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });

    const result = await model.generateContent([
      {
        inlineData: {
          data: imageBase64,
          mimeType,
        },
      },
      '请识别图片中的数学公式，仅输出 LaTeX 代码，不要添加 ```latex 标记或其他格式',
    ]);

    const response = result.response;
    let text = response.text().trim();

    // 清理 ```latex 标记
    text = text.replace(/^```(?:latex)?\s*\n?/i, '');
    text = text.replace(/\n?```\s*$/i, '');
    text = text.trim();

    if (!text) {
      return { latex: '', error: '识别结果为空，请确认图片中包含数学公式' };
    }

    return { latex: text };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Gemini API 调用失败';
    return { latex: '', error: message };
  }
}
