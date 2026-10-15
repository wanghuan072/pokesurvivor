# PokeSurvivor 网站实现与维护

## 内容、SEO 与品牌（2026-10-15，当前发布规则）

- 当前共 21 个正式页面；仅三篇 Guides 文章及 FAQ 保留详情地址。下方较早记录属于历史，不代表当前发布范围。
- 静态页面 TDK 集中在 `src/seo/tdk.js`，Hero 位于 `src/data/site/pages.json`；指南和 FAQ 的 SEO 随各自 JSON 内容维护。标题使用绝对值，不再重复追加品牌。
- 五个 Legal 页面使用 `/legal/` 路径；旧 `/about`、`/privacy-policy`、`/contact` 为永久跳转。页脚统一使用正常站内链接，版权年份在客户端自动更新。
- Canonical、社交地址及结构化数据使用 `https://pokesurvivor.me`。默认禁止索引；正式发布环境明确设置 `SITE_INDEXABLE=true`。`VERCEL_ENV=preview` 始终禁止索引，不受该开关覆盖。
- 修改正文、数据或 SEO 后运行 `npm run content:sync`，提交并保存 `src/data/seo/page-revisions.json`。`npm run content:check` 只校验；构建前也会校验，未同步时构建失败。重复同步不改时间，删除页面从清单及 sitemap 移除。指纹排除构建时间、更新时间本身与页脚版权年份。
- `npm run audit` 检查机制、链接、已删除地址和最终 HTML 的 SEO。运行 HTTP 审计时设置 `AUDIT_URL`；通过 `AUDIT_EXPECT_INDEXABLE=true` 或 `false` 校验对应构建的索引开关。
- Logo 和 favicon 为原创像素篝火与探索徽标；统一社交图为 `/images/og-image.png`（1200×630）。第三方游戏素材继续按 Copyright 页面和原有许可署名。
- 响应式宽度断点仅 1024px、768px；桌面侧栏固定跟随，平板与手机使用汉堡菜单。测试尺寸还覆盖 320、390、1440、1920px。
- 最终验收：构建、TypeScript、Lint 与全部审计通过；829 个链接/锚点和 75 条搜索记录有效，23 个页面/公共端点返回 200，1,064 个移除或无效地址返回 404，5 个旧地址永久跳转符合预期。21 页 × 6 尺寸共 126 次浏览器检查无横向溢出、缺失 H1 或坏图，控制台无警告和错误。已验证平板菜单、Escape 关闭、Guides 原生页面导航及浏览器返回、Ember 搜索定位。预览 robots 禁止索引，正式开关构建允许索引；重复同步日期不变。
- 本轮证据：`docs/qa/content-seo-responsive.json`、`content-seo-browser-console.json`、`content-seo-home-desktop.jpg`、`content-seo-home-mobile.jpg` 和 `content-seo-legal-mobile.jpg`。只完成本地实现与测试，未部署或修改远程仓库。

以下为此前各轮实现记录。

## 临时只发布 Guides 详情（2026-10-15）

- 除 Guides（含现有 FAQ）外不发布详情页，Pokédex、Level-up、Tier List 与 Builds 均保留列表及列表内筛选/展开功能。
- 取消 `/pokedex/[slug]` 路由，966 条原始 JSON 的 `hasDetailPage` 均设为 false；移除“已发布指南”空筛选、卡片跳转、详情发布提示及 sitemap 条目。图鉴详情组件与素材作为未发布草稿保留。
- 原先开放的图鉴编号为 1、4、6、7、25、54、94、133、282、448。以后重新开放时需恢复路由、选择发布记录并调整当前禁用详情的审计约束；不应只改 JSON 就意外重新发布。
- 全局搜索现有 75 条结果，不再收录图鉴详情；Tier List 和指南中的宝可梦名称均为普通文字。Level-up 的招式锚点继续在同一列表内定位；Guides 的三篇文章保留。
- 已验证图鉴搜索 Pikachu 返回列表卡片且无详情链接，手机端无横向溢出；Tier List、Level-up、Guides 列表与指南文章没有指向禁用详情的入口。构建、TypeScript、Lint 与站点审计通过。
- 图鉴只保留列表的截图：`docs/qa/pokedex-list-only.jpg`。

## Builds 只保留列表（2026-10-15）

- 移除全部 `/builds/[slug]` 详情路由与独立详情组件，六个旧地址均返回 404。
- 配装卡片改为文章块，升级优先级、兼容伙伴、备选招式的进化条件及道具建议通过原生折叠区在列表内展示。
- 首页、搜索快捷入口及生成搜索索引均指向 `/builds#build-配装slug`；sitemap 只收录 `/builds`。筛选后点击其他配装锚点会恢复列表并定位目标。
- 构建、类型检查、Lint、站点审计通过；六个旧详情地址实测 404。列表内展开不跳转新页面，手机端无横向溢出，控制台没有警告或错误。

