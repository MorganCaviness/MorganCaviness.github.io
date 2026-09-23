import re, html
from pathlib import Path
p = Path(r'C:\Users\Morga\Downloads\CHRIS PROCK - Talents & Ikiai.html')
text = p.read_text(encoding='utf-8', errors='ignore')
imgs = re.findall(r'<img[^>]+(?:src|data-src)=["\']([^"\']+)["\']', text, re.I)
print('IMG COUNT', len(imgs))
print('\n'.join(imgs[:20]))
print('--- HEADINGS ---')
for m in re.finditer(r'<h([1-4])[^>]*>(.*?)</h\1>', text, re.I | re.S):
    s = html.unescape(re.sub(r'<[^>]+>', ' ', m.group(2))).strip()
    if s:
        print(s)
print('--- TEXT SNIPPETS ---')
seen = []
for m in re.finditer(r'>([^<>]{3,120})<', text):
    s = html.unescape(re.sub(r'\s+', ' ', m.group(1))).strip()
    if s and s not in seen and len(s) > 2:
        seen.append(s)
print('\n'.join(seen[:200]))
