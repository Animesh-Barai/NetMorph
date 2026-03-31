import typer
import asyncio
import json
from rich.console import Console
from rich.table import Table
from pathlib import Path
from core.models import Rule, Action, MatchType, ActionType
from core.repository import RulesRepository
from core.database import init_db, DB_PATH

app = typer.Typer(help="NetMorph Rule Management CLI")
console = Console()
repo = RulesRepository()

@app.command()
def init():
    """Initialize the NetMorph database."""
    asyncio.run(init_db())
    console.print("[green]Database initialized![/green]")

@app.command()
def add(
    name: str = typer.Option(..., help="Name of the rule"),
    pattern: str = typer.Option(..., help="Url/Path pattern to match"),
    match_type: MatchType = typer.Option(MatchType.EXACT, help="Type of matching"),
    action: ActionType = typer.Option(ActionType.REDIRECT, help="Action to perform"),
    config: str = typer.Option("{}", help="JSON configuration for the action")
):
    """Add a new rule to NetMorph."""
    rule_id = str(hash(name + pattern))[1:10] # Simple ID for Phase 4
    try:
        action_config = json.loads(config)
    except json.JSONDecodeError:
        console.print("[red]Error: Invalid JSON config[/red]")
        return

    rule = Rule(
        id=rule_id,
        name=name,
        match_type=match_type,
        pattern=pattern,
        actions=[Action(type=action, config=action_config)]
    )
    asyncio.run(repo.add_rule(rule))
    console.print(f"[green]Rule '{name}' added successfully (ID: {rule_id})[/green]")

@app.command()
def list():
    """List all configured rules."""
    rules = asyncio.run(repo.list_rules())
    if not rules:
        console.print("[yellow]No rules found.[/yellow]")
        return

    table = Table(title="NetMorph Rules")
    table.add_column("ID", style="cyan")
    table.add_column("Name", style="magenta")
    table.add_column("Match Type", style="green")
    table.add_column("Pattern", style="blue")
    table.add_column("Actions", style="white")
    table.add_column("Active", style="bold")

    for r in rules:
        actions_str = ", ".join([a.type.value for a in r.actions])
        table.add_row(
            r.id, r.name, r.match_type.value, r.pattern, actions_str, 
            "✅" if r.is_active else "❌"
        )
    
    console.print(table)

@app.command()
def delete(rule_id: str):
    """Delete a rule by ID."""
    asyncio.run(repo.delete_rule(rule_id))
    console.print(f"[green]Rule {rule_id} deleted.[/green]")

if __name__ == "__main__":
    app()
