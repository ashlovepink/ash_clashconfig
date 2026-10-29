// Sub-Store file operator. Rules/DNS remain in the GitHub YAML template.
// Keep the last published node definitions when an upstream returns no nodes.
async function operator(input) {
  const { sourceType = 'collection', sourceName } = $arguments;
  if (sourceType !== 'collection' || !sourceName) {
    throw new Error('节点加工需要指定一个订阅合集');
  }
  const key = `ash_node_cache_v1:${sourceType}:${sourceName}`;
  const configuration = yaml.safeLoad(input.$content || '{}') || {};
  let nodes;
  try {
    nodes = await produceArtifact({
      type: sourceType, name: sourceName, platform: 'mihomo',
      produceType: 'internal', $options: input.$options,
      produceOpts: { 'delete-underscore-fields': true, 'include-unsupported-proxy': false }
    });
  } catch (_error) {
    nodes = [];
  }
  let nodeSource = 'upstream';
  if (Array.isArray(nodes) && nodes.length && nodes.every(node => node.name && node.type)) {
    $substore.write({ schema: 1, sourceType, sourceName,
      updatedAt: new Date().toISOString(), proxies: nodes }, key);
  } else {
    const cached = $substore.read(key);
    if (cached?.schema !== 1 || cached.sourceName !== sourceName ||
        cached.sourceType !== sourceType || !Array.isArray(cached.proxies) ||
        !cached.proxies.length || !cached.proxies.every(node => node.name && node.type)) {
      throw new Error('上游没有有效节点，也没有此前的节点定义，拒绝发布空节点配置');
    }
    nodes = cached.proxies;
    nodeSource = 'last-known';
    $substore.warn(`合集 ${sourceName} 未返回有效节点，保留上次 ${nodes.length} 个节点定义；这不代表机场恢复可用`);
  }
  const seen = new Set();
  configuration.proxies = [...nodes, ...(configuration.proxies || [])].filter(node => {
    if (seen.has(node.name)) return false;
    seen.add(node.name);
    return true;
  });
  input.$content = yaml.safeDump(configuration);
  const collection = ($substore.read('collections') || []).find(item => item.name === sourceName);
  const flow = collection?.subUserinfo;
  const validFlow = typeof flow === 'string' &&
    /^upload=\d+; download=\d+; total=\d+(; expire=\d+)?$/.test(flow);
  if (validFlow) input.$content = `# subscription-userinfo: ${flow}\n` + input.$content;
  else $substore.warn(`合集 ${sourceName} 暂无有效流量读数；不阻断规则更新，也不伪造零值`);
  if (input.$options) {
    input.$options._res = input.$options._res || {};
    input.$options._res.headers = {
      ...(input.$options._res.headers || {}),
      'x-sub-store-node-source': nodeSource,
      ...(validFlow ? { 'subscription-userinfo': flow } : {})
    };
  }
  return input;
}
