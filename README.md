# 吵架包赢

一个帮助你在争论中必胜的AI工具，使用DeepSeek V3模型生成强有力的回复。

## 功能特点

- 输入对方说的话
- 选择回复的语气强烈程度(1-10)
- 一键生成3条犀利回复
- 保存历史记录
- 分享/复制功能
- 手机和PC端完美适配

## 技术栈

- Next.js 14
- TypeScript
- Tailwind CSS
- OpenRouter API (DeepSeek V3模型)
- localStorage存储

## 本地开发

1. 克隆仓库并安装依赖：

```bash
git clone <仓库地址>
cd 吵架包赢
npm install
```

2. 创建环境变量文件 `.env.local`：

```
OPENROUTER_API_KEY=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
OPENROUTER_BASE_URL=https://openrouter.ai/api/v1
OPENROUTER_MODEL=deepseek/deepseek-chat
SITE_URL=http://localhost:3000
```

3. 启动开发服务器：

```bash
npm run dev
```

4. 打开浏览器访问：http://localhost:3000

## 部署到Vercel

1. 注册[Vercel](https://vercel.com)账号并安装[Vercel CLI](https://vercel.com/cli)

2. 使用GitHub登录Vercel

3. 在Vercel控制台中导入你的GitHub仓库

4. 在部署设置中添加环境变量：
   - `OPENROUTER_API_KEY` - OpenRouter API密钥
   - `OPENROUTER_BASE_URL` - OpenRouter API地址
   - `OPENROUTER_MODEL` - 使用的模型名称
   - `SITE_URL` - 你的部署网站URL (例如: https://your-app.vercel.app)

5. 点击部署按钮

## 使用指南

1. 在输入框中输入对方的话
2. 使用滑块选择你想要的回复强度
3. 点击"开始吵架"按钮
4. 获取三条精彩回复
5. 可以保存到历史或分享/复制结果

## 许可证

MIT 