import { GoogleGenerativeAI } from '@google/generative-ai';
import { ProxyAgent, setGlobalDispatcher, Agent } from 'undici';

/**
 * 初始化代理（仅执行一次）
 * Node.js 22 的 native fetch 基于 undici，通过 setGlobalDispatcher 可全局生效。
 * 优先读取环境变量，再自动探测常见本地代理端口。
 */
let proxyInitialized = false;

async function initProxy(): Promise<void> {
  if (proxyInitialized) return;
  proxyInitialized = true;

  // 1. 先尝试环境变量
  const envProxy = process.env.HTTPS_PROXY || process.env.HTTP_PROXY || '';

  if (envProxy) {
    try {
      const proxyAgent = new ProxyAgent({ uri: envProxy });
      setGlobalDispatcher(proxyAgent);
      console.log(`[Gemini] 使用环境变量代理: ${envProxy}`);
      return;
    } catch (e) {
      console.warn('[Gemini] 环境变量代理初始化失败:', e);
    }
  }

  // 2. 自动探测常见本地代理端口
  const commonPorts = [17891, 7890, 10809, 1080, 8080, 8118, 1087, 7891, 9910];
  for (const port of commonPorts) {
    try {
      // 尝试连接端口，能连接上说明有代理服务
      await fetch(`http://127.0.0.1:${port}`, {
        signal: AbortSignal.timeout(2000),
      });
      // 能到这里说明端口有服务监听，使用它作为代理
      const proxyUrl = `http://127.0.0.1:${port}`;
      const proxyAgent = new ProxyAgent({ uri: proxyUrl });
      setGlobalDispatcher(proxyAgent);
      console.log(`[Gemini] 自动检测到代理: ${proxyUrl}`);
      return;
    } catch (e) {
      // 连接失败，继续尝试下一个端口
      console.log(`[Gemini] 端口 ${port} 无代理服务: ${e instanceof Error ? e.message : e}`);
    }
  }

  // 3. 无代理可用，使用默认 dispatcher
  console.log('[Gemini] 未检测到代理，使用直连');
  setGlobalDispatcher(new Agent());
}

/** Gemini API 识别服务 */
export async function recognizeWithGemini(
  imageBase64: string,
  mimeType: string,
  clientApiKey?: string,
): Promise<{ latex: string; error?: string }> {
  // API Key 优先从环境变量读取，前端传入作为 fallback
  const apiKey = process.env.GEMINI_API_KEY || clientApiKey;

  if (!apiKey) {
    return {
      latex: '',
      error: '未提供 API Key，请在页面右上角 ⚙️ 设置中配置 Gemini API Key',
    };
  }

  // 确保代理已初始化（全局仅一次）
  await initProxy();

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
      '请识别图片中的数学公式，仅输出 LaTeX 代码，不要添加 ```latex 标记、$$标记或其他格式，只输出纯 LaTeX 源码',
    ]);

    const response = result.response;
    let text = response.text().trim();

    // 清理各种可能的包裹标记
    text = text.replace(/^```(?:latex)?\s*\n?/i, '');
    text = text.replace(/\n?```\s*$/i, '');
    text = text.replace(/^\$\$\s*/, '');
    text = text.replace(/\s*\$\$$/, '');
    text = text.replace(/^\$\s*/, '');
    text = text.replace(/\s*\$$/, '');
    text = text.trim();

    if (!text) {
      return { latex: '', error: '识别结果为空，请确认图片中包含清晰的数学公式' };
    }

    return { latex: text };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Gemini API 调用失败';
    console.error('[Gemini] API 调用错误:', message);
    return { latex: '', error: `识别失败: ${message}` };
  }
}