## Builds 列表改版（2026-10-15）

- 页面新增喷火龙精选配装与配装思路说明；六套配装使用不同属性配色、本地伙伴立绘、真实招式图标、主招式进化条件、备选招式与兼容伙伴预览。
- 核心升级卡筛选使用局部客户端状态：Power 两套、Sprint 一套、Reflexes 三套。默认六套卡片均包含在静态 HTML 中；只向筛选组件传递六套预览数据，不发送完整伙伴数据库。
- 详情页内容和地址保持原有实现，卡片使用普通链接。浏览器已确认桌面进入水系详情、手机筛选后进入耿鬼详情均发出 Document 请求，返回列表正常。
- 320、390、768、1024、1920px 无页面横向溢出；无坏图或开发控制台警告。构建、类型检查、Lint、机制与站点审计通过（1,638 个页面链接及锚点）。
- 桌面和手机截图：`docs/qa/builds-redesign-desktop.jpg`、`docs/qa/builds-redesign-mobile.jpg`。

## 全站复查（2026-10-15）

- 修复搜索框仍提示可搜索工具的残留文案，改为指南、宝可梦或招式。
- 35 个正式页面逐页在开发模式打开：未发现 Next.js 警告、浏览器控制台警告/错误、加载失败的图片及已删除页面入口。旧开发日志含删除文件时产生的历史错误，本次访问没有重现。
- 构建、TypeScript 与 Lint 通过；审计覆盖 1,631 个页面链接及锚点、85 条搜索记录、sitemap 和已删除页面的根地址及子地址。CSS 图片引用存在。
- 生产 HTTP 检查：37 个正式页面/公共端点返回 200；1,045 个已删除、未发布及无效地址返回 404（包含全部 956 个未发布图鉴详情）；`/moves`、`/evolutions` 仍分别 308 到升级卡列表锚点，页面中没有旧路由入口。
- 19 个外链最终均返回 200；首次的两次网络失败及一次 GitHub 503 在复查后恢复，未据此替换有效来源链接。外部可用性仅代表检查时状态。
- 35 个页面在手机尺寸下没有页面横向溢出。桌面搜索结果及手机菜单导航均有原生 Document 请求，浏览器返回正常；搜索 `tools` 无已删除工具结果，搜索 `Ember` 指向卡片行。
- 证据位于 `docs/qa/development-page-check.json`、`mobile-page-check.json`、`external-link-check.json`、`browser-console-check.json` 与 `search-entry-cleanup.jpg`。
- 保留的 `src/lib/tools` 是类型计算与已验证概率规则的内部代码，`src/page/wiki` 是正式内容页面实现目录，均不产生同名已删除路由。历史研究文档与归档 JSON 不参与发布。

当前保留三篇详细攻略；Tools 列表与全部工具详情页已删除，旧地址返回 404。首页工具区、导航、搜索入口、正文链接及 sitemap 已同步清理。[三篇指南与工具面板](guides-tools-redesign.md) 为此前设计记录。

本地源码解包与本轮新增内容见 [本地游戏源码分析](local-game-analysis.md)：本地精灵图、闪光与动画，波次、任务、事件和完整招式资料。

当前页面组织与分批发布以 [升级卡与首版图鉴发布](content-release.md) 为准：仅开放 10 个图鉴详情，删除 Wiki 目录页，合并招式与进化列表为升级卡。

## 数据内容第二轮完善

当前数据与维护流程以 [全网研究与逐页完善](research-content.md) 为准。已升级为固定源码构建 bc2124ff1d：真实伙伴数值与招式池、130 个成就、11 道具、13 永久升级、13 篇攻略和六套配装；抽卡工具已加入保底与十连，配装存储升级为 v2。以下部分描述初版实现，历史验收见 verification.md。

## 需求依据与边界

视觉依据是用户提供的首页设计图。读取了「分析关键词SEO」对话（6ad02aae-cb90-83ec-8cfd-2742ce40fdb5），接口只返回最近五轮，未返回早期 SEO 分析正文。可确认的产品决定是：首页按钮跳转 `/play`，在专用页面用 iframe 展示游戏；不在首页加载 iframe。未将引用对话中未返回的内容冒充已完成分析。

英文为网站内容语言，匹配设计图和关键词的检索意图。核心关键词 PokeSurvivor，相关主题包括 play online、wiki、Pokédex、moves、evolutions、builds、tier list、beginner guide、gacha、type calculator。

## 架构

- `src/app`：框架入口、精简路由、Metadata、sitemap、robots 和 404。
- `src/page`：home、wiki、pokedex、moves、guides、builds、tools、play 页面实现。
- `src/components`：通用标题、卡片、精灵图片、导航和全站外壳。
- `src/style`：全局基础样式及按归属整理的 CSS Modules。
- `src/data`：纯 JSON；图鉴、招式和属性矩阵为生成数据，攻略和配装为人工编辑。
- `src/lib/data`：类型化数据读取；`src/lib/tools`：计算器逻辑。
- `src/types`：领域类型；`src/config`：导航、站点与栏目配置；`src/seo`：共享 Metadata 与安全 JSON-LD 输出。

