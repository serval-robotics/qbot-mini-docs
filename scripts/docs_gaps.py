#!/usr/bin/env python3
"""Scan published documentation for unfilled and illegal Basis entries.

Specification tables in the public site carry a third column stating how each
figure was obtained. Exactly four values are legal; anything else is a rule
violation rather than an omission, so the two are reported separately and only
violations fail the build.
"""

import sys
from dataclasses import dataclass
from pathlib import Path

LEGAL = (
    "Measured",
    "Vendor specification",
    "Design target",
    "Simulated",
    "Not yet characterized",
)
GAP = "Not yet characterized"


@dataclass(frozen=True)
class Finding:
    path: str
    line: int
    parameter: str
    value: str


def _cells(line):
    """Split a markdown table row into trimmed cells, or return None."""
    stripped = line.strip()
    if not stripped.startswith("|") or not stripped.endswith("|"):
        return None
    return [cell.strip() for cell in stripped[1:-1].split("|")]


def _is_legal(value):
    for legal in LEGAL:
        if value == legal or value.startswith(legal + " — "):
            return True
    return False


def scan(text, path):
    """Return (gaps, violations) for one document's Basis tables."""
    gaps, violations = [], []
    in_basis_table = False

    for number, line in enumerate(text.splitlines(), start=1):
        cells = _cells(line)
        if cells is None:
            in_basis_table = False
            continue
        if cells[-1] == "Basis":
            in_basis_table = True
            continue
        if not in_basis_table:
            continue
        if all(set(cell) <= set(":- ") for cell in cells):
            continue

        parameter, value = cells[0], cells[-1]
        if value == GAP:
            gaps.append(Finding(path, number, parameter, value))
        elif not _is_legal(value):
            violations.append(Finding(path, number, parameter, value))

    return gaps, violations


def main(argv):
    root = Path(argv[0]) if argv else Path("docs")
    gaps, violations = [], []

    for document in sorted(root.rglob("*.md")):
        found_gaps, found_violations = scan(
            document.read_text(encoding="utf-8"), str(document.relative_to(root))
        )
        gaps.extend(found_gaps)
        violations.extend(found_violations)

    if gaps:
        print(f"{len(gaps)} figure(s) not yet characterized:")
        for gap in gaps:
            print(f"  {gap.path}:{gap.line}  {gap.parameter}")
    else:
        print("every documented figure has a basis.")

    if violations:
        print(
            f"\n{len(violations)} illegal Basis value(s) — "
            f"legal values are {', '.join(LEGAL)}:"
        )
        for violation in violations:
            print(
                f"  {violation.path}:{violation.line}  "
                f"{violation.parameter}: {violation.value!r}"
            )
        return 1

    return 0


if __name__ == "__main__":
    sys.exit(main(sys.argv[1:]))
