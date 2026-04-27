---
name: ash-clash-config
description: >
  This skill should be used when the user asks to "修改 Clash 配置",
  "调整 proxy-groups", "新增 rule-providers", "新增规则分流",
  "优化 ash clash config", or "修改 Rullset".
  Activate when the task touches `config.yaml`, `Rullset/*.list`,
  Clash routing rules, provider wiring, or service-specific proxy selection.
---

# Ash Clash Config

管理 `E:\ASH_CODING\ash_clashconfig` 中的 Clash 配置与自定义规则。

## Always Read

1. `config.yaml`
2. `Rullset/`

## Common Tasks

- 修改或新增某个服务的自定义分流规则 -> 先改对应 `Rullset/*.list`，再同步 `config.yaml` 里的 `rule-providers` 和 `rules`
- 调整策略组、地区优先级或兜底顺序 -> 只改 `config.yaml` 的 `proxy-groups`，保持现有命名和语义稳定
- 新增规则提供器或新的规则入口 -> 同步更新 `rule-providers` + `rules`；只有在确实需要单独可选策略时才新增 `proxy-groups`
- 审查优化空间 -> 优先做低风险可维护性优化，避免无证据的大规模重排
- 其他未列任务 -> 最小化修改范围，不碰 `BAK/`，除非用户明确要求

## Known Gotchas

- 仓库里的自定义源文件放在 `Rullset/`，但 `config.yaml` 里 provider 的本地缓存路径写的是 `./ruleset/`；不要随意统一命名，先确认运行端依赖
- 新增一个自定义规则通常需要同时改三处：`Rullset/*.list`、`rule-providers`、`rules`
- `BAK/` 是历史备份，不是当前生效配置源

## Boundaries

- 这个仓库只负责 Clash 配置和自定义规则列表
- 默认不处理运行时客户端报错、订阅转换、测速或外部节点健康问题，除非用户明确要求