所有独立页面使用原生 `<a>` 完整文档导航，遵循全局 web-navigation 规则。筛选、计算、搜索弹窗及展开收起在当前页面完成。未安装广告或统计 SDK。ESLint 只针对该明确约定关闭 `no-html-link-for-pages`。

模板的 Turbopack Tailwind loader 原来匹配所有 CSS，会让 CSS Modules 的类映射变成 undefined；已将匹配范围限定为 `globals.css`，模块交给 Next.js 原生处理。保留现有 cacheComponents 与 partialPrefetching。阅读本地 16.4.1 文档后，使用 Promise params、generateStaticParams 和 notFound；不使用与 cacheComponents 冲突的 dynamicParams 配置。根布局使用该版本新引入的 `ensureStatic = 'navigation'`，完整静态输出先解析未知路径，避免流式 fallback 提前发送 200 导致软 404。

## 内容与功能

- 首页：月夜像素场景、侧栏、数据卡、游戏入口、快捷入口、精选配装与攻略、工具、版本审核与 FAQ。
- 图鉴：966 条官方名录，名字/编号、属性、地区和名录类别筛选，48 条分页，全部独立详情页。Nidoran♀/♂ 使用独立 slug，避免冲突。
- 招式：64 条基础招式，59 条进化，搜索、属性筛选、独立详情与条件说明。
- 攻略：入门、进化、票券、Rift、移动端、成就、合作与 FAQ。
- 排行与配装：明确标为编辑建议；不声称经过 DPS 实测。配装不假设所有伙伴可学所有招式。
- 工具：双属性与天气计算、保底和十连抽卡概率、伙伴兼容的四槽配装与 localStorage v2 保存/恢复。全站搜索在首次打开弹窗时加载本地生成索引，可搜索 1052 个 Pokémon、招式、攻略、配装和专题入口，查询文本不发送至外站。
- `/play`：用户启动后加载 `https://pokesurvivor.com/en/`，支持全屏与官方新标签页回退。游戏账号、联机和云存档均由原站管理。
- 关于、隐私、来源、更新和反馈说明页；没有配置的邮箱不虚构为有效提交渠道。

## 数据与刷新

审核日期：2026-10-15。图鉴、招式、属性分别来自：

- https://pokesurvivor.com/en/pokedex/
- https://pokesurvivor.com/en/moves/
- https://pokesurvivor.com/en/types/
- 玩法核对：https://pokesurvivor.com/en/guide/

执行 `npm run data:refresh` 通过 curl 获取 source-revision.json 所选固定版本的参考 HTML 和源码数据，再依次运行 HTML 与语法树导入。缓存分别在 `.cache/sources/` 和 `.cache/research/`，失败时恢复原数据。离线已有缓存需依次执行 import-official.mjs 和 import-pinned-game.mjs；不能只执行前者丢掉增补字段。刷新后核对人工攻略并运行构建、机制测试与审计。不要直接手改生成 JSON。

伙伴数值、抽卡概率、保底和构建标识现已从固定源码验证。成就专页和源码为 130，旧通用指南的 127 已作为来源差异记录。页面保持事实与编辑意见的区分。

## 图片与字体

装饰画来自用户设计图中的局部场景切片，保存为本地 WebP；并非实时游戏截图。精灵图使用 PokéAPI 的公开 GitHub sprite 集合，运行时需要网络。Pixelify Sans 本地托管，许可证为 SIL OFL。所有外部来源在 `/sources` 中说明。

## SEO 与上线

各页面生成独立标题、描述、canonical、Open Graph 与 Twitter 卡片。首页 WebSite、内容页 BreadcrumbList、攻略 Article 使用 JSON-LD。FAQ 没有假设能获得 Google FAQ 富媒体结果。静态预渲染内容可直接读取，不依赖用户交互才生成页面正文。

复制 `.env.example` 为 `.env.local`，将 `NEXT_PUBLIC_SITE_URL` 设为真实 HTTPS origin（不带末尾斜杠），重新构建。此值控制 metadataBase、canonical、OG URL、sitemap 和 robots。未配置时使用 localhost，robots 默认禁止索引，防止本地地址被误收录。上线前应核对生产环境的 robots、域名、sitemap 及第三方图片可达性。

```powershell
npm install
npm run dev -- --port 3107
npm run typecheck
npm run lint
npm run build
npm run audit
npm run start -- --port 3107
$env:AUDIT_URL = 'http://localhost:3107'
npm run audit
```

本次任务只修改本地项目，没有远程仓库、推送或生产部署授权；未执行这些操作。
