# 产品待实现事项登记

> 类型：living backlog  
> 状态：active  
> 最后更新：2026-04-19

---

## 用途

- 这里登记已经确认要做、但尚未进入独立 spec 的事项。
- 每个事项一旦开始正式设计，应拆成单独的 spec 和 implementation plan。
- 这里只保留高信号信息：目标、当前状态、主要依赖、建议顺序。

## 当前条目概览

| ID | 事项 | 状态 | 建议优先级 |
|---|---|---|---|
| BL-01 | `ideas` / `daily-nuance` 每日更新入口 | pending | high |
| BL-03 | `harness` 集成与 operator slice | in_progress | high |
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

## BL-03 `harness` 集成与 operator slice

### 目标

- 将你自研的 `harness` 集成进主站。
- 让它既能完成 workflow 类操作，也能在 web 页面提供类似 chatbot 的交互入口。
- 在保持当前站点能力 agent 稳定的基础上，逐步打开更强的 operator 能力。

### 当前状态

- 当前主站已经有第一版 website agent surface：
  - 浮动 chat 入口
  - `/api/agent/query` SSE transport
  - `SuperHaojun` runtime 已通过 `apps/superhaojun` submodule 接入
  - `/superhaojun` 已经退回到一个公开 launch boundary，并把用户交给独立 `SuperHaojun` WebUI
  - 当前暴露的是站点能力工具，不是通用文件系统工具
- 当前网页端 agent 还不能直接作为“服务器 operator agent”去改服务器文件。

### 主要依赖

- 定义 session / message / tool-call / run-status 的最小数据模型。
- 明确 chatbot 的权限边界，尤其是 workflow 类操作是否必须 admin-only。
- 如果要支持服务器文件变更，必须额外定义：
  - 哪些目录可写
  - 哪些内置工具允许暴露到网页端
  - approval UI 与审计记录如何落地
  - 写入后是否触发构建、刷新或发布

### 备注

- 当前已完成的是“网站能力 agent”这一步，不等于“网页端服务器运维 agent”。
- 既然部署目标已经转向独立 ECS，后续可以考虑一条更强的 operator slice，让 agent 在受控范围内修改服务器上的本地文件。
- 现在真正待补的是更深的 approval、operator 工具暴露、以及是否要把 standalone WebUI 做成同域接入。

### 建议下一步

- 保持当前网站能力 agent 稳定。
- 单独设计“受控服务器文件变更”这条 operator slice，而不是直接把全部内置 runtime 工具开放到网页端。
- 视部署稳定性再决定是否需要“同域代理 SuperHaojun WebUI”这条更重的集成线。

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
4. `BL-03` 在现有 website agent 基础上做更强的 operator slice。
5. `BL-04` 根据阅读优先级决定是否继续迁移更深能力。

## 进入 spec 的触发条件

- 某个事项被明确选为“下一步要做”。
- 该事项的输入、边界、成功标准已足够写成独立 spec。
- 该事项不再只是愿景，而是准备进入实现队列。
