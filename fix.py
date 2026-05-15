import re

files = ['wedding.html','birthday.html','cards.html','events.html','party.html']

for fname in files:
    with open(fname,'r', encoding='utf-8') as f:
        content = f.read()
    
    def encode_img(m):
        url = m.group(1)
        encoded = url.replace('&','%26')
        return f'href="view.html?img={encoded}"'
    
    fixed = re.sub(r'href="view\.html\?img=([^"]+)"', encode_img, content)
    
    with open(fname,'w', encoding='utf-8') as f:
        f.write(fixed)
    print(f'Fixed {fname}')

print('All done!')
