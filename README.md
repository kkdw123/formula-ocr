# FormulaOCR · 公式识别与格式转换

网页版公式图像识别 + 多平台格式转换工具。上传/粘贴/拖拽公式图片，通过 Gemini Flash API 识别为 LaTeX，并可一键转换为 Word/MathML/Mathematica/MATLAB/AsciiMath 等格式。

## 功能特性

- 📷 **多方式输入**：拖拽上传、点击选择、Ctrl+V 粘贴
- 🔍 **AI 识别**：基于 Google Gemini Flash 的公式图像识别
- ✏️ **可编辑**：识别结果以 LaTeX 形式展示，支持手动编辑
- 👁️ **实时预览**：KaTeX 实时渲染公式预览
- 🔄 **多格式转换**：
  - Word OMML（Office Math Markup Language）
  - MathML
  - Mathematica
  - MATLAB
  - AsciiMath
- 📋 **一键复制**：每个格式结果均可一键复制到剪贴板
- 📜 **识别历史**：最近 50 条识别记录，可随时恢复
- 🔑 **灵活配置**：支持前端配置 API Key 或服务端环境变量

## 技术栈

### 前端
- React 18 + TypeScript
- Vite 5
- MUI (Material UI) 5
- Tailwind CSS 3
- Zustand（状态管理）
- KaTeX（公式渲染）
- Temml（MathML 转换）
- react-dropzone（拖拽上传）

### 后端
- Express + TypeScript
- @google/generative-ai（Gemini API SDK）
- latex-to-omml（OMML 转换）
- express-rate-limit（速率限制）

## 开发启动

### 前端

```bash
cd client
npm install
npm run dev
```

前端开发服务器默认运行在 `http://localhost:5173`，已配置 Vite 代理将 `/api` 请求转发到后端。

### 后端

```bash
cd server
npm install
npx tsx src/index.ts
```

后端服务默认运行在 `http://localhost:3001`。

### 环境变量

在服务端创建 `.env` 文件（可选）：

```
GEMINI_API_KEY=your_gemini_api_key_here
```

如果未设置环境变量，用户可在前端页面中配置 API Key。

## 部署说明

### 前端（Vercel）

1. 将 `client` 目录部署到 Vercel
2. 配置构建命令：`npm run build`
3. 配置输出目录：`dist`
4. 配置环境变量（如需要）

### 后端（Railway）

1. 将 `server` 目录部署到 Railway
2. 配置环境变量 `GEMINI_API_KEY`
3. 配置启动命令：`npx tsx src/index.ts`

## API 接口

### POST /api/recognize

识别公式图片，返回 LaTeX 代码。

**请求体**：
```json
{
  "imageBase64": "base64编码的图片数据（不含data URI前缀）",
  "mimeType": "image/png",
  "apiKey": "可选，Gemini API Key"
}
```

**响应**：
```json
{
  "success": true,
  "latex": "\\frac{a}{b}"
}
```

### POST /api/convert/omml

将 LaTeX 转换为 Word OMML 格式。

**请求体**：
```json
{
  "latex": "\\frac{a}{b}",
  "displayMode": false
}
```

**响应**：
```json
{
  "success": true,
  "omml": "<m:oMath>...</m:oMath>"
}
```

### GET /api/health

健康检查接口。

## 项目结构

```
formula-ocr/
├── client/                  # 前端项目
│   ├── public/
│   │   └── favicon.svg
│   ├── src/
│   │   ├── components/      # UI 组件
│   │   ├── converters/      # 格式转换引擎
│   │   ├── services/        # API 调用
│   │   ├── store/           # Zustand 状态
│   │   ├── types/           # TypeScript 类型
│   │   ├── utils/           # 工具函数
│   │   ├── App.tsx          # 根组件
│   │   ├── main.tsx         # 入口
│   │   └── index.css        # 全局样式
│   ├── index.html
│   ├── package.json
│   ├── vite.config.ts
│   └── tsconfig.json
├── server/                  # 后端项目
│   ├── src/
│   │   ├── middleware/      # 中间件
│   │   ├── routes/          # 路由
│   │   ├── services/        # 业务服务
│   │   └── index.ts         # 入口
│   ├── package.json
│   └── tsconfig.json
└── README.md
```

## License

MIT
