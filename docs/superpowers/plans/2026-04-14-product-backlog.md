# 产品待实现事项登记

> 类型：living backlog  
> 状态：active  
> 最后更新：2026-04-14

---

## 用途

- 这里登记已经确认要做、但尚未进入独立 spec 的事项。
- 每个事项一旦开始正式设计，应拆成单独的 spec 和 implementation plan。
- 这里只保留高信号信息：目标、当前状态、主要依赖、建议顺序。

## 当前条目概览

| ID | 事项 | 状态 | 建议优先级 |
|---|---|---|---|
| BL-01 | `ideas` / `daily-nuance` 每日更新入口 | pending | high |
| BL-02 | `skill marketplace` | pending | medium |
| BL-03 | `harness` 集成与 web chatbot | pending | high |
| BL-04 | `book-reader` 新版重构 | in_progress | medium |

## BL-01 `ideas` / `daily-nuance` 每日更新入口

### 目标

- 在 `ideas` 与 `daily-nuance` 页面提供受控的“今日更新”入口。
- 让更新动作在页面里可见、可触发、可反馈，而不是只依赖命令行脚本。

### 当前状态

- `ideas` 已经有 admin workflow 入口，可以发现新候选并写入 store，适合演化成“今日更新”按钮。
- `ideas` 前端里真正面向 operator 的“今日更新”按钮还没有落地，当前只有 `Refresh List` 与 `Run Discovery` 这两个分离动作。
- `ideas` 当前的 `Refresh List` 只是重新拉取已有列表，不等于生成今天的新内容。
- `daily-nuance` 当前前端只读取静态 snapshot。
- `daily-nuance` 的刷新仍依赖 `uv` 脚本和 snapshot 复制流程，尚无浏览器可调用的运行时 API。

### 主要依赖

- 明确 admin-only 的触发边界。
- 为 `daily-nuance` 增加服务端刷新入口或 job 边界。
- 为长任务提供状态反馈，避免用户误以为按钮无效。

### 备注

- `ideas` 可以先落成一个很小的 vertical slice。
- `daily-nuance` 不适合直接把本地脚本粗暴暴露给前端。
- `daily-nuance` 后续更合理的方向，是从运行时数据源读取最新 snapshot，而不是继续把更新能力绑定在静态构建产物上。

### 建议下一步

- 先做 `ideas` admin-only 的“今日更新”按钮。
- 再为 `daily-nuance` 设计服务端刷新与状态反馈边界。

## BL-02 `skill marketplace`

### 目标

- 建一个市场页，集中展示你自己实现的 skills，以及社区公认高质量的 skills / plugins。
- 让这个页面既能承担浏览发现，也能承担后续的精选与沉淀。

### 当前状态

- 仓库已经有 skills / plugins / 文档体系，但没有统一的 marketplace surface。
- 前端已经有统一主站与 UI 组件基础，可承接新的产品页面。

### 主要依赖

- 定义 market item schema：最少要包含名称、类型、来源、自研/社区、摘要、适用场景、质量信号、链接或安装方式。
- 明确“展示 catalog”与“真正安装/启用”是否拆期。
- 明确精选规则，避免市场页沦为简单堆链接。

### 备注

- 前端信息架构可以借鉴成熟市场类产品，但应保持当前主站的视觉语法与组件体系。
- 推荐先做 read-only curated catalog，再决定是否加入安装、同步、评分等重交互能力。

### 建议下一步

- 先设计 item schema 和 source-of-truth。
- 再做 marketplace 的最小目录页与详情卡片体系。

## BL-03 `harness` 集成与 web chatbot

### 目标

- 将你自研的 `harness` 集成进主站。
- 让它既能完成 workflow 类操作，也能在 web 页面提供类似 chatbot 的交互入口。

### 当前状态

- 假设 `harness` 已有独立实现，但尚未并入当前 repo 的统一前后端边界。
- 当前主站还没有一个正式的 agent / harness runtime surface。

### 主要依赖

- 明确 `harness` 的接入方式：作为独立服务、后端模块，还是被现有后端代理调用。
- 定义 session / message / tool-call / run-status 的最小数据模型。
- 明确 chatbot 的权限边界，尤其是 workflow 类操作是否必须 admin-only。

### 备注

- 这件事天然可以拆成两步。
- 第一步是 `harness` 接入并跑通一个最小 workflow tool。
- 第二步是 web chatbot UI，把能力以可视界面暴露出来。
- 如果未来 `skill marketplace` 需要展示“可由 harness 调用的 skill/plugin”，这两条线会发生耦合，因此接入边界应尽量清楚。

### 建议下一步

- 先做一个最小 harness integration slice。
- 用一个最简单的 chatbot 页面验证消息流、状态流和 tool 调用反馈。

## BL-04 `book-reader` 新版重构

### 目标

- 完成统一主站内的新版 `book-reader`，不再只停留在过渡入口。
- 在保留迁移安全性的同时，让新版页面逐步接手原始 reader 的核心体验。

### 当前状态

- `/book-reader` 已经不再只是 transition shell，而是有了第一版站内 EPUB 阅读切片。
- 新版页面当前已具备：preset shelf、站内阅读 workspace、目录跳转、阅读设置持久化、进度持久化，以及 legacy fallback。
- `/book-reader-legacy/` 仍然保留，当前主要承担 uploads、PDF、以及更深的旧工作流能力。
- 这条事项仍然是 `in_progress`，因为新版 reader 还没有完成更深层的 parity 与迁移收口。

### 主要依赖

- 明确新版 reader 首批必须承接的核心能力，而不是一次性追求深度 parity。
- 规划与 legacy reader 的迁移策略，避免两套实现长期并行却边界模糊。
- 明确新版 reader 依赖的数据、阅读状态、交互能力是否继续沿用现有实现，还是重新抽象。

### 备注

- 这条事项应和统一前端视觉方向保持一致，但它本质上是一个独立产品切片，不应继续作为“过渡壳的小补丁”推进。
- 第一版最小可读切片已经落地，接下来应围绕“哪些能力值得继续迁移进主站”而不是“是否还要继续做一个壳”来推进。
- legacy route 的下线条件仍需单独定义，不应因为新版已可访问就默认可以移除。

### 建议下一步

- 明确第二阶段是否要迁移 uploads、PDF、search、bookmarks 等更深能力。
- 在完成下一阶段能力边界前，继续保留 `/book-reader-legacy/` 作为稳定 fallback。

## 建议实现顺序

1. `BL-01` 先落地 `ideas` 的 admin-only 今日更新入口。
2. `BL-01` 再补 `daily-nuance` 的服务端刷新边界。
3. `BL-04` 为新版 `book-reader` 定义最小可替代切片。
4. `BL-03` 做 `harness` 的最小接入切片。
5. `BL-03` 在此基础上做 web chatbot。
6. `BL-02` 等 skill / plugin 的 schema 与 harness 关系更清楚后，再做 marketplace。

## 进入 spec 的触发条件

- 某个事项被明确选为“下一步要做”。
- 该事项的输入、边界、成功标准已足够写成独立 spec。
- 该事项不再只是愿景，而是准备进入实现队列。
