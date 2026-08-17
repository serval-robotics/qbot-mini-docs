# Q-Bot Mini — documentation

Source for the public Q-Bot Mini documentation site, published by
[Serval Robotics](https://servalrobotics.com).

This repository holds documentation only. It contains no robot source code, and
nothing describing how the control algorithms work internally: the site
publishes interfaces, effects and measured figures, and marks the rest
*proprietary*. Anything committed here is public permanently, including in the
history — so it does not go in unless it is meant to be read by anyone.

## Building it

```bash
python3 -m venv .venv
.venv/bin/pip install -r requirements.txt
.venv/bin/mkdocs serve      # live preview on 127.0.0.1:8000
.venv/bin/mkdocs build --strict
```

`--strict` turns a broken internal link into a failed build.

## Figures and the Basis column

Specification tables carry a third column stating how each figure was obtained.
Exactly five values are legal:

| Basis | Meaning |
| :- | :- |
| `Measured` | Taken from the physical robot |
| `Vendor specification` | From a component datasheet — someone else's measurement |
| `Design target` | Intended, not yet confirmed |
| `Simulated` | From the simulation model |
| `Not yet characterized` | Unknown; the value column reads `—` |

Any of them may carry a qualifier after an em dash, e.g.
`Measured — trot, flat floor`.

```bash
python3 scripts/docs_gaps.py docs
```

lists every figure still uncharacterised, and fails if a `Basis` value is not
one of the five. No figure is ever invented; unknown means `Not yet
characterized`.

## Publishing

The site is built by GitHub Actions and served from GitHub Pages
(`.github/workflows/pages.yml`). It is `noindex` and not yet on a custom
domain.

