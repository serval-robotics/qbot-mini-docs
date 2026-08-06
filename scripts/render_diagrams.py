#!/usr/bin/env python3
"""Rasterise the documentation diagrams so they can actually be looked at.

The diagrams are hand-written SVG. Nothing in the build catches a caption that
overflows the viewBox, a label sitting on top of an arrow, or a dark-scheme
colour that disappears into the background — those are only visible in a
rendered image, and a browser is not always available.

Both schemes are produced. Since a rasteriser evaluates no media queries, the
dark variant is made by lifting the rules out of the prefers-color-scheme block
and appending them, where they win on source order.

Not part of the site build, and deliberately not in requirements.txt:

    pip install cairosvg
    python3 scripts/render_diagrams.py [output-directory]
"""

import re
import sys
from pathlib import Path

import cairosvg

SOURCE = Path("docs/assets")
DARK_BACKGROUND = "#0d0e12"
DARK_BLOCK = re.compile(r"@media \(prefers-color-scheme: dark\) \{(.*?)\n    \}\n", re.S)


def dark_variant(svg):
    """Return the SVG with its dark-scheme rules promoted to unconditional."""
    match = DARK_BLOCK.search(svg)
    if not match:
        return None
    return svg.replace(match.group(0), "").replace("</style>", match.group(1) + "\n  </style>")


def main(argv):
    out = Path(argv[0]) if argv else Path("_diagrams")
    out.mkdir(parents=True, exist_ok=True)

    diagrams = sorted(SOURCE.glob("*.svg"))
    if not diagrams:
        print(f"no diagrams in {SOURCE}")
        return 1

    for diagram in diagrams:
        svg = diagram.read_text(encoding="utf-8")
        cairosvg.svg2png(
            bytestring=svg.encode(),
            write_to=str(out / f"{diagram.stem}-light.png"),
            scale=2,
            background_color="white",
        )
        dark = dark_variant(svg)
        if dark:
            cairosvg.svg2png(
                bytestring=dark.encode(),
                write_to=str(out / f"{diagram.stem}-dark.png"),
                scale=2,
                background_color=DARK_BACKGROUND,
            )
        print(f"{diagram.name}: light{' + dark' if dark else ' only'}")

    print(f"\nwritten to {out}/")
    return 0


if __name__ == "__main__":
    sys.exit(main(sys.argv[1:]))
