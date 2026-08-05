"""Tests for the published-docs Basis-column scanner.

Runs on the standard library alone, like sim_isaac/test_twin_pure.py.
"""

import docs_gaps


TABLE = """\
| Parameter | Value | Basis |
| :- | :- | :- |
| Mass | 4.2 kg | Measured |
| Max forward speed | 0.22 m/s | Measured — trot, flat floor |
| Runtime | 1.5 h | Design target |
| Contact model | — | Simulated |
| Payload | — | Not yet characterized |
"""


def test_unfilled_entries_are_reported_as_gaps():
    gaps, violations = docs_gaps.scan(TABLE, "product/specifications.md")
    assert [g.parameter for g in gaps] == ["Payload"]
    assert violations == []


def test_gap_carries_its_file_and_line():
    gaps, _ = docs_gaps.scan(TABLE, "product/specifications.md")
    assert gaps[0].path == "product/specifications.md"
    assert gaps[0].line == 7


def test_all_four_legal_basis_values_are_accepted():
    _, violations = docs_gaps.scan(TABLE, "x.md")
    assert violations == []


def test_a_qualifier_after_an_em_dash_is_legal():
    table = (
        "| Parameter | Value | Basis |\n"
        "| :- | :- | :- |\n"
        "| Speed | 0.22 m/s | Design target — flat floor |\n"
    )
    _, violations = docs_gaps.scan(table, "x.md")
    assert violations == []


def test_an_illegal_basis_value_is_a_violation():
    table = (
        "| Parameter | Value | Basis |\n"
        "| :- | :- | :- |\n"
        "| Payload | 2 kg | estimated by eye |\n"
    )
    gaps, violations = docs_gaps.scan(table, "x.md")
    assert gaps == []
    assert [v.value for v in violations] == ["estimated by eye"]


def test_tables_without_a_basis_column_are_ignored():
    table = (
        "| Topic | Type |\n"
        "| :- | :- |\n"
        "| /body_cmd | BodyCommand |\n"
    )
    assert docs_gaps.scan(table, "x.md") == ([], [])


def test_prose_is_ignored():
    assert docs_gaps.scan("Just a sentence about | pipes.\n", "x.md") == ([], [])


def test_main_exits_zero_when_only_gaps_exist(tmp_path, capsys):
    (tmp_path / "spec.md").write_text(TABLE)
    assert docs_gaps.main([str(tmp_path)]) == 0
    assert "Payload" in capsys.readouterr().out


def test_main_exits_one_when_a_violation_exists(tmp_path):
    (tmp_path / "spec.md").write_text(
        "| Parameter | Value | Basis |\n"
        "| :- | :- | :- |\n"
        "| Payload | 2 kg | guessed |\n"
    )
    assert docs_gaps.main([str(tmp_path)]) == 1
