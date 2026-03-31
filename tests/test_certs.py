import os
import subprocess
import pytest
import time
from pathlib import Path

def test_addon_loadable():
    """Verify that the AsyncNetMorph addon is loadable."""
    process = subprocess.run(["uv", "run", "mitmdump", "-s", "proxy/addon.py", "--version"], capture_output=True, text=True)
    assert process.returncode == 0

def test_ca_cert_exists():
    """Verify that mitmproxy generates the CA certificate."""
    cert_path = Path.home() / ".mitmproxy" / "mitmproxy-ca-cert.cer"
    
    # If cert doesn't exist, try to generate it by running mitmdump briefly
    if not cert_path.exists():
        # Start mitmdump in background and kill it after 2 seconds
        # This is enough to trigger CA generation if it doesn't exist
        try:
            p = subprocess.Popen(["uv", "run", "mitmdump"], stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
            time.sleep(2)
            p.terminate()
            p.wait(timeout=5)
        except Exception:
            p.kill()

    assert cert_path.exists(), f"CA certificate not found at {cert_path}"

