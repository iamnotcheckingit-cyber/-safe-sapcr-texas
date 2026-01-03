import os
import re

# Define the new navigation HTML
NEW_NAV = '''<ul id="navMenu">
                <li><a href="/#problem">The Problem</a></li>
                <li><a href="/legislation">Legislation</a></li>
                <li><a href="/legislators">Legislators</a></li>
                <li><a href="/case-study">Case Study</a></li>
                <li><a href="/stories">Stories</a></li>
                <li><a href="/resources">Resources</a></li>
                <li><a href="/petition">Petition</a></li>
                <li><a href="/membership">Join</a></li>
            </ul>'''

# Files to update
files = [
    'index.html',
    'legislation.html',
    'legislators.html',
    'membership.html',
    'other-states.html',
    'stories.html',
    'news.html',
    'faq.html',
    'glossary.html',
    'templates.html',
    'petition.html',
    'calendar.html',
    'media.html',
    'resources.html',
    'case-study.html'
]

# State pages
state_files = [f for f in os.listdir('states') if f.endswith('.html')] if os.path.exists('states') else []

for state_file in state_files:
    files.append(f'states/{state_file}')

# Update each file
for filename in files:
    filepath = os.path.join(os.getcwd(), filename)
    if not os.path.exists(filepath):
        print(f"Skipping {filename} - not found")
        continue

    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()

    # Find and replace the navMenu ul
    pattern = r'<ul id="navMenu">[\s\S]*?</ul>'

    if re.search(pattern, content):
        new_content = re.sub(pattern, NEW_NAV, content)

        with open(filepath, 'w', encoding='utf-8') as f:
            f.write(new_content)
        print(f"Updated {filename}")
    else:
        print(f"No navMenu found in {filename}")

print("\nNavigation update complete!")
