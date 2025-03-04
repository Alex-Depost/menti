import pytest
from unittest.mock import patch, AsyncMock
from fastapi.testclient import TestClient

from src.main import app
from src.routers.metrics_router import Metrics, metrics, get_business_metrics


@pytest.fixture
def test_client():
    return TestClient(app)


def test_metrics_class_initialization():
    test_metrics = Metrics()

    assert test_metrics.mentors_count == 0
    assert test_metrics.students_count == 0
    assert test_metrics.active_mentors == 0
    assert test_metrics.active_students == 0
    assert test_metrics.avg_students_per_mentor == 0.0
    assert test_metrics.successful_matches == 0


@pytest.mark.asyncio
async def test_get_business_metrics():
    with patch(
        "src.routers.metrics_router.get_mentors", new_callable=AsyncMock
    ) as mock_get_mentors, patch(
        "src.routers.metrics_router.get_users", new_callable=AsyncMock
    ) as mock_get_users:
        # Mock repository responses
        mock_get_mentors.return_value = ([], 10)  # 10 total mentors
        mock_get_users.return_value = ([], 20)  # 20 total students

        # Set some initial values to ensure they get updated
        metrics.mentors_count = 5
        metrics.students_count = 15

        # Call the function
        response = await get_business_metrics()

        # Check that metrics were updated
        assert metrics.mentors_count == 10
        assert metrics.students_count == 20

        # Check response format
        assert response.media_type == "text/plain"
        content = response.body.decode()

        # Check that all metrics are included in the response
        assert "mentors_count 10" in content
        assert "students_count 20" in content
        assert "active_mentors 0" in content
        assert "active_students 0" in content
        assert "avg_students_per_mentor 0.0" in content
        assert "successful_matches 0" in content

        # Check that repository functions were called correctly
        mock_get_mentors.assert_called_once_with(page=1, size=1)
        mock_get_users.assert_called_once_with(page=1, size=1)
