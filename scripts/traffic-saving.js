// Sub-Store file operator: order the final nodes numerically for Mihomo fallback.
// Run after node import; group.filter in config.yaml remains the eligibility rule.
function operator(input) {
  const content = input.$content || '{}';
  const configuration = yaml.safeLoad(content) || {};
  const group = (configuration['proxy-groups'] || []).find(g => g.name === '💸 流量节省');
  if (!group) return input;
  if (group.type !== 'fallback' || !group.filter) {
    throw new Error('流量节省需要 fallback 类型和倍率筛选条件');
  }
  const pattern = group.filter.replace(/^\(\?i\)/, '');
  const filter = new RegExp(pattern, group.filter.startsWith('(?i)') ? 'i' : '');
  const members = (configuration.proxies || []).flatMap((node, index) => {
    if (!filter.test(node.name || '')) return [];
    const rates = [...node.name.matchAll(/\[([0-9]+(?:\.[0-9]+)?)x\]/gi)];
    if (rates.length !== 1) return [];
    return [{ name: node.name, rate: Number(rates[0][1]), index }];
  }).sort((a, b) => a.rate - b.rate || a.index - b.index);
  group.proxies = members.length ? members.map(node => node.name) : ['REJECT'];
  // Explicit order is essential: include-all would reintroduce name-based sorting.
  delete group['include-all'];
  delete group['include-all-proxies'];
  delete group['include-all-providers'];
  delete group.use;
  const flowComment = content.match(/^# subscription-userinfo: [^\r\n]*\r?\n/);
  input.$content = (flowComment ? flowComment[0] : '') + yaml.safeDump(configuration);
  return input;
}
