# 个人网站升级计划

> 版本：v1.0  
> 状态：待实现  
> 目标：构建一个以「项目调研洞察」为核心特性的个人创意孵化器，同时统一现有网站架构，支持全局 AI 模型配置

---

## 一、背景与目标

### 核心问题
拥有强大的 AI coding 能力，但缺少一个稳定的**灵感供给 + 优先级判断机制**。现有网站的三个特性（Python 后端、book-reader、另一个小特性）相互独立，缺乏统一的架构和共享能力层。

### 目标态
- 一个统一的个人主站，各特性作为子页面集成
- 一个「项目调研洞察」特性，通过 AI workflow 持续发现并评估值得实现的小项目/工具/玩具
- 一个全局 AI 模型配置系统，供所有特性复用
- 可本地运行，未来平滑迁移至服务器

---

## 二、整体架构

### 部署架构

```
Vercel（前端静态托管）
└── 前端 build 产物（所有页面）
    前端通过 VITE_BACKEND_URL 指向后端

本地 / 未来服务器（Python 后端）
├── FastAPI 应用
├── data/ideas.json（本地文件持久化）
└── .env（敏感配置，不进 repo）
```

### 前端页面结构

```
/                   主页（特性导航 + ideas 榜单 top5 + 已上线特性）
/ideas              项目调研洞察主列表页
/ideas/:id          项目详情页
/reader             book-reader（迁移自现有）
/settings           全局模型配置页
```

### 后端 API 结构

```
POST /api/auth/login          Admin 登录，返回 JWT token（7天有效）
POST /api/proxy/chat          Admin 专用 AI 代理（验证 token 后转发）
GET  /api/ideas               获取所有 ideas
POST /api/ideas               新建 idea
PUT  /api/ideas/:id           更新 idea
DELETE /api/ideas/:id         删除 idea
POST /api/ideas/workflow      手动触发调研 workflow（SSE 流式返回进度）
```

---

## 三、技术栈选型

### 前端

**选型：Vite + React + TypeScript**

选择理由：
- 网站工具属性强，大量页面是重交互的，Docusaurus（文档框架）和 Astro（内容优先）不适合
- Next.js 对于独立后端的场景引入了不必要的概念负担
- Vite + React 完全自由，搭好约定后每次加特性只需新建页面 + 注册路由
- TypeScript 提供类型安全，在数据结构（ProjectIdea schema）较复杂时帮助很大

> **关于 TypeScript**：TypeScript 是 JavaScript 的超集，即所有合法的 JS 代码也是合法的 TS 代码。TS 在 JS 基础上增加了静态类型系统，在编译时捕获类型错误，IDE 支持也更好。现代前端项目几乎默认使用 TS，可以理解为「更安全的 JS」。

前端约定层（保证可扩展性）：

| 层 | 选型 | 用途 |
|---|---|---|
| 路由 | React Router v6 | 每个特性一个顶层路由 |
| 全局状态 | Zustand | AI 配置、admin session、跨页面状态 |
| 样式 | Tailwind CSS | 工具类样式，快速开发 |
| 组件库 | shadcn/ui | 按需复制组件，无黑箱依赖 |
| HTTP 请求 | 原生 fetch 封装 | 统一 apiClient 和 aiClient |

### 后端

**选型：FastAPI + Python（uv 管理依赖）**

选择理由：
- 现有项目已在使用，延续性好
- async 支持完善，适合 SSE 流式返回
- 类型提示和 Pydantic 配合，数据验证清晰

### AI 调用

- 统一使用 OpenAI-compatible 格式 API
- Workflow 搜索能力：Tavily API（有免费额度，搜索质量好）
- 后期可在 workflow 中引入 agent 机制（tool calling 多轮）

---

## 四、模型配置系统设计

### 两种使用模式

**Admin 模式**
```
用户输入 admin password
→ POST /api/auth/login
→ 返回 JWT token（存 localStorage，7天有效）
→ 后续 AI 调用携带 token → POST /api/proxy/chat
→ 后端验证 token，使用 .env 中的 AI_API_KEY 转发请求
→ 前端不接触真实 key
```

**访客模式**
```
用户在 Settings 页面填入 baseURL + apiKey + model
→ 存入 localStorage（仅本地，不上传任何服务器）
→ AI 调用完全在浏览器端发起
→ 不经过任何后端
```

