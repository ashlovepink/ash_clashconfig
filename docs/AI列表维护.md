# AI列表维护

配置把Google AI、GPT、Claude独立为三个组。config.yaml只引用自动更新的HTTP list，不维护三家的域名或关键词条件。

## 更新链

GitHub Actions的update-ai-lists.yml每天UTC 00:17（北京时间08:17）读取config.yaml中原AI、OpenAi provider的上游地址，运行scripts/update-ai-lists.py。修改更新器、配置或AI-Extra.list后也会触发；支持手动运行。上游下载或格式检查失败、任一产品列表为空时，不替换旧产物。只有产物内容变化才提交，提交范围限于三份生成列表和覆盖报告。

生成文件：

- Rullset/AI-GoogleAI.list
- Rullset/AI-GPT.list
- Rullset/AI-Claude.list
- Rullset/AI-Coverage.json

前三个是classical/text列表，config.yaml按原HTTP provider方式每86400秒拉取。不要手工编辑生成文件：域名来自原上游，匹配方式原样保留。更新器用品牌标记识别归属，不维护另一份网站地址表；新条目归属不明或同时匹配多个品牌时仍留在原AI组。

Rullset/AI-Extra.list保存此前直接写在config.yaml的两条AI补充规则。它是现有规则搬迁，不是新增目的地址。列表引用之间的交集保留原NotebookLM优先级，之后其余补充规则仍进入AI服务。

原AI、OpenAi两个provider保留原URL和更新周期。原AI规则继续兜底；上游新条目在生成或拉取完成前仍进入AI服务，不会因三份产物滞后丢失原有覆盖。原OpenAi规则保留原位置并指向GPT；此前被更早AI规则接管的通用登录等请求仍按原优先级处理。

## 本地验证

```bash
PYTHONDONTWRITEBYTECODE=1 python3 -m unittest discover -s scripts -p test_ai_lists.py
python3 scripts/update-ai-lists.py
```

更新器校验全部原规则都保留，三家子列表和剩余AI规则无遗漏、无重复；覆盖报告记录源摘要、条目数、剩余AI规则与缺失项。未识别为三家的条目留在AI，不等于已经自动判断出未来所有新域名的产品归属。

发布仍按GitHub → Sub-Store → Gist → OpenClash执行。新增工作流只有推送到默认分支后才会启用；仅本地生成和验证不代表线上已生效。
