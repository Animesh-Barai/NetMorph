import pytest
from pathlib import Path
from typer.testing import CliRunner
from core import database
from cli.main import app, repo
from core.models import MatchType, ActionType

TEST_DB = Path("test_cli.db")
runner = CliRunner()

@pytest.fixture(autouse=True)
def setup_test_db():
    # Set DB_PATH to test_cli.db right before running tests in this file
    database.DB_PATH = TEST_DB
    repo.db_path = TEST_DB
    
    if TEST_DB.exists():
        try:
            TEST_DB.unlink()
        except OSError:
            pass
    
    yield
    
    if TEST_DB.exists():
        try:
            TEST_DB.unlink()
        except OSError:
            pass

def test_cli_commands():
    # 1. Test init command
    result = runner.invoke(app, ["init"])
    assert result.exit_code == 0
    assert "Database initialized!" in result.stdout
    assert TEST_DB.exists()

    # 2. Test list command when empty
    result = runner.invoke(app, ["list"])
    assert result.exit_code == 0
    assert "No rules found." in result.stdout

    # 3. Test add command
    result = runner.invoke(app, [
        "add", 
        "--name", "Test Rule CLI", 
        "--pattern", "testcli.com", 
        "--match-type", "exact", 
        "--action", "redirect", 
        "--config", '{"to": "redirect.com"}'
    ])
    assert result.exit_code == 0
    assert "added successfully" in result.stdout

    # 4. Test list command with rule
    result = runner.invoke(app, ["list"])
    assert result.exit_code == 0
    assert "Test Rule CLI" in result.stdout
    assert "testcli.com" in result.stdout

    # Extract rule ID
    import asyncio
    rules = asyncio.run(repo.list_rules())
    assert len(rules) == 1
    rule_id = rules[0].id

    # 5. Test delete command
    result = runner.invoke(app, ["delete", rule_id])
    assert result.exit_code == 0
    assert f"Rule {rule_id} deleted." in result.stdout

    # Verify rule is deleted
    rules_after = asyncio.run(repo.list_rules())
    assert len(rules_after) == 0