### 前端统一入口：aiClient.ts

```typescript
// 伪代码示意，实现时按实际框架调整
async function chat(messages, options) {
  if (isAdmin()) {
    // 走后端代理
    return fetch('/api/proxy/chat', {
      headers: { Authorization: `Bearer ${getToken()}` },
      body: JSON.stringify({ messages, ...options })
    })
  } else {
    // 走访客本地调用
    const { baseURL, apiKey, model } = getVisitorConfig()
    return fetch(`${baseURL}/chat/completions`, {
      headers: { Authorization: `Bearer ${apiKey}` },
      body: JSON.stringify({ model, messages, ...options })
    })
  }
}
```

### Settings 页面内容

- Provider 配置区：baseURL 输入框、API Key 输入框、Model 选择/输入框
- 测试连接按钮（发一条简单消息验证配置）
- Admin 登录区：password 输入 + 登录按钮，登录后显示当前模式为「Admin」
- 当前状态展示：当前使用的 provider / model / 模式

### 后端环境变量（.env）

```
ADMIN_PASSWORD=...
AI_API_KEY=...
AI_BASE_URL=https://api.openai.com/v1
AI_MODEL=gpt-4o
TAVILY_API_KEY=...
JWT_SECRET=...
```

---

## 五、数据结构设计

### ProjectIdea Schema

```typescript
interface ProjectIdea {
  id: string                    // UUID
  title: string                 // 简短名称，如 "Epub Reader"
  tagline: string               // 一句话描述
  category: 'toy' | 'tool' | 'feature' | 'learning'
  status: 'pending' | 'in_progress' | 'done' | 'skipped'

  scores: {
    value: number               // 实现价值（对自己有多有用），1-10
    learnability: number        // 学习价值（能学到多少新东西），1-10
    fun: number                 // 趣味性，1-10
    feasibility: number         // 可行性（周末能搞定吗），1-10
    overall: number             // 综合分（可由 AI 给出也可手动调整）
  }

  detail: {
    why_interesting: string     // 为什么有意思（2-3句）
    why_worth_doing: string     // 为什么值得实现
    references: Reference[]     // 相关链接
    tech_hints: string[]        // 可能用到的技术栈
    effort: 'S' | 'M' | 'L'   // S=小时级, M=天级, L=周级
  }

  meta: {
    discovered_at: string       // ISO 时间戳
    source: 'workflow' | 'manual'
    workflow_run_id?: string    // 来自哪次 workflow
  }
}

interface Reference {
  title: string
  url: string
  type: 'repo' | 'article' | 'hn' | 'other'
}
```

### data/ideas.json 结构

```json
{
  "version": "1",
  "updated_at": "2025-01-01T00:00:00Z",
  "ideas": [ /* ProjectIdea[] */ ]
}
```

---

## 六、Workflow 引擎设计

### 触发方式

手动触发：用户在 /ideas 页面点击「发现新想法」按钮，可选填方向偏好（如「AI工具」「开发者效率」），留空则自由探索。

### 三阶段流程

**Phase 1 — 发现（Discovery）**

目标：找到 10-15 个候选方向

搜索来源：
- Hacker News Show HN 近期帖子（Tavily 搜索）
- GitHub trending 小型个人项目
- 关键词搜索：`"weekend project"`, `"built this in a day"`, `"tiny tool"`, `"side project"`
- 可结合用户指定的方向偏好词

输出：候选列表，每项包含 title、简单描述、来源 URL

**Phase 2 — 分析与二次挖掘（Analysis）**

目标：对 Phase 1 的候选逐一深入分析

对每个候选：
- 二次搜索：有没有已有的实现、技术文章、相关 repo
- 分析：解决什么问题、用户是谁、个人实现的技术路径
- 提炼：为什么有意思、为什么值得实现、参考链接整理
- 给出初始评分（value / learnability / fun / feasibility）和 effort 估算

**Phase 3 — 评分汇总（Scoring & Summary）**

目标：综合所有候选，生成最终结构化列表

- 计算 overall 综合分（各维度加权平均，权重可配置）
- 去重（与已有 ideas 对比，避免重复）
- 过滤掉明显不合适的（feasibility 过低、已实现类似功能等）
- 生成最终 ProjectIdea[] 列表

