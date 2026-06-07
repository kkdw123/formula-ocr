import OpenAI from 'openai';

/**
 * Moonshot (月之暗面/Kimi) 视觉模型公式识别
 * OpenAI 兼容 API，国内直连，无需代理
 */
export async function recognizeWithMoonshot(
  imageBase64: string,
  mimeType: string,
  clientApiKey?: string,
): Promise<{ latex: string; error?: string }> {
  const apiKey = process.env.MOONSHOT_API_KEY || clientApiKey;

  if (!apiKey) {
    return {
      latex: '',
      error: '未提供 Moonshot API Key，请在页面右上角 ⚙️ 设置中输入 Moonshot API Key',
    };
  }

  try {
    const client = new OpenAI({
      apiKey,
      baseURL: 'https://api.moonshot.cn/v1',
    });

    const dataUrl = `data:${mimeType};base64,${imageBase64}`;

    const response = await client.chat.completions.create({
      model: 'moonshot-v1-8k-vision-preview',
      messages: [
        {
          role: 'user',
          content: [
            {
              type: 'image_url',
              image_url: { url: dataUrl },
            },
            {
              type: 'text',
              text: '请识别图片中的数学公式，仅输出 LaTeX 代码，不要添加 ```latex 标记、$$标记、\\( \\)标记或其他任何格式包裹，只输出纯 LaTeX 源码。如果图片中没有公式，输出 "(无公式)"。',
            },
          ],
        },
      ],
      temperature: 0,
      max_tokens: 1024,
    });

    let text = response.choices[0]?.message?.content?.trim() || '';

    if (!text) {
      return { latex: '', error: '识别结果为空，请确认图片中包含清晰的数学公式' };
    }

    if (text === '(无公式)') {
      return { latex: '', error: '未在图片中检测到数学公式' };
    }

    // 清理可能的包裹标记
    text = text.replace(/^```(?:latex)?\s*\n?/i, '');
    text = text.replace(/\n?```\s*$/i, '');
    text = text.replace(/^\$\$\s*/, '');
    text = text.replace(/\s*\$\$$/, '');
    text = text.replace(/^\$\s*/, '');
    text = text.replace(/\s*\$$/, '');
    text = text.replace(/^\\\(\s*/, '');
    text = text.replace(/\s*\\\)$/, '');
    text = text.replace(/^\\\[\s*/, '');
    text = text.replace(/\s*\\\]$/, '');
    text = text.trim();

    if (!text) {
      return { latex: '', error: '识别结果为空，请确认图片中包含清晰的数学公式' };
    }

    return { latex: text };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Moonshot API 调用失败';
    console.error('[Moonshot] API 调用错误:', message);
    return { latex: '', error: `识别失败: ${message}` };
  }
}
