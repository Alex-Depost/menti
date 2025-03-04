# Backend Unit Tests

This directory contains unit tests for the backend application.

## Structure

- `unit/`: Unit tests for individual components
  - `services/`: Tests for service layer
  - `repository/`: Tests for data access layer
  - `security/`: Tests for authentication and security
  - `routers/`: Tests for API endpoints

## Running Tests

1. Install development dependencies:

```bash
pip install -r requirements-dev.txt
```

2. Run all tests:

```bash
pytest
```

3. Run tests with coverage report:

```bash
pytest --cov=src
```

4. Run specific test files:

```bash
pytest tests/unit/file.py
```

5. Run tests with specific markers:

```bash
pytest -m unit
```

## Test Configuration

Test configuration is defined in `pytest.ini` at the project root.