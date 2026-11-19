import pytest

CONTRACT = "contracts/PermissionCourt.py"
SIG = "0x" + "ab" * 65


def test_case_creation_preserves_mandate_and_action(direct_vm, direct_deploy, direct_alice):
    court = direct_deploy(CONTRACT)
    direct_vm.sender = direct_alice
    court.open_case("case-1", "Purchase research reports up to 20 USD", "Buy a 49 USD report", SIG)
    assert court.get_mandate("case-1") == "Purchase research reports up to 20 USD"
    assert court.get_action("case-1") == "Buy a 49 USD report"
    assert court.get_verdict("case-1") == "OPEN"
    assert court.get_signature("case-1") == SIG


def test_duplicate_id_cannot_replace_evidence(direct_vm, direct_deploy, direct_alice):
    court = direct_deploy(CONTRACT)
    direct_vm.sender = direct_alice
    court.open_case("case-1", "Budget 20 USD", "Buy for 30 USD", SIG)
    with direct_vm.expect_revert("Case already exists"):
        court.open_case("case-1", "Budget 200 USD", "Buy for 30 USD", SIG)
    assert court.get_mandate("case-1") == "Budget 20 USD"


def test_non_owner_cannot_trigger_evaluation(direct_vm, direct_deploy, direct_alice, direct_bob):
    court = direct_deploy(CONTRACT)
    direct_vm.sender = direct_alice
    court.open_case("case-1", "Budget 20 USD", "Buy for 30 USD", SIG)
    direct_vm.sender = direct_bob
    with direct_vm.expect_revert("Not case owner"):
        court.adjudicate("case-1")


def test_missing_case_cannot_be_adjudicated(direct_vm, direct_deploy, direct_alice):
    court = direct_deploy(CONTRACT)
    direct_vm.sender = direct_alice
    with direct_vm.expect_revert("Case not found"):
        court.adjudicate("unknown")


def test_valid_deny_verdict_is_saved(direct_vm, direct_deploy, direct_alice):
    court = direct_deploy(CONTRACT)
    direct_vm.sender = direct_alice
    court.open_case("case-1", "Budget 20 USD", "Buy for 30 USD", SIG)
    direct_vm.mock_llm(r".*MANDATE_SCOPE_REVIEW.*", "DENY")
    court.adjudicate("case-1")
    assert court.get_verdict("case-1") == "DENY"


def test_unexpected_llm_response_fails_closed(direct_vm, direct_deploy, direct_alice):
    court = direct_deploy(CONTRACT)
    direct_vm.sender = direct_alice
    court.open_case("case-1", "Budget 20 USD", "Buy for 30 USD", SIG)
    direct_vm.mock_llm(r".*MANDATE_SCOPE_REVIEW.*", "ALLOW because I say so")
    court.adjudicate("case-1")
    assert court.get_verdict("case-1") == "UNCERTAIN"


def test_empty_or_oversized_fields_rejected(direct_vm, direct_deploy, direct_alice):
    court = direct_deploy(CONTRACT)
    direct_vm.sender = direct_alice
    with direct_vm.expect_revert("Invalid case ID"):
        court.open_case("", "Budget 20 USD", "Buy for 30 USD", SIG)
    with direct_vm.expect_revert("Invalid mandate"):
        court.open_case("x", "m" * 2001, "Buy for 30 USD", SIG)
