# 排课系统 - Vercel 部署教程

## 准备工作

### 1. 确认项目能正常构建

在项目根目录下打开终端，运行：

```bash
npm run build
```

如果成功，会生成一个 `dist` 文件夹。

如果报错，请根据错误信息修复后重试。

---

## 方案一：GitHub + Vercel（推荐，方便后续更新）

### 第一步：注册 GitHub 账号

1. 打开 https://github.com
2. 点击右上角 "Sign up" 注册账号
3. 验证邮箱

### 第二步：创建代码仓库

1. 登录 GitHub 后，点击右上角 "+" → "New repository"
2. 仓库名称填 `schedule-app`
3. 选择 "Public"（公开）
4. 点击 "Create repository"

### 第三步：上传代码到 GitHub

**如果你电脑没有安装 Git：**

1. 下载安装 Git：https://git-scm.com/download/win
2. 安装时全部点 "Next" 即可

**上传代码：**

在项目根目录下打开终端，依次执行以下命令（注意替换 `你的GitHub用户名`）：

```bash
# 初始化 Git 仓库
git init

# 添加所有文件
git add .

# 提交代码
git commit -m "first commit"

# 连接远程仓库（替换为你的用户名）
git branch -M main
git remote add origin https://github.com/你的GitHub用户名/schedule-app.git

# 推送代码
git push -u origin main
```

推送成功后，刷新 GitHub 页面，应该能看到所有代码文件。

### 第四步：部署到 Vercel

1. 打开 https://vercel.com
2. 点击 "Get Started for Free"
3. 选择 "Continue with GitHub" 登录
4. 点击 "Add New Project"
5. 找到 `schedule-app` 仓库，点击 "Import"
6. Framework Preset 选择 **Vite**
7. 点击 "Deploy"

等待约 1-2 分钟，部署完成后会自动跳转到项目页面，获得一个网址如：
```
https://schedule-app-xxxxx.vercel.app
```

把这个链接分享给任何人，他们都能直接访问使用。

### 后续更新代码

如果修改了代码，只需重新执行：

```bash
git add .
git commit -m "update"
git push
```

Vercel 会自动重新部署，无需手动操作。

---

## 方案二：Vercel CLI 直接部署（无需 GitHub）

适合不想用 GitHub、只想快速部署的情况。

### 第一步：安装 Vercel CLI

```bash
npm install -g vercel
```

### 第二步：登录 Vercel

```bash
vercel login
```

按提示在浏览器中完成登录。

### 第三步：部署

在项目根目录下执行：

```bash
vercel
```

按提示回答几个问题：
- Set up and deploy? → 输入 `Y`
- Which scope? → 选择你的账号
- Link to existing project? → 输入 `N`
- What's your project name? → 输入 `schedule-app`
- Which directory is your code located? → 直接回车（当前目录）

等待部署完成，终端会输出访问网址。

### 后续更新

修改代码后，在项目根目录执行：

```bash
vercel --prod
```

即可重新部署。

---

## 常见问题

### Q1: 部署后页面空白？

检查 `vite.config.ts` 中是否配置了 `base`：

```ts
export default defineConfig({
  plugins: [react()],
  base: '/',  // 确保这里是 '/' 或 './'
})
```

### Q2: 路由刷新后 404？

在 Vercel 项目设置中添加重定向规则：
1. 进入 Vercel Dashboard → 你的项目 → Settings → Redirects
2. 添加规则：
   - Source: `/(.*)`
   - Destination: `/`
   - Status Code: `200`

或者在项目根目录创建 `vercel.json` 文件：

```json
{
  "rewrites": [{ "source": "/(.*)", "destination": "/" }]
}
```

然后重新部署。

### Q3: 国内访问慢？

Vercel 在国内访问可能较慢，可以考虑：
- 方案 A：使用 Vercel 的国内加速（设置 Custom Domain）
- 方案 B：部署到国内平台，如腾讯云静态网站托管、阿里云 OSS

### Q4: 别人访问后数据会共享吗？

不会。数据存储在每个用户自己的浏览器 localStorage 中，互不相通。

---

## 方案三：国内部署（访问更快）

如果不想用 Vercel，也可以部署到国内平台：

### 腾讯云 COS / 阿里云 OSS

1. 注册腾讯云/阿里云账号
2. 购买对象存储服务（很便宜，一年几块钱）
3. 创建存储桶，开启静态网站托管
4. 把 `dist` 文件夹里的所有文件上传到存储桶
5. 绑定自定义域名（可选）

### GitHub Pages（国内速度一般）

1. 按方案一上传代码到 GitHub
2. 进入仓库 Settings → Pages
3. Source 选择 "Deploy from a branch"
4. Branch 选择 "main"，文件夹选 "/(root)"
5. 点击 Save，等待几分钟
6. 访问 `https://你的用户名.github.io/schedule-app/`

---

## 推荐总结

| 场景 | 推荐方案 |
|------|----------|
| 快速部署、免费、自动更新 | **方案一：GitHub + Vercel** |
| 不想用 GitHub、快速上线 | **方案二：Vercel CLI** |
| 国内用户多、追求速度 | **方案三：腾讯云 COS** |
| 完全免费、简单展示 | **方案三：GitHub Pages** |
