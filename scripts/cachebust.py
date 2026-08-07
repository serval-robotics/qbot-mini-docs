"""Stamp the stylesheet and the logo with a hash of their own contents.

GitHub Pages serves both under a fixed name with `max-age=600`, so a browser
that has seen the site keeps the old copy for ten minutes after a deploy. The
page is new, the design is not, and the only cure a reader knows is a hard
refresh they have no reason to think of.

A hash in the query string makes the URL change whenever the file does, so a
new deploy is a new resource and the cache is bypassed exactly when it should
be. Files whose contents are unchanged keep their URL and stay cached.
"""

from hashlib import sha256
from pathlib import Path


def _stamp(docs_dir: str, path: str) -> str:
    """Append a short content hash to path, or return it unchanged if missing."""
    source = Path(docs_dir) / path.split("?")[0]
    if not source.is_file():
        return path
    digest = sha256(source.read_bytes()).hexdigest()[:8]
    return f"{path.split('?')[0]}?h={digest}"


def on_config(config, **kwargs):
    docs_dir = config["docs_dir"]

    config["extra_css"] = [_stamp(docs_dir, css) for css in config["extra_css"]]
    config["extra_javascript"] = [
        _stamp(docs_dir, js) if isinstance(js, str) else js
        for js in config["extra_javascript"]
    ]

    for key in ("logo", "favicon"):
        if config["theme"].get(key):
            config["theme"][key] = _stamp(docs_dir, config["theme"][key])

    return config
