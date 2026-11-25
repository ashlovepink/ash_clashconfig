import importlib.util
from pathlib import Path
import unittest
import subprocess
import sys
import tempfile

spec = importlib.util.spec_from_file_location('ai_lists', Path(__file__).with_name('update-ai-lists.py'))
ai = importlib.util.module_from_spec(spec)
spec.loader.exec_module(ai)


class ListUpdateTests(unittest.TestCase):
    def test_new_upstream_entries_are_partitioned_without_changing_match_types(self):
        original = ai.parse_rules('DOMAIN-KEYWORD,openai\nDOMAIN-SUFFIX,new.claude.example\nDOMAIN,new.google.example\nDOMAIN,new.other.example\nDOMAIN-SUFFIX,anyrouter.example\n')
        groups = ai.split_rules(original)
        self.assertEqual(groups['GPT'], ['DOMAIN-KEYWORD,openai'])
        self.assertEqual(groups['Claude'], ['DOMAIN-SUFFIX,new.claude.example'])
        self.assertEqual(groups['GoogleAI'], ['DOMAIN,new.google.example'])
        self.assertEqual(groups['AI'], ['DOMAIN,new.other.example'])
        self.assertEqual(groups['AnyRouter'], ['DOMAIN-SUFFIX,anyrouter.example'])
        self.assertEqual(set(sum(groups.values(), [])), set(original))

    def test_ambiguous_entry_stays_in_AI(self):
        self.assertEqual(ai.product('DOMAIN,claude-openai.example'), 'AI')

    def test_invalid_or_empty_upstream_is_rejected(self):
        for source in ['', '# empty', '<html>error</html>', 'DOMAIN-SUFFIX,', 'UNKNOWN,new.example', 'DOMAIN,a.example,unexpected']:
            with self.subTest(source=source), self.assertRaises(ValueError):
                ai.parse_rules(source)

    def test_missing_product_refuses_to_publish_empty_list(self):
        with self.assertRaises(ValueError):
            ai.split_rules(['DOMAIN,new.google.example'])

    def test_existing_provider_URL_is_read_from_config(self):
        self.assertEqual(ai.source_url('rule-providers:\n  AI:\n    url: https://example.test/AI.list\n    type: http\n  GPT:\n    url: https://example.test/GPT.list\n', 'AI'), 'https://example.test/AI.list')

    def test_failed_refresh_does_not_replace_existing_lists(self):
        with tempfile.TemporaryDirectory() as directory:
            root = Path(directory)
            target = root / 'Rullset'
            target.mkdir()
            names = ['AI-GoogleAI.list', 'AI-GPT.list', 'AI-Claude.list', 'AI-AnyRouter.list', 'AI-Coverage.json']
            for name in names:
                (target / name).write_text('last valid output')
            upstream = root / 'bad-upstream.txt'
            upstream.write_text('<html>upstream error</html>')
            legacy = root / 'legacy.txt'
            legacy.write_text('DOMAIN-KEYWORD,openai\n')
            result = subprocess.run([sys.executable, str(Path(__file__).with_name('update-ai-lists.py')),
                                     '--source-file', str(upstream), '--openai-file', str(legacy),
                                     '--output-root', str(root)], capture_output=True)
            self.assertNotEqual(result.returncode, 0)
            for name in names:
                self.assertEqual((target / name).read_text(), 'last valid output')


if __name__ == '__main__':
    unittest.main()
