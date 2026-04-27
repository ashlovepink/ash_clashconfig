# AGENTS.md

先读 `SKILL.md`，再修改 Clash 配置。

| 任务 | 必读 | 执行方式 |
|---|---|---|
| 修改 `config.yaml` 中的策略组 / provider / 规则顺序 | `SKILL.md` + `config.yaml` | 保持现有命名和语义，避免无关重排 |
| 修改自定义规则列表 | `SKILL.md` + 对应 `Rullset/*.list` + `config.yaml` | 同步规则文件、provider、rules 三处 |
| 评估优化空间 | `SKILL.md` + `config.yaml` + `Rullset/` | 先做低风险维护性优化，再考虑结构重构 |

同一会话中的新任务也要重读 `SKILL.md`，不要靠残留记忆继续改。
