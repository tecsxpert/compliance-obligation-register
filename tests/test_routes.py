# Unit tests for Flask AI microservice endpoints
import pytest
import json
from app import create_app


class TestFlaskApp:
    """
    Test class for Flask AI microservice endpoints.

    This class contains unit tests for all API endpoints using pytest
    and Flask's test client. Each test verifies proper functionality,
    error handling, and response formats.
    """

    @pytest.fixture
    def client(self):
        """
        Pytest fixture that creates a test client for the Flask app.

        This fixture is automatically used by all test methods in this class.
        It creates a new app instance for each test to ensure isolation.
        """
        app = create_app()
        app.config['TESTING'] = True
        with app.test_client() as client:
            yield client

    def test_health_endpoint_success(self, client):
        """
        Test GET /health endpoint returns successful response.

        This test verifies that the health endpoint returns a 200 status
        and contains the expected health information.
        """
        # Send GET request to health endpoint
        response = client.get('/health')

        # Assert response status is 200 (OK)
        assert response.status_code == 200

        # Parse JSON response
        data = json.loads(response.data)

        # Assert response contains expected keys
        assert 'status' in data
        assert 'service' in data
        assert 'model_name' in data
        assert 'uptime' in data
        assert 'version' in data
        assert 'message' in data

        # Assert specific values
        assert data['status'] == 'healthy'
        assert data['service'] == 'AI Microservice'

    def test_describe_endpoint_success(self, client):
        """
        Test POST /describe endpoint with valid input.

        This test verifies that the describe endpoint accepts valid JSON
        with text field and returns a 200 status with description.
        """
        # Prepare test data
        test_data = {'text': 'Company policy document'}

        # Send POST request with JSON data
        response = client.post('/describe',
                             data=json.dumps(test_data),
                             content_type='application/json')

        # Assert response status is 200 (OK)
        assert response.status_code == 200

        # Parse JSON response
        data = json.loads(response.data)

        # Assert response contains expected keys
        assert 'title' in data
        assert 'summary' in data
        assert 'key_points' in data
        assert 'risk_level' in data
        assert 'recommendation' in data
        assert 'generated_at' in data

        # Assert specific values/types
        assert isinstance(data['key_points'], list)

    def test_describe_endpoint_missing_text(self, client):
        """
        Test POST /describe endpoint with missing text field.

        This test verifies that the endpoint returns 400 status
        when the required 'text' field is missing from the request.
        """
        # Prepare test data without text field
        test_data = {'content': 'some content'}

        # Send POST request with incomplete JSON data
        response = client.post('/describe',
                             data=json.dumps(test_data),
                             content_type='application/json')

        # Assert response status is 400 (Bad Request)
        assert response.status_code == 400

        # Parse JSON response
        data = json.loads(response.data)

        # Assert error message is present
        assert 'error' in data

    def test_describe_endpoint_invalid_json(self, client):
        """
        Test POST /describe endpoint with invalid JSON.

        This test verifies that the endpoint handles malformed JSON
        and returns appropriate error response.
        """
        # Send POST request with invalid JSON
        response = client.post('/describe',
                             data='invalid json content',
                             content_type='application/json')

        # Assert response status is 400 (Bad Request)
        assert response.status_code == 400

        # Parse JSON response
        data = json.loads(response.data)

        # Assert error message is present
        assert 'error' in data

    def test_recommend_endpoint_success(self, client):
        """
        Test POST /recommend endpoint with valid input.

        This test verifies that the recommend endpoint accepts valid JSON
        and returns recommendations with 200 status.
        """
        # Prepare test data
        test_data = {'text': 'Compliance training needed'}

        # Send POST request with JSON data
        response = client.post('/recommend',
                             data=json.dumps(test_data),
                             content_type='application/json')

        # Assert response status is 200 (OK)
        assert response.status_code == 200

        # Parse JSON response
        data = json.loads(response.data)

        # Assert response contains expected keys
        assert 'recommendations' in data
        assert isinstance(data['recommendations'], list)

    def test_recommend_endpoint_missing_text(self, client):
        """
        Test POST /recommend endpoint with missing text field.

        This test verifies that the endpoint returns 400 status
        when the required 'text' field is missing.
        """
        # Prepare test data without text field
        test_data = {'query': 'some query'}

        # Send POST request with incomplete JSON data
        response = client.post('/recommend',
                             data=json.dumps(test_data),
                             content_type='application/json')

        # Assert response status is 400 (Bad Request)
        assert response.status_code == 400

        # Parse JSON response
        data = json.loads(response.data)

        # Assert error message is present
        assert 'error' in data

    def test_generate_report_endpoint_success(self, client):
        """
        Test POST /generate-report endpoint with valid input.

        This test verifies that the generate-report endpoint accepts valid JSON
        and returns a complete report structure with 200 status.
        """
        # Prepare test data
        test_data = {'text': 'Company compliance issues'}

        # Send POST request with JSON data
        response = client.post('/generate-report',
                             data=json.dumps(test_data),
                             content_type='application/json')

        # Assert response status is 200 (OK)
        assert response.status_code == 200

        # Parse JSON response
        data = json.loads(response.data)

        # Assert response contains expected keys
        assert 'title' in data
        assert 'executive_summary' in data
        assert 'overview' in data
        assert 'top_items' in data
        assert 'recommendations' in data

        # Assert specific values
        assert data['title'] == 'Compliance Risk Report'
        assert isinstance(data['top_items'], list)
        assert isinstance(data['recommendations'], list)

    def test_generate_report_endpoint_missing_text(self, client):
        """
        Test POST /generate-report endpoint with missing text field.

        This test verifies that the endpoint returns 400 status
        when the required 'text' field is missing.
        """
        # Prepare test data without text field
        test_data = {'content': 'some content'}

        # Send POST request with incomplete JSON data
        response = client.post('/generate-report',
                             data=json.dumps(test_data),
                             content_type='application/json')

        # Assert response status is 400 (Bad Request)
        assert response.status_code == 400

        # Parse JSON response
        data = json.loads(response.data)

        # Assert error message is present
        assert 'error' in data

    def test_analyse_document_endpoint_success(self, client):
        """
        Test POST /analyse-document endpoint with valid input.

        This test verifies that the analyse-document endpoint accepts valid JSON
        and returns structured findings with 200 status.
        """
        # Prepare test data
        test_data = {'text': 'Policy audit training security violation'}

        # Send POST request with JSON data
        response = client.post('/analyse-document',
                             data=json.dumps(test_data),
                             content_type='application/json')

        # Assert response status is 200 (OK)
        assert response.status_code == 200

        # Parse JSON response
        data = json.loads(response.data)

        # Assert response contains expected keys
        assert 'status' in data
        assert 'findings' in data

        # Assert specific values
        assert data['status'] == 'success'
        assert isinstance(data['findings'], list)

        # Assert findings structure (if any findings exist)
        if data['findings']:
            finding = data['findings'][0]
            assert 'type' in finding
            assert 'title' in finding
            assert 'description' in finding
            assert 'risk_level' in finding

    def test_analyse_document_endpoint_missing_text(self, client):
        """
        Test POST /analyse-document endpoint with missing text field.

        This test verifies that the endpoint returns 400 status
        when the required 'text' field is missing.
        """
        # Prepare test data without text field
        test_data = {'document': 'some document'}

        # Send POST request with incomplete JSON data
        response = client.post('/analyse-document',
                             data=json.dumps(test_data),
                             content_type='application/json')

        # Assert response status is 400 (Bad Request)
        assert response.status_code == 400

        # Parse JSON response
        data = json.loads(response.data)

        # Assert error message is present
        assert 'error' in data