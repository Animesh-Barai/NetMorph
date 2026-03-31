import subprocess

def test_uv_mitmproxy_install():
    """Verify that mitmproxy is installed and accessible via uv run."""
    result = subprocess.run(["uv", "run", "mitmdump", "--version"], capture_output=True, text=True)
    assert result.returncode == 0
    assert "mitmproxy" in result.stdout.lower()

def test_pytest_install():
    """Verify that pytest is installed and working."""
    import pytest
    assert pytest.__version__ is not None
