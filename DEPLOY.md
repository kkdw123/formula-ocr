# FormulaOCR 云端部署指南

## 方式一：Railway 部署（推荐，最简单）

Railway 提供免费额度，5 分钟搞定。

### 步骤

1. **将项目推送到 GitHub**
   ```bash
   cd formula-ocr
   git init
   git add .
   git commit -m "FormulaOCR initial commit"
   gh repo create formula-ocr --public --push
   ```

2. **在 Railway 部署**
   - 打开 https://railway.app → 用 GitHub 登录
   - 点击 "New Project" → "Deploy from GitHub repo"
   - 选择 `formula-ocr` 仓库
   - 在 Settings 中设置：
     - **Root Directory**: `server`
     - **Build Command**: `npm ci && cd ../client && npm ci && npm run build`
     - **Start Command**: `npx tsx src/index.ts`
   - 添加环境变量：
     - `GEMINI_API_KEY` = 你的 Gemini API Key
     - `PORT` = (Railway 自动分配，无需设置)

3. **访问你的应用**
   - Railway 会自动分配一个域名，如 `formula-ocr-production.up.railway.app`
   - 打开即可使用，前后端一体

---

## 方式二：Render 部署

### 步骤

1. 推送到 GitHub（同上）

2. 打开 https://render.com → 用 GitHub 登录

3. 创建 **Web Service**：
   - 选择仓库
   - **Root Directory**: `server`
   - **Build Command**: `npm ci && cd ../client && npm ci && npm run build`
   - **Start Command**: `npx tsx src/index.ts`
   - 添加环境变量 `GEMINI_API_KEY`

4. 等待部署完成，使用分配的域名访问

---

## 方式三：Docker 自建服务器部署

```bash
# 构建镜像
docker build -t formula-ocr .

# 运行
docker run -d \
  -p 3001:3001 \
  -e GEMINI_API_KEY=your_key_here \
  formula-ocr
```

---

## 重要提示

- 部署后每个人使用时需要在页面右上角**自行配置 Gemini API Key**
- 如果在服务端设置了 `GEMINI_API_KEY` 环境变量，所有用户共享该 Key，无需单独配置
- Railway 免费额度约 $5/月，轻度使用足够
