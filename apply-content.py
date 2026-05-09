#!/usr/bin/env python3
"""Replace content between HTML comment markers in site files.

Markers in source files look like:
    <!-- SECTION:hero-start -->
    ...existing content...
    <!-- SECTION:hero-end -->

content-updates.json schema:
{
  "index.html": {
    "hero": "<h1>New headline</h1><p>New body...</p>"
  }
}
"""
import json
import re
import sys
from pathlib import Path


def apply(path: Path, sections: dict) -> bool:
    text = path.read_text(encoding="utf-8")
    original = text
    for section_id, new_content in sections.items():
        pattern = re.compile(
            rf"(<!--\s*SECTION:{re.escape(section_id)}-start\s*-->)"
            rf".*?"
            rf"(<!--\s*SECTION:{re.escape(section_id)}-end\s*-->)",
            re.DOTALL,
        )
        if not pattern.search(text):
            print(f"  WARN: marker SECTION:{section_id} not found in {path}", file=sys.stderr)
            continue
        replacement = rf"\1\n{new_content}\n\2"
        text = pattern.sub(replacement, text)
        print(f"  updated: {path} :: {section_id}")
    if text != original:
        path.write_text(text, encoding="utf-8")
        return True
    return False


def main() -> None:
    if len(sys.argv) != 2:
        sys.exit("Usage: apply-content.py <content-updates.json>")
    config = json.loads(Path(sys.argv[1]).read_text(encoding="utf-8"))
    changed = 0
    for rel_path, sections in config.items():
        path = Path(rel_path)
        if not path.exists():
            print(f"  SKIP: {path} does not exist", file=sys.stderr)
            continue
        if apply(path, sections):
            changed += 1
    print(f"==> {changed} file(s) updated")


if __name__ == "__main__":
    main()