### 后端实现思路

```python
# 伪代码示意
async def run_workflow(direction: str, stream: SSEStream):
    await stream.send("phase:1", "开始搜索候选项目...")
    
    candidates = []
    queries = build_discovery_queries(direction)
    for query in queries:
        results = await tavily.search(query)
        candidates.extend(parse_candidates(results))
        await stream.send("phase:1:progress", f"已发现 {len(candidates)} 个候选")
    
    await stream.send("phase:2", "开始深度分析...")
    
    analyzed = []
    for candidate in candidates[:12]:  # 控制数量
        detail = await analyze_candidate(candidate)  # 调用 AI + Tavily 二次搜索
        analyzed.append(detail)
        await stream.send("phase:2:progress", f"已分析：{candidate.title}")
    
    await stream.send("phase:3", "生成评分汇总...")
    ideas = await score_and_summarize(analyzed)
    
    await stream.send("done", ideas)  # 返回最终结构化列表
```

### 前端进度展示

Workflow 运行时显示实时进度：
- 当前阶段（Phase 1 / 2 / 3）
- 已发现/已分析数量
- 正在处理的项目名称
- 完成后自动刷新 ideas 列表，新增项目高亮显示

---

## 七、页面详细设计

### /ideas 主列表页

顶部区域：
- 页面标题和说明
- 「发现新想法」按钮（触发 workflow）
- 「手动添加」按钮

筛选和排序栏：
- 按 category 筛选（全部 / toy / tool / feature / learning）
- 按 status 筛选（待实现 / 进行中 / 已完成）
- 排序（综合分 / 实现价值 / 趣味性 / 最新发现）

卡片列表，每张卡片展示：
- title + tagline
- category badge + effort badge（S/M/L）
- status badge
- overall 综合分（大字展示）
- 四个维度的简单分数条
- 点击进入详情页
- 快捷操作：标记「跳过」、更改状态

Workflow 进度展示（运行时浮层或内嵌区域）：
- 实时阶段和进度信息
- 可中断

### /ideas/:id 详情页

- title + tagline + category + status
- 四维评分雷达图（value / learnability / fun / feasibility）
- why_interesting 和 why_worth_doing 详细描述
- References 列表（可点击跳转）
- Tech hints 标签组
- Effort 估算和综合分
- 操作区：更改状态（「开始实现」/ 「标记完成」/ 「跳过」）
- 编辑按钮（进入编辑模式，所有字段可修改，支持手动调整 AI 给出的评分）

### / 主页

- 个人介绍区（已有内容）
- 「待实现项目榜单」模块：展示综合分 top 5 的 pending ideas，每项显示 title + overall 分 + effort
- 「已上线特性」模块：所有 status=done 的 ideas + 现有特性（book-reader 等）
- 全局搜索入口（搜索特性和 ideas）

### /settings 设置页

- Visitor 模型配置区
- Admin 登录区
- 当前配置状态展示

---

## 八、实现计划（分 Phase）

### Phase 0 — 项目初始化与基础设施

目标：搭建前后端脚手架，跑通开发环境

前端任务：
- 新建 Vite + React + TypeScript 项目
- 配置 React Router v6（注册 /、/ideas、/ideas/:id、/settings、/reader 路由）
- 配置 Tailwind CSS + shadcn/ui
- 配置 Zustand store（初始：AI 配置、admin session）
- 配置 VITE_BACKEND_URL 环境变量
- 搭建基础 Layout 组件（导航栏、页面容器）
- 配置 Vercel 部署（connect repo，设置构建命令）

后端任务：
- 新建 FastAPI 项目，uv 初始化依赖
- 配置 CORS（允许前端域名）
- 配置 .env 加载（python-dotenv）
- 初始化 data/ideas.json
- 搭建基础路由结构（routers/ 目录）

产出：前端页面能跑起来（空白页），后端能启动，两者能互通

### Phase 1 — 模型配置系统

目标：全局 AI 调用能力就位，所有后续特性可复用

后端任务：
- 实现 POST /api/auth/login（验证 ADMIN_PASSWORD，返回 JWT）
- 实现 POST /api/proxy/chat（验证 JWT，转发到 AI_BASE_URL，支持流式）
- JWT 工具函数（生成、验证，7天有效期）

