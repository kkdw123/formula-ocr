# FormulaOCR - 公式图像识别与格式转换工具 PRD

## 1. 项目信息

| 字段 | 值 |
|------|------|
| Language | 中文 |
| Programming Language | Vite + React + MUI + Tailwind CSS |
| Project Name | formula_ocr |
| 原始需求 | 开发一个网页版公式图像识别+多平台格式转换工具，用户上传/粘贴/拖拽公式图片，通过 Gemini Flash API 识别为 LaTeX，并可一键转换为 Word/MathML/Mathematica/MATLAB/AsciiMath 等格式 |

---

## 2. 产品定义

### 2.1 Product Goals

1. **精准识别**：利用 Gemini Flash API 将公式图像准确转为 LaTeX，减少手工输入成本
2. **一键多格式转换**：从 LaTeX 到 Word/MathML/Mathematica/MATLAB/AsciiMath 等主流格式，覆盖学术与工程场景
3. **零门槛使用**：无需注册登录，打开网页即可用，操作路径最短化

### 2.2 User Stories

1. As a **研究生**，I want to **截屏粘贴论文中的公式并转为 Word OMML 格式**，so that 我可以直接在 Word 论文中编辑公式
2. As a **高校教师**，I want to **上传教材公式图片并转为 LaTeX**，so that 我可以在 Beamer 幻灯片中复用
3. As a **工程师**，I want to **识别公式后转为 MATLAB 语法**，so that 我可以快速在 MATLAB 中实现符号计算
4. As a **数学爱好者**，I want to **编辑识别后的 LaTeX 并实时预览**，so that 我可以修正识别误差后获取准确结果
5. As a **跨平台作者**，I want to **一次性获取所有格式的转换结果并复制**，so that 我无需多次重复操作

---

## 3. 技术规范

### 3.1 Requirements Pool

#### P0 - Must Have

| ID | 需求 | 说明 |
|----|------|------|
| R01 | 图片上传识别 | 支持上传 PNG/JPG/SVG/WebP 图片，调用 Gemini Flash API 识别为 LaTeX |
| R02 | 拖拽上传 | 支持拖拽图片文件到指定区域 |
| R03 | 截图粘贴 | 支持 Ctrl+V 粘贴剪贴板截图 |
| R04 | LaTeX 可编辑 | 识别结果在文本框中可编辑，修改后实时联动预览和转换 |
| R05 | KaTeX 实时预览 | LaTeX 源码实时渲染为数学公式预览 |
| R06 | Word OMML 转换 | LaTeX → OMML，一键复制 |
| R07 | MathML 转换 | LaTeX → MathML，一键复制 |
| R08 | 一键复制 | 每种格式输出旁提供复制按钮，复制到剪贴板 |
| R09 | 后端 API 代理 | Node.js 代理 Gemini API 调用，保护 API Key 不暴露到前端 |

#### P1 - Should Have

| ID | 需求 | 说明 |
|----|------|------|
| R10 | Mathematica 格式转换 | LaTeX → Wolfram Language 语法，一键复制 |
| R11 | MATLAB 格式转换 | LaTeX → Symbolic Math / MuPAD 语法，一键复制 |
| R12 | AsciiMath 格式转换 | LaTeX → AsciiMath 纯文本标记，一键复制 |
| R13 | Gemini API Key 配置 | 页面提供 API Key 输入框，存入 localStorage，附带申请教程链接 |
| R14 | 识别历史 | 本地存储最近识别记录（localStorage），可回溯查看 |

#### P2 - Nice to Have

| ID | 需求 | 说明 |
|----|------|------|
| R15 | 批量识别 | 支持多张图片同时上传和识别 |
| R16 | 暗色模式 | 跟随系统或手动切换深色主题 |
| R17 | 识别结果导出 | 将识别结果+所有格式转换结果打包为 JSON/TXT 下载 |
| R18 | 快捷键支持 | Enter 触发识别，Esc 清空等 |

---

### 3.2 UI Design Draft

#### 整体布局（单页面，上下结构）

