# Sitemap 与 IndexNow

正常修改页面并部署即可。不需要数据库，也不需要申请、填写 GitHub Secrets 或 Vercel 访问令牌。

## 自动完成的事

1. 构建时比较页面内容：新增页面获得日期，内容变化的页面更新日期，未变化的页面保留上一成功生产版本的日期。纯 CSS、代码格式、版权年份和重复构建不刷新日期。
2. `/sitemap.xml` 收录公开、可索引的规范页面；删除页面自动退出。每项包含 loc、lastmod、changefreq、priority，超过单文件限制自动分片。
3. Vercel 生产部署成功后，现有 GitHub 工作流向 IndexNow 提交新增、修改和删除的 URL。Preview、失败部署、无关项目和过期部署不会提交；本地构建也不会提交。
4. 只有全部批次被 IndexNow 接收后，才保存本次成功记录。提交失败时可重跑工作流，下次成功部署也会补交未确认的变化。

删除事件会随清单持续保留，记录该地址最后一次删除时间。即使某页新增后的通知未完成，下一次部署就删除了它，也会提交删除通知；通知成功后不会重复提交同一次删除。地址恢复后再删除，会产生新的删除事件。

该删除历史依赖按顺序发布的生产版本，适用于现有 Git 生产分支的发布流程。不要将多个独立 CLI 生产部署或历史产物提升交错执行；它们可能同时读取旧清单而漏掉中间版本。若以后需要并行发布，应先统一现有发布队列或保存每次生产发布记录，通知串行本身不能解决这种竞态。

## 为什么还保留一个工作流

Vercel 的 GitHub 集成会自动发送成功部署事件。`.github/workflows/indexnow.yml` 接收事件，使用 GitHub 自动提供的临时权限读取上一次成功运行的产物；无需手动配置 Secret。

记录作为不可覆盖的独立产物保存 90 天，按项目和 production 区分；同项目的通知串行执行，只读取本工作流成功运行的记录。记录过期或被清除时，下次明确执行一次全量补交通知，Sitemap 原有日期仍然保留。

自动事件只接受 GitHub 标识的 `vercel[bot]`，并核对项目、生产环境、正式域名公开清单的 Git SHA 和部署 ID。部署 ID 直接使用 Vercel 自动提供的 `VERCEL_DEPLOYMENT_ID` 写入自己的清单，不再解析 Next.js 首页内部标记。只访问固定的公开正式域名，不使用部署保护绕过凭据。工作流执行自身受信任版本的脚本，不执行事件 payload 指定的提交。

该轻量流程适用于当前公开可访问的正式网站，不涉及受保护 Preview 的访问授权。

## 已准备好的内容

- 正式站点：`https://pokesurvivor.me`，Vercel 项目与 GitHub 仓库已在脚本中指定。
- IndexNow 公开验证 key 位于 `src/data/seo/indexnow.json`，对应验证文件在 `public/` 根目录，随网站一起发布。无需 Bing API key。
- 统一内容清单位于 `/.well-known/seo-url-manifest.json`，用于下一次构建继承日期；成功通知记录单独保存，二者不混用。
- 当前 21 个页面来自静态 TDK、已发布 Guides 与 FAQ。排除已删除页面、重定向来源、游戏详情、筛选参数、草稿和 noindex 页面。
- 首次迁移继承与已上线提交 `5e7da84` 核对过的历史日期；首次通知覆盖当前可索引页面与已知历史删除地址。清单、图片、正文、TDK 和相关共享内容共同参与变化判断。

代码需要进入 GitHub 默认分支，正式部署后工作流才会生效；正式环境保留已有 `SITE_INDEXABLE=true` 和 Vercel 系统变量即可，没有本次新增的环境变量。

在 Actions 的 **Notify IndexNow after production deployment** 中选择 **Run workflow**，可以无参数重试当前线上版本。`200`、`202` 仅代表 IndexNow 已接收，不代表已经抓取或收录。

## 本地验证

```powershell
$env:SITE_INDEXABLE='true'
npm run build
npm run typecheck
npm run lint
npm run test:seo
npm run content:check
```

这些命令不启动服务器、不部署，也不发送真实 IndexNow 通知。单元测试使用模拟请求。`npm run content:sync` 可手动刷新本地产物，正常构建也会自动生成。

回滚内容时重新构建目标提交，让页面日期保持前进；直接提升带旧日期的历史部署会被陈旧清单检查拒绝。
