import os
import re

for root, dirs, files in os.walk('src'):
    for file in files:
        if file.endswith('.jsx') or file.endswith('.js'):
            path = os.path.join(root, file)
            with open(path, 'r', encoding='utf-8') as f:
                content = f.read()
                # Find (e) => or e =>
                matches = re.finditer(r'\(?e\)?\s*=>', content)
                for match in matches:
                    line_no = content.count('\n', 0, match.start()) + 1
                    # Extract the body of the arrow function (simple heuristic)
                    body_start = match.end()
                    # Just check if 'e.' or 'e ' or 'e,' or 'e)' or 'e;' appears after the arrow
                    # This is very rough but might find some.
                    # Better: check the next few characters for usage.
                    pass

print("Done")
