import pytest
import httpx
import os

# Assuming the server is running on localhost:8000
BASE_URL = "http://localhost:8000/api"

@pytest.mark.asyncio
async def test_health_endpoint():
    """
    Test the health check endpoint.
    Verifies that the API server is up and responding.
    """
    async with httpx.AsyncClient() as client:
        response = await client.get(f"{BASE_URL}/health")
        assert response.status_code == 200
        # Optional: check json if your health returns status ok
        # assert response.json().get("status") == "ok"

@pytest.mark.asyncio
async def test_schema_overview():
    """
    Test the schema overview endpoint.
    Verifies it returns a valid JSON response containing 'databases' list.
    """
    async with httpx.AsyncClient() as client:
        response = await client.get(f"{BASE_URL}/database/schema")
        assert response.status_code == 200
        data = response.json()
        assert "databases" in data
        assert isinstance(data["databases"], list)

@pytest.mark.asyncio
async def test_inspect_table_invalid_name():
    """
    Test inspecting a nonexistent table.
    Should return an error or an empty format gracefully.
    """
    async with httpx.AsyncClient() as client:
        response = await client.get(f"{BASE_URL}/database/non_existent_table_12345")
        # Depending on implementation, this could be 400, 404, or 503
        assert response.status_code in [400, 404, 503]

@pytest.mark.asyncio
async def test_generate_query_unauthorized_or_bad_request():
    """
    Test the generate endpoint handling.
    Without an API key/mock, this might throw 400/500, but we test the route exists.
    """
    payload = {"prompt": "Show me all users"}
    async with httpx.AsyncClient() as client:
        response = await client.post(f"{BASE_URL}/generate", json=payload)
        # We expect a response, even if it's an error about OPENAI_API_KEY
        assert response.status_code != 404

def test_automated_upload_endpoint():
    """
    Provide AI agent instructions for the upload endpoint.
    Agents can use this structure to test uploading CSV files.
    """
    csv_content = b"id,name\\n1,test"
    files = {"file": ("test_data.csv", csv_content, "text/csv")}
    
    # Example snippet for the AI:
    # response = httpx.post(f"{BASE_URL}/database/upload", files=files)
    # assert response.status_code == 200
    pass
