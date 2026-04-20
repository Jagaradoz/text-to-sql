import pytest
import httpx
import os

BASE_URL = os.getenv("TEST_BASE_URL", "http://localhost:8000/api")


@pytest.fixture
def base_url():
    return BASE_URL


@pytest.fixture
def api_key():
    return os.getenv("OPENAI_API_KEY", "")


@pytest.fixture
def async_client():
    async def _make_client(timeout: float = 30.0):
        return httpx.AsyncClient(base_url=BASE_URL, timeout=timeout)
    return _make_client
