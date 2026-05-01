import os
from warnings import WarningMessage

# Provide required settings before importing app modules.
os.environ.setdefault("DATABASE_URL", "sqlite:///./test_notifications.db")
os.environ.setdefault("POSTGRES_HOST", "localhost")
os.environ.setdefault("POSTGRES_USER", "test")
os.environ.setdefault("POSTGRES_PASSWORD", "test")
os.environ.setdefault("POSTGRES_PORT", "5432")
os.environ.setdefault("POSTGRES_DB", "test")

import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

from app.core.database import get_db
from app.core.database import Base
from app.main import app

SQLALCHEMY_DATABASE_URL = "sqlite:///./test_notifications.db"
engine = create_engine(
    SQLALCHEMY_DATABASE_URL,
    connect_args={"check_same_thread": False},
)
TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
_DEPRECATION_WARNINGS: list[str] = []


def override_get_db():
    db = TestingSessionLocal()
    try:
        yield db
    finally:
        db.close()


app.dependency_overrides[get_db] = override_get_db


@pytest.fixture(autouse=True)
def setup_test_db():
    Base.metadata.create_all(bind=engine)
    yield
    Base.metadata.drop_all(bind=engine)


@pytest.fixture
def client():
    return TestClient(app)


def pytest_warning_recorded(
    warning_message: WarningMessage,
    when: str,
    nodeid: str | None,
    location: tuple[str, int, str] | None,
) -> None:
    del when, nodeid, location
    category = warning_message.category
    if not category:
        return

    if issubclass(category, (DeprecationWarning, PendingDeprecationWarning)):
        filename = warning_message.filename or "<unknown>"
        lineno = warning_message.lineno or 0
        message = str(warning_message.message)
        _DEPRECATION_WARNINGS.append(f"{filename}:{lineno} - {category.__name__}: {message}")


def pytest_terminal_summary(terminalreporter: pytest.TerminalReporter, exitstatus: int) -> None:
    del exitstatus
    if not _DEPRECATION_WARNINGS:
        return

    terminalreporter.write_sep("=", "Deprecation Warnings", blue=True, bold=True)
    for line in sorted(set(_DEPRECATION_WARNINGS)):
        terminalreporter.write_line(line, blue=True)
