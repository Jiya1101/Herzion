import os
import glob

def add_inbox_link():
    files = glob.glob('*.html')
    for f in files:
        if f == 'login.html': continue
        with open(f, 'r', encoding='utf-8') as file:
            content = file.read()
        
        # Check if already added
        if 'href="inbox.html"' in content:
            continue
            
        # We look for the closing </ul> of .nav__links
        # It usually is preceded by an <li>
        # A simpler way is to find '<ul class="nav__links">' and the next '</ul>' and insert just before '</ul>'
        start_idx = content.find('<ul class="nav__links">')
        if start_idx != -1:
            end_idx = content.find('</ul>', start_idx)
            if end_idx != -1:
                # insert before end_idx
                injection = '    <li><a href="inbox.html">Inbox</a></li>\n        '
                new_content = content[:end_idx] + injection + content[end_idx:]
                with open(f, 'w', encoding='utf-8') as file:
                    file.write(new_content)
                print(f"Updated {f}")

if __name__ == '__main__':
    add_inbox_link()
