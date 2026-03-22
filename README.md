# 耽美阅读器

一个轻量的在线耽美小说阅读工具，支持搜索、章节浏览、阅读偏好设置和全书 TXT 导出。

## 功能特性

- **搜索小说** — 通过关键词搜索小说
- **章节阅读** — 分页翻页阅读，自动记忆阅读进度
- **阅读设置** — 字体大小、字重、亮度调节
- **全书导出** — 3 路并发拉取章节，生成带 BOM 的 UTF-8 TXT 文件
- **章节缓存** — IndexedDB 本地缓存（7 天有效），重复导出直接读缓存
- **iOS 支持** — 导出时优先使用 Web Share API，兼容 iOS Safari

## 技术栈

| 层 | 技术 |
|---|---|
| 服务端 | Node.js 18+、Express 5、TypeScript |
| 前端 | 原生 TypeScript，esbuild 打包 |
| HTML 解析 | cheerio |
| 内容获取 | node fetch / Playwright（可选）|
| 服务端缓存 | LRU Cache（内存）|
| 客户端缓存 | IndexedDB |

## 快速开始

### 依赖安装

```bash
cd reader
pnpm install
```

### 开发模式

```bash
pnpm dev
```

服务启动后访问 `http://localhost:8787`

### 生产构建

```bash
pnpm build
node dist/server.js
```

## 环境变量

| 变量 | 默认值 | 说明 |
|---|---|---|
| `PORT` | `8787` | 服务监听端口 |
| `DANMEI_UA` | Chrome UA | 请求使用的 User-Agent |
| `DANMEI_DEBUG` | `0` | 设为 `1` 开启调试日志 |
| `DANMEI_PLAYWRIGHT` | `0` | 设为 `1` 启用 Playwright 渲染 |

## API 接口

| 方法 | 路径 | 参数 | 说明 |
|---|---|---|---|
| GET | `/api/search` | `q=关键词` | 搜索小说 |
| GET | `/api/book` | `url=书籍页URL` | 获取书籍信息和章节列表 |
| GET | `/api/chapter` | `url=章节URL` | 获取章节正文 |
| GET | `/api/ping` | — | 健康检查 |

## 测试

```bash
pnpm test
```

## 项目结构

```
reader/
├── src/               # 服务端源码
│   ├── routes/        # Express 路由
│   ├── services/      # 内容获取与解析
│   └── config.ts      # 环境变量配置
├── web-src/           # 前端源码（TypeScript）
│   ├── reader/        # 阅读器核心逻辑
│   ├── services/      # API 调用、存储、缓存
│   ├── ui/            # 渲染与布局
│   └── main.ts        # 前端入口
├── public/            # 静态资源（构建输出）
└── test/              # 测试文件
```