前端任务：
- 实现 aiClient.ts（admin 走代理 / 访客走本地，统一接口）
- 实现 apiClient.ts（封装对后端的 fetch，自动带 token）
- 实现 Zustand 的 aiConfigStore（存 visitor 配置和 admin token）
- 实现 /settings 页面
  - Visitor 配置表单（baseURL / apiKey / model）+ 测试连接
  - Admin 登录表单 + 登录状态展示
- 导航栏加入 Settings 入口

产出：Settings 页面可用，aiClient 可以在任意页面调用

### Phase 2 — Ideas 数据层

目标：CRUD 接口和前端封装就位

后端任务：
- 实现 ideas.json 的读写工具函数（带文件锁防并发）
- 实现 GET /api/ideas（支持 status / category 过滤参数）
- 实现 POST /api/ideas（创建，自动生成 id 和 meta）
- 实现 PUT /api/ideas/:id（更新）
- 实现 DELETE /api/ideas/:id（删除）
- Pydantic model 定义（对应 TypeScript 的 ProjectIdea schema）

前端任务：
- TypeScript interface 定义（ProjectIdea 完整 schema）
- ideasApi.ts 封装（对应五个接口）
- Zustand 的 ideasStore（缓存列表，CRUD 操作）

产出：可以通过 API 增删改查 ideas，数据持久化到 ideas.json

### Phase 3 — Workflow 引擎

目标：手动触发调研流程，生成结构化 ideas

后端任务：
- Tavily API 封装（search 函数，处理返回格式）
- Workflow Phase 1 实现（构建 discovery queries，批量搜索，解析候选列表）
- Workflow Phase 2 实现（AI 分析每个候选 + Tavily 二次搜索，生成结构化 detail 和评分）
  - Prompt 设计：要求 AI 输出 JSON 格式，包含所有 ProjectIdea 字段
- Workflow Phase 3 实现（综合评分，去重过滤，输出最终列表）
- 实现 POST /api/ideas/workflow（SSE 流式返回进度，每个阶段推送事件）
- 使用 Admin 的 AI 配置运行 workflow（key 在后端，不暴露）

前端任务：
- Workflow 触发 UI（按钮 + 方向偏好输入框）
- SSE 客户端（接收进度事件，更新进度展示）
- 进度展示组件（当前阶段、已处理数量、正在处理的项目名）
- Workflow 完成后自动将新 ideas 合并到列表，高亮展示

产出：点击「发现新想法」，能看到实时进度，完成后 ideas 列表自动更新

### Phase 4 — Ideas 页面

目标：完整的 ideas 功能页面

前端任务：
- /ideas 主列表页
  - 卡片组件（展示所有字段摘要）
  - 筛选栏组件（category / status / 排序）
  - 手动添加弹窗（表单，所有字段可填，评分字段有默认值）
  - Workflow 触发集成
- /ideas/:id 详情页
  - 完整信息展示
  - 评分雷达图（使用 recharts 或 chart.js）
  - References 列表
  - 状态更改操作
  - 编辑模式（inline 编辑，保存调用 PUT 接口）

产出：ideas 核心功能完整可用

### Phase 5 — 主页集成与迁移

目标：统一主站，整合现有特性

前端任务：
- 主页重构
  - 个人介绍区
  - ideas 榜单模块（top 5 pending，分数展示）
  - 已上线特性模块
- book-reader 迁移（将现有 Vite book-reader 作为 /reader 路由集成进主站）
  - 评估现有代码，提取核心逻辑
  - 接入 aiClient（如果 reader 有 AI 功能）
- 全局搜索（客户端，搜索 ideas 标题 / tagline / 特性名称）
- Docusaurus 处理（保留独立运行 + 主站加外链，或内容迁移，视内容量决定）

产出：统一主站上线，所有特性通过导航可达

---

## 九、关键技术细节备忘

### 跨域（CORS）配置

本地开发时前端在 localhost:5173，后端在 localhost:8000，需要后端允许跨域。生产环境前端在 Vercel 域名，后端在服务器 IP 或子域名，同样需要配置。

### 前端 BACKEND_URL 环境变量

```
本地开发：.env.local → VITE_BACKEND_URL=http://localhost:8000
生产环境：.env.production → VITE_BACKEND_URL=https://api.yourdomain.com
```