```
┌──────────────────────────────────────────────────────┐
│  Header: FormulaOCR · 公式识别与格式转换              │
│  (Gemini API Key 配置入口 · 使用说明)                 │
├──────────────────────────────────────────────────────┤
│                                                      │
│  ┌──────────────────────────────────────────────┐    │
│  │         📷 图片输入区 (Dropzone)              │    │
│  │                                              │    │
│  │   拖拽图片到此处 / 点击上传 / Ctrl+V 粘贴      │    │
│  │   支持 PNG · JPG · SVG · WebP                 │    │
│  │                                              │    │
│  │   [缩略图预览]                 [开始识别 ▶]    │    │
│  └──────────────────────────────────────────────┘    │
│                                                      │
│  ┌─────────────────┐  ┌──────────────────────────┐  │
│  │  LaTeX 编辑区    │  │   公式预览区 (KaTeX)      │  │
│  │                 │  │                          │  │
│  │  \frac{a}{b}   │  │   渲染后的公式            │  │
│  │  ...           │  │                          │  │
│  │                 │  │                          │  │
│  └─────────────────┘  └──────────────────────────┘  │
│                                                      │
│  ┌──────────────────────────────────────────────┐    │
│  │           格式转换结果区 (Tabs/网格)           │    │
│  │                                              │    │
│  │  [Word OMML] [MathML] [Mathematica]          │    │
│  │  [MATLAB]    [AsciiMath] [LaTeX(原文)]        │    │
│  │                                              │    │
│  │  ┌─────────────────────────────┬──────┐      │    │
│  │  │ 转换结果文本                  │ 📋复制│      │    │
│  │  └─────────────────────────────┴──────┘      │    │
│  └──────────────────────────────────────────────┘    │
│                                                      │
│  Footer: Powered by Gemini Flash · 开源项目           │
└──────────────────────────────────────────────────────┘
```

#### 交互流程

1. **输入阶段**：用户通过上传/拖拽/粘贴三种方式提供公式图片，图片在 Dropzone 区域显示缩略图
2. **识别阶段**：点击「开始识别」或自动触发（粘贴后自动识别），显示 loading 状态，调用后端代理 → Gemini Flash API
3. **编辑与预览阶段**：识别结果填入 LaTeX 编辑区，右侧 KaTeX 实时渲染预览；用户可手动修正 LaTeX，预览同步更新
4. **转换与复制阶段**：LaTeX 变更时自动触发格式转换，各格式以 Tab 或网格卡片展示，每张卡片带一键复制按钮

#### API Key 配置弹窗

- 点击 Header 中「配置」按钮弹出 Dialog
- 输入 Gemini API Key，保存到 localStorage
- 附带「如何获取 API Key」教程链接/折叠说明

---

### 3.3 Open Questions

| # | 问题 | 影响范围 | 建议 |
|---|------|----------|------|
| 1 | LaTeX → 各格式的转换库选型？尤其 OMML 和 Mathematica | R06/R07/R10 | 前端可用 latex2mathml (LaTeX→MathML)、mathjax-node (OMML)；Mathematica/MATLAB 可能需自建映射表或调用 Wolfram Alpha API |
| 2 | Gemini API 免费额度 1500次/日，是否需前端做限额提示？ | R01 | 建议 P1 加入当日剩余次数提示 |
| 3 | 后端代理是否需要速率限制（防滥用）？ | R09 | 建议加 IP 维度的速率限制 |
| 4 | LaTeX 编辑区是否需要语法高亮？ | R04 | P2 级别，可用 CodeMirror 集成 |
| 5 | 是否需要支持手写公式识别？ | R01 | Gemini Flash 对手写有一定支持，但精度待验证，可作为后续优化方向 |
| 6 | Vercel 免费额度是否够用？部署方案是否需备选？ | 部署 | 需评估前端包大小和访问量 |

---

## 4. 技术架构概览

```
[浏览器]
  │
  ├── React SPA (Vite + MUI + Tailwind)
  │     ├── 图片输入 (Dropzone / Paste)
  │     ├── LaTeX 编辑 + KaTeX 预览
  │     └── 格式转换 (前端库)
  │
  └── Node.js 代理服务 (Railway)
        ├── /api/recognize → Gemini Flash API
        └── API Key 环境变量管理
```

**关键依赖预估**：
- `react-dropzone` — 文件上传/拖拽
- `katex` — LaTeX 渲染预览
- `latex2mathml` — LaTeX → MathML
- `@reduxjs/toolkit` 或 `zustand` — 状态管理（可选）
- `express` — 后端代理服务
