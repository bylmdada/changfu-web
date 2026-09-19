"""Offline readiness checks against shipped HTML, not a search ranking score."""
from html.parser import HTMLParser
from pathlib import Path
from urllib.parse import urlsplit, unquote
from urllib.robotparser import RobotFileParser
import json
import subprocess
import xml.etree.ElementTree as ET

ROOT = Path(__file__).resolve().parents[1]

class Page(HTMLParser):
    def __init__(self, html):
        super().__init__()
        self.ids, self.links, self.schemas, self.text = [], [], [], []
        self.script = None
        self.buffer = []
        self.h1 = self.main = 0
        self.canonical = None
        self.feed(html)

    def handle_starttag(self, tag, attrs):
        attrs = dict(attrs)
        if 'id' in attrs:
            self.ids.append(attrs['id'])
        if tag == 'a' and 'href' in attrs:
            self.links.append(attrs['href'])
        if tag == 'h1':
            self.h1 += 1
        if tag == 'main':
            self.main += 1
        if tag == 'link' and attrs.get('rel') == 'canonical':
            self.canonical = attrs['href']
        if tag == 'meta' and attrs.get('name', '').lower() == 'robots':
            assert 'noindex' not in attrs.get('content', '').lower()
        if tag in ('script', 'style'):
            self.script = attrs.get('type', tag)
            self.buffer = []

    def handle_data(self, value):
        (self.buffer if self.script else self.text).append(value)

    def handle_endtag(self, tag):
        if tag in ('script', 'style'):
            if self.script == 'application/ld+json':
                data = json.loads(''.join(self.buffer))
                self.schemas.extend(data if isinstance(data, list) else [data])
            self.script = None

subprocess.run(['node', 'scripts/sync-search-content.cjs', '--check'], cwd=ROOT, check=True)
pages = {p.name: Page(p.read_text()) for p in ROOT.glob('*.html')}
faq_count = 0
for name, page in pages.items():
    assert page.h1 == 1, (name, 'H1 count')
    assert len(page.ids) == len(set(page.ids)), (name, 'duplicate IDs')
    assert page.canonical == 'https://www.changfu.me/' + ('' if name == 'index.html' else name)
    for schema in page.schemas:
        if schema.get('@type') == 'FAQPage':
            text = ''.join(page.text)
            for question in schema['mainEntity']:
                assert question['name'] in text, (name, 'invisible question')
                assert question['acceptedAnswer']['text'] in text, (name, 'invisible answer')
                faq_count += 1
    for href in page.links:
        url = urlsplit(href)
        if url.netloc and url.netloc != 'www.changfu.me' or url.scheme not in ('', 'https', 'http'):
            continue
        target = unquote(url.path).lstrip('/')
        target = ('index.html' if target in ('/', './') else target) or name
        if target not in pages:
            assert (ROOT / target).exists(), (name, href)
        elif url.fragment:
            assert unquote(url.fragment) in pages[target].ids, (name, href)

for name in ['index.html', 'services.html', 'about.html', 'contact.html']:
    assert pages[name].main == 1, (name, 'main landmark')
data = json.loads((ROOT / 'data/site-data.json').read_text())
for name in ['index.html', 'contact.html']:
    text = ''.join(pages[name].text)
    for location in data['serviceLocations']:
        assert location['name'] in text and location['address'] in text and location['phone'] in text
assert faq_count == 10
robot = RobotFileParser()
robot.parse((ROOT / 'robots.txt').read_text().splitlines())
urls = [node.text for node in ET.parse(ROOT / 'sitemap.xml').iter('{http://www.sitemaps.org/schemas/sitemap/0.9}loc')]
for url in urls:
    assert (ROOT / (urlsplit(url).path.lstrip('/') or 'index.html')).is_file()
    for agent in ['OAI-SearchBot', 'ChatGPT-User', 'PerplexityBot', 'Perplexity-User', 'Googlebot', 'bingbot']:
        assert robot.can_fetch(agent, url), (agent, url)
for file in ['llms.txt', 'llms-full.txt']:
    text = (ROOT / file).read_text()
    assert data['organization']['email'] in text
    assert 'contact@changfu.org.tw' not in text and '03-9328822' not in text
print(f'PASS: {len(pages)} pages, {faq_count} visible schema-matched answers, 7 static locations, local links, {len(urls)} sitemap URLs and 6 agent policies.')
