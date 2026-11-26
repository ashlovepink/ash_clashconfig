# AI列表维护

配置把Google、OpenAI、Anthropic、AnyRouter独立为四个服务组。config.yaml只引用自动更新的HTTP list，不维护这些服务的域名或关键词条件。

## 更新链

GitHub Actions的update-ai-lists.yml每天UTC 00:17（北京时间08:17）读取config.yaml中原AI、OpenAi provider的上游地址，运行scripts/update-ai-lists.py。修改更新器、配置或AI-Extra.list后也会触发；支持手动运行。上游下载或格式检查失败、任一产品列表为空时，不替换旧产物。只有产物内容变化才提交，提交范围限于四份生成列表和覆盖报告。

生成文件：

- Rullset/AI-GoogleAI.list
- Rullset/AI-GPT.list
- Rullset/AI-Claude.list
- Rullset/AI-AnyRouter.list
- Rullset/AI-Coverage.json

前四个是classical/text列表，config.yaml按原HTTP provider方式每86400秒拉取。不要手工编辑生成文件：域名来自原上游，匹配方式原样保留。更新器用品牌标记识别归属，不维护另一份网站地址表；新条目归属不明或同时匹配多个品牌时仍留在原AI组。

Rullset/AI-Extra.list保存此前直接写在config.yaml的两条AI补充规则。它是现有规则搬迁，不是新增目的地址。列表引用之间的交集保留原NotebookLM优先级，AnyRouter子列表在AIExtra兜底之前匹配并进入独立组，其余补充规则仍进入AI服务。

原AI、OpenAi两个provider保留原URL和更新周期。原AI规则继续兜底；上游新条目在生成或拉取完成前仍进入AI服务，不会因生成产物滞后丢失原有覆盖。原OpenAi规则保留原位置并指向GPT；此前被更早AI规则接管的通用登录等请求仍按原优先级处理。

## 本地验证

```bash
PYTHONDONTWRITEBYTECODE=1 python3 -m unittest discover -s scripts -p test_ai_lists.py
python3 scripts/update-ai-lists.py
```

更新器校验全部原规则都保留，四个子列表和剩余AI规则无遗漏、无重复；覆盖报告记录源摘要、条目数、剩余AI规则与缺失项。未识别为上述服务的条目留在AI，不等于已经自动判断出未来所有新域名的产品归属。

发布仍按GitHub → Sub-Store → Gist → OpenClash执行。新增工作流只有推送到默认分支后才会启用；仅本地生成和验证不代表线上已生效。

## AnyRouter与分组顺序

AnyRouter复用同一生成器，从原AI上游和AI-Extra.list中识别anyrouter品牌条目；现有anyrouter.top规则保留DOMAIN-SUFFIX匹配方式，覆盖主站与子域名。没有新增网站清单，也不把域名写回config.yaml。原补充规则保留作兜底，独立AnyRouter规则放在它前面。

AnyRouter组默认跟随节点选择；节点选择第一项为流量节省，仍按≤0.5倍候选倍率升序自动故障切换。独立服务组排在前面，流量节省、手动切换、自动选择等辅助组排在服务组后面，接各国家测速组。Google仍默认美国，其他服务原默认不变。

## Google统一服务组（2026-11-26）

UI统一为🌐 Google、🤖 OpenAI、🧠 Anthropic；内部AI-GoogleAI/GPT/Claude列表及provider键保留兼容，AI覆盖不缩小。Google AI的原16条仍较早进入Google组；普通Google使用同一更新器从ACL4SSR官方Google.list派生Google-Services.list，保留原域名匹配类型，剔除GVT下载CDN和纯IP归属规则。原谷歌FCM独立组移除，FCM规则转到Google组。默认美国。

Google-Services新增规则位于既有视频、下载、GoogleCN直连规则后面，并排除GooglePlay、GoogleDownloads、Download列表命中，保留已有下载/视频策略，而不是强制所有Google域名去美国。GooglePlay直接引用已有MetaCubeX体系的google-play自动更新列表；Google-Downloads.list从ACL4SSR Google的GVT条目与MetaCubeX google-cn上游中的dl/download/update/tools/cache.pack下载更新条目自动派生。下载旁路的含义是继续执行原规则，既可仍直连，也可仍走节点选择，并非统一改成直连。

同一次日更生成Google-Services.list、Google-Downloads.list、Google-Coverage.json。上游下载、解析和覆盖检查全部成功后才替换生成文件。共享域名上的业务和下载不能单凭域名严格区分，下载保持范围以这些列表和现有下载规则为准；未加入网页路径或手写完整域名表。
