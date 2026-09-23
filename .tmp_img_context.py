import re, html
from pathlib import Path
p = Path(r'C:\Users\Morga\Downloads\CHRIS PROCK - Talents & Ikiai.html')
text = p.read_text(encoding='utf-8', errors='ignore')
for idx, m in enumerate(re.finditer(r'<img[^>]+(?:src|data-src)=["\']([^"\']+)["\']', text, re.I), 1):
    start = max(0, m.start()-400)
    end = min(len(text), m.end()+800)
    snippet = text[start:end]
    print(f'--- IMG {idx} ---')
    print(snippet[:2000])
    print()
