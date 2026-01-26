import json
import sys

try:
    with open('lint.json', 'r', encoding='utf-16') as f:
        data = json.load(f)
except Exception:
    with open('lint.json', 'r', encoding='utf-8') as f:
        data = json.load(f)

for file in data:
    if file['messages']:
        print(f"File: {file['filePath']}")
        for msg in file['messages']:
            print(f"  [{msg.get('severity')}] Line {msg.get('line')}: {msg.get('message')} ({msg.get('ruleId')})")
