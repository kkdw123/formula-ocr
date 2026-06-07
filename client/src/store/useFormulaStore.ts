import { create } from 'zustand';
import type { FormatResults, HistoryRecord, Provider } from '../types';
import { recognizeApi, convertOmmlApi } from '../services/api';
import { converterRegistry } from '../converters';
import {
  loadHistory,
  saveHistory,
  loadGeminiKey,
  saveGeminiKey,
  loadMoonshotKey,
  saveMoonshotKey,
  loadSimpleTexKey,
  saveSimpleTexKey,
  loadProvider,
  saveProvider,
} from '../utils/storage';

interface FormulaState {
  /** 当前图片 Base64 */
  imageBase64: string;
  /** 图片文件名 */
  imageName: string;
  /** 当前 LaTeX 文本 */
  latex: string;
  /** 识别中 */
  isRecognizing: boolean;
  /** 转换中 */
  isConverting: boolean;
  /** 错误信息 */
  error: string;
  /** 格式转换结果 */
  formatResults: FormatResults;
  /** 识别历史 */
  history: HistoryRecord[];
  /** 当前识别引擎 */
  provider: Provider;
  /** Gemini API Key */
  geminiApiKey: string;
  /** Moonshot API Key */
  moonshotApiKey: string;
  /** SimpleTex API Key */
  simpletexApiKey: string;

  /** 设置图片 */
  setImage: (base64: string, name: string) => void;
  /** 设置 LaTeX（触发 debounce 转换） */
  setLatex: (latex: string) => void;
  /** 调用 API 识别当前图片 */
  recognize: () => Promise<void>;
  /** 触发所有格式转换 */
  convertAll: () => Promise<void>;
  /** 更新单种格式结果 */
  updateFormatResult: (format: keyof FormatResults, result: string) => void;
  /** 添加历史记录 */
  addHistory: (record: HistoryRecord) => void;
  /** 设置识别引擎 */
  setProvider: (provider: Provider) => void;
  /** 设置 Gemini API Key */
  setGeminiApiKey: (key: string) => void;
  /** 设置 Moonshot API Key */
  setMoonshotApiKey: (key: string) => void;
  /** 设置 SimpleTex API Key */
  setSimpleTexApiKey: (key: string) => void;
  /** 清空所有状态 */
  clearAll: () => void;
  /** 恢复历史记录到编辑区 */
  restoreFromHistory: (record: HistoryRecord) => void;
}

/** debounce 定时器 */
let convertTimer: ReturnType<typeof setTimeout> | null = null;

/** 生成唯一 ID */
function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).substring(2, 8);
}

export const useFormulaStore = create<FormulaState>((set, get) => ({
  imageBase64: '',
  imageName: '',
  latex: '',
  isRecognizing: false,
  isConverting: false,
  error: '',
  formatResults: {
    omml: '',
    mathml: '',
    mathematica: '',
    matlab: '',
    asciimath: '',
  },
  history: loadHistory(),
  provider: loadProvider(),
  geminiApiKey: loadGeminiKey(),
  moonshotApiKey: loadMoonshotKey(),
  simpletexApiKey: loadSimpleTexKey(),

  setImage: (base64: string, name: string) => {
    set({ imageBase64: base64, imageName: name, error: '' });
  },

  setLatex: (latex: string) => {
    set({ latex });
    // debounce 300ms 后触发格式转换
    if (convertTimer) {
      clearTimeout(convertTimer);
    }
    convertTimer = setTimeout(() => {
      get().convertAll();
    }, 300);
  },

  recognize: async () => {
    const { imageBase64, imageName, provider, geminiApiKey, moonshotApiKey, simpletexApiKey } = get();
    if (!imageBase64) {
      set({ error: '请先上传图片' });
      return;
    }

    let apiKey: string | undefined;
    if (provider === 'moonshot') apiKey = moonshotApiKey;
    else if (provider === 'simpletex') apiKey = simpletexApiKey;
    else apiKey = geminiApiKey;

    set({ isRecognizing: true, error: '' });

    try {
      // 从 base64 推断 MIME 类型
      let mimeType = 'image/png';
      if (imageName.endsWith('.jpg') || imageName.endsWith('.jpeg')) {
        mimeType = 'image/jpeg';
      } else if (imageName.endsWith('.svg')) {
        mimeType = 'image/svg+xml';
      } else if (imageName.endsWith('.webp')) {
        mimeType = 'image/webp';
      }

      const result = await recognizeApi({
        imageBase64,
        mimeType,
        apiKey: apiKey || undefined,
        provider,
      });

      if (result.success && result.latex) {
        set({ latex: result.latex, isRecognizing: false });
        // 自动添加到历史
        const record: HistoryRecord = {
          id: generateId(),
          imageName,
          imageBase64,
          latex: result.latex,
          timestamp: Date.now(),
        };
        get().addHistory(record);
        // 识别完成后自动触发格式转换
        get().convertAll();
      } else {
        set({
          error: result.error || '识别失败，请重试',
          isRecognizing: false,
        });
      }
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : '网络错误，请重试';
      set({ error: message, isRecognizing: false });
    }
  },

  convertAll: async () => {
    const { latex } = get();
    if (!latex.trim()) {
      set({
        formatResults: {
          omml: '',
          mathml: '',
          mathematica: '',
          matlab: '',
          asciimath: '',
        },
      });
      return;
    }

    set({ isConverting: true });

    try {
      // 前端 4 种格式并行转换
      const frontendResults = converterRegistry.convertAll(latex);

      // OMML 走后端 API
      let ommlResult = '';
      try {
        const res = await convertOmmlApi({ latex });
        if (res.success) {
          ommlResult = res.omml;
        }
      } catch {
        ommlResult = '';
      }

      set({
        formatResults: {
          omml: ommlResult,
          ...frontendResults,
        },
        isConverting: false,
      });
    } catch {
      set({ isConverting: false });
    }
  },

  updateFormatResult: (format: keyof FormatResults, result: string) => {
    set((state) => ({
      formatResults: {
        ...state.formatResults,
        [format]: result,
      },
    }));
  },

  addHistory: (record: HistoryRecord) => {
    set((state) => {
      const newHistory = [record, ...state.history].slice(0, 50);
      saveHistory(newHistory);
      return { history: newHistory };
    });
  },

  setProvider: (provider: Provider) => {
    set({ provider });
    saveProvider(provider);
  },

  setGeminiApiKey: (key: string) => {
    set({ geminiApiKey: key });
    saveGeminiKey(key);
  },

  setMoonshotApiKey: (key: string) => {
    set({ moonshotApiKey: key });
    saveMoonshotKey(key);
  },

  setSimpleTexApiKey: (key: string) => {
    set({ simpletexApiKey: key });
    saveSimpleTexKey(key);
  },

  clearAll: () => {
    set({
      imageBase64: '',
      imageName: '',
      latex: '',
      isRecognizing: false,
      isConverting: false,
      error: '',
      formatResults: {
        omml: '',
        mathml: '',
        mathematica: '',
        matlab: '',
        asciimath: '',
      },
    });
  },

  restoreFromHistory: (record: HistoryRecord) => {
    set({
      imageBase64: record.imageBase64,
      imageName: record.imageName,
      latex: record.latex,
      error: '',
    });
    // 恢复后自动触发转换
    get().convertAll();
  },
}));
