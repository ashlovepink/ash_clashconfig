const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const source = fs.readFileSync(__dirname + '/traffic-saving.js', 'utf8');
// JSON is a YAML subset; live Sub-Store previews cover the actual YAML parser.
const context = vm.createContext({ yaml: {
  safeLoad: text => JSON.parse(text.replace(/^#.*\n/, '')),
  safeDump: JSON.stringify
} });
vm.runInContext(source, context);
const name = '💸 流量节省';
function run(names, extra = {}) {
  const cfg = { proxies: names.map(name => ({ name, type: 'socks5' })),
    'proxy-groups': [{ name, type: 'fallback', filter: '(?i)\\[0\\.(?:[0-4][0-9]*|50*)x\\]', proxies: ['REJECT'], ...extra }] };
  const input = { $content: '# subscription-userinfo: upload=1; download=2; total=3\n' + JSON.stringify(cfg), $options: { marker: 1 } };
  return context.operator(input);
}
test('numeric order, threshold, unknown and ambiguous names, stable ties', () => {
  const names = ['A [0.5x]', 'B [0.2x]', 'C [0.1x]', 'D [0.5x]', 'E [0.6x]', 'unknown', 'boundary [0.5001x]', 'ambiguous [0.1x] [2x]'];
  const out = run(names, { 'include-all': true });
  const cfg = JSON.parse(out.$content.split('\n').slice(1).join('\n'));
  assert.deepEqual(cfg['proxy-groups'][0].proxies, ['C [0.1x]', 'B [0.2x]', 'A [0.5x]', 'D [0.5x]']);
  assert.deepEqual(cfg.proxies.map(n => n.name), names);
  assert.equal(cfg['proxy-groups'][0]['include-all'], undefined);
  assert.ok(out.$content.startsWith('# subscription-userinfo: upload=1; download=2; total=3\n'));
  assert.equal(out.$options.marker, 1);
  assert.equal(context.operator(out).$content, out.$content);
});
test('new fractional rate enters correct position automatically', () => {
  const cfg = JSON.parse(run(['A [0.5x]', 'new [0.15x]', 'B [0.1x]']).$content.split('\n').slice(1).join('\n'));
  assert.deepEqual(cfg['proxy-groups'][0].proxies, ['B [0.1x]', 'new [0.15x]', 'A [0.5x]']);
});
test('no eligible nodes rejects without routing through a higher multiplier', () => {
  const cfg = JSON.parse(run(['A [1x]', 'unmarked']).$content.split('\n').slice(1).join('\n'));
  assert.deepEqual(cfg['proxy-groups'][0].proxies, ['REJECT']);
});