Vercel 上可以在项目设置中配置环境变量，无需提交到 repo。

### SSE（Server-Sent Events）

Workflow 使用 SSE 推送进度，FastAPI 原生支持 StreamingResponse。前端使用 EventSource API 接收。注意：SSE 不支持携带自定义 header（即无法直接携带 JWT token），需要通过 URL 参数传递 token 或使用 POST + ReadableStream 方案。

推荐方案：POST /api/ideas/workflow，body 中带 token，后端验证后返回 StreamingResponse。

### Tavily API 使用

Tavily 提供专为 AI 设计的搜索 API，返回格式比原始 HTML 更结构化，适合直接喂给 AI 分析。免费额度每月 1000 次搜索，对于手动触发的 workflow 完全够用。

### AI Prompt 设计原则（Workflow 用）

Phase 2 分析时，要求 AI 严格输出 JSON，避免自由发挥：

```
你是一个项目评估助手。分析以下项目，输出 JSON 格式的评估结果。
不要输出任何 JSON 以外的内容。

项目信息：{candidate}
搜索补充信息：{search_results}

输出格式：
{
  "why_interesting": "...",
  "why_worth_doing": "...",
  "tech_hints": ["...", "..."],
  "effort": "S|M|L",
  "scores": {
    "value": 1-10,
    "learnability": 1-10,
    "fun": 1-10,
    "feasibility": 1-10
  }
}
```

### 未来扩展方向（不在当前计划内）

- Workflow 引入 agent 机制（多轮 tool calling，动态决定搜索策略）
- ideas 评分的用户历史学习（根据你的选择偏好调整权重）
- 主页搜索升级为语义搜索（调用 AI embedding）
- ideas 实现进度追踪（关联 git commit 或开发日志）
- 多设备同步（迁移到服务器后，数据自然同步）

---

## 十、目录结构

```
your-site/
├── frontend/
│   ├── src/
│   │   ├── pages/
│   │   │   ├── Home.tsx
│   │   │   ├── Ideas.tsx
│   │   │   ├── IdeaDetail.tsx
│   │   │   ├── Reader.tsx
│   │   │   └── Settings.tsx
│   │   ├── components/
│   │   │   ├── layout/
│   │   │   │   ├── Navbar.tsx
│   │   │   │   └── PageContainer.tsx
│   │   │   ├── ideas/
│   │   │   │   ├── IdeaCard.tsx
│   │   │   │   ├── IdeaFilter.tsx
│   │   │   │   ├── ScoreRadar.tsx
│   │   │   │   ├── WorkflowProgress.tsx
│   │   │   │   └── IdeaForm.tsx
│   │   │   └── ui/               # shadcn/ui 组件
│   │   ├── lib/
│   │   │   ├── aiClient.ts       # 统一 AI 调用入口
│   │   │   ├── apiClient.ts      # 后端 API 调用封装
│   │   │   └── ideasApi.ts       # ideas CRUD 封装
│   │   ├── store/
│   │   │   ├── aiConfigStore.ts  # AI 配置和 admin session
│   │   │   └── ideasStore.ts     # ideas 列表状态
│   │   ├── types/
│   │   │   └── idea.ts           # ProjectIdea interface 等
│   │   ├── App.tsx               # 路由配置
│   │   └── main.tsx
│   ├── .env.local                # 本地开发环境变量（不进 repo）
│   ├── .env.production           # 生产环境变量（不进 repo）
│   ├── package.json
│   ├── tsconfig.json
│   └── vite.config.ts
│
├── backend/
│   ├── routers/
│   │   ├── auth.py
│   │   ├── proxy.py
│   │   ├── ideas.py
│   │   └── workflow.py
│   ├── services/
│   │   ├── tavily.py             # Tavily API 封装
│   │   ├── ai.py                 # AI 调用封装
│   │   └── ideas_store.py        # ideas.json 读写
│   ├── models/
│   │   └── idea.py               # Pydantic models
│   ├── data/
│   │   └── ideas.json
│   ├── main.py
│   ├── .env                      # 不进 repo
│   └── pyproject.toml            # uv 管理
│
└── README.md
```

---

*计划生成时间：2025年  
实现顺序：Phase 0 → 1 → 2 → 3 → 4 → 5，每个 Phase 完成后可独立使用*
