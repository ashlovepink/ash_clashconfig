# Pinkuni 全域名直连设计

## 目标

让 `pinkuni.asia` 根域名及其所有子域名通过现有直连规则集，不再消耗代理订阅流量。

## 变更范围

只在 `Rullset/direct.list` 增加一条规则：

```text
DOMAIN-SUFFIX,pinkuni.asia
```

不新增 rule-provider、策略组或内联规则，也不修改 iStoreOS 上的运行时配置。

## 路由结果

该规则由现有 `direct` rule-provider 加载，并交给 `🎯 全球直连` 策略组处理。规则同时覆盖 `pinkuni.asia`、`api.pinkuni.asia`、`codeg.pinkuni.asia` 及其他子域名。

## 验证

- 确认仓库中不存在重复的 Pinkuni 规则。
- 检查规则列表语法和 YAML 可解析性。
- 运行 `git diff --check`。
- 提交并推送后确认本地与 `origin/main` 一致。

## 风险与回滚

直连链路不可达时，相关 Pinkuni API 会连接失败。回滚方式是删除该规则并重新提交、推送；无需修改其他分流结构。
