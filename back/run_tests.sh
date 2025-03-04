#!/bin/bash

# Run the mock tests
echo "Running mock tests..."
pytest tests/unit/services/test_user_auth_service_mock.py \
       tests/unit/repository/test_user_repository_mock.py \
       tests/unit/routers/test_user_auth_router_mock.py \
       tests/unit/security/test_auth.py \
       --cov=src --cov-report=term --cov-report=html

# Open coverage report if requested
if [ "$1" == "--open-report" ]; then
    if command -v xdg-open &> /dev/null; then
        xdg-open htmlcov/index.html
    elif command -v open &> /dev/null; then
        open htmlcov/index.html
    else
        echo "Coverage report generated at htmlcov/index.html"
    fi
fi