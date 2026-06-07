# iowajournalist.org 部署指南

代码已推送到：https://github.com/http987633/iowajournalist

## 第一步：创建数据库（Neon 免费）

1. 打开 https://neon.tech 注册
2. 新建 Project，Region 选 US (离 Iowa 近)
3. 复制 **Connection string**（带 `?sslmode=require`）

## 第二步：Vercel 导入项目

1. 登录 https://vercel.com/wailian
2. 点击 **Add New → Project**
3. 选择 GitHub 仓库 `http987633/iowajournalist`
4. 在 **Environment Variables** 添加以下变量：

| 变量名 | 值 | 说明 |
|--------|-----|------|
| `DATABASE_URL` | `postgresql://...` | Neon 连接串 |
| `NEXT_PUBLIC_SITE_URL` | `https://iowajournalist.org` | 站点 URL |
| `ADMIN_PASSWORD` | 自设强密码 | 后台登录密码 |
| `ADMIN_SECRET` | 随机32位字符串 | Session 签名 |
| `GEMINI_API_KEY` | Google AI Studio 密钥 | 自动发文 |
| `CRON_SECRET` | 随机字符串 | 定时任务保护 |
| `AUTO_PUBLISH_GEMINI` | `false` | 建议先人工审核 |

5. 点击 **Deploy**

## 第三步：绑定域名

1. Vercel 项目 → **Settings → Domains**
2. 添加 `iowajournalist.org` 和 `www.iowajournalist.org`
3. 按 Vercel 提示在域名注册商修改 DNS：

```
类型 A    主机 @    值 76.76.21.21
类型 CNAME 主机 www  值 cname.vercel-dns.com
```

## 第四步：初始化数据

部署成功后，在本地运行（需配置好 .env）：

```bash
npm run db:seed
```

或在 Neon SQL Editor 手动执行 seed 中的内容。

## 使用说明

| 地址 | 功能 |
|------|------|
| https://iowajournalist.org | 前台首页 |
| https://iowajournalist.org/admin | 后台管理 |
| https://iowajournalist.org/admin/articles/new | 手动发文章 |
| https://iowajournalist.org/admin/topics | 导入 AI 话题 |
| https://iowajournalist.org/admin/generate | Gemini 生成文章 |

## 本地开发路径

由于中文路径会导致构建失败，请使用：

```
C:\Users\Administrator\projects\iowajournalist
```

桌面目录 `最新搭建网站\iowajournalist.org` 已同步副本。
