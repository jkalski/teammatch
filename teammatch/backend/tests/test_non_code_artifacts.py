from pathlib import Path


def _repo_root() -> Path:
    # backend/tests -> backend -> teammatch -> repo root
    return Path(__file__).resolve().parents[3]


def test_readme_includes_requirements_section():
    readme_path = _repo_root() / "README.md"
    content = readme_path.read_text(encoding="utf-8")

    assert "## Requirements" in content
    assert "Node.js" in content
    assert "Python" in content


def test_backend_requirements_is_utf8_text_and_has_core_deps():
    req_path = _repo_root() / "teammatch" / "backend" / "requirements.txt"
    content = req_path.read_text(encoding="utf-8")

    # Protect against accidental binary/UTF-16 re-introduction.
    assert "\x00" not in content

    lines = {
        line.strip()
        for line in content.splitlines()
        if line.strip() and not line.strip().startswith("#")
    }

    assert "fastapi==0.133.1" in lines
    assert "SQLAlchemy==2.0.47" in lines
    assert "pytest==9.0.3" in lines
    assert "httpx==0.28.1" in lines
