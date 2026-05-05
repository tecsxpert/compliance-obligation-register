# Flask Blueprint for health check endpoint
from flask import Blueprint, jsonify

# Create a Blueprint named health_bp
health_bp = Blueprint('health_bp', __name__)


@health_bp.route('/health', methods=['GET'])
def health_check():
    """
    GET /health endpoint
    
    Returns the health status of the AI microservice including:
    - Service status (healthy/unhealthy)
    - Service name
    - AI model information
    - Uptime status
    - Version information
    - Status message
    
    This endpoint is used to monitor the service and verify
    that the AI service is running properly.
    """
    
    try:
        # Step 1: Create the health status response
        # In a real application, you would check actual AI service status
        health_status = {
            "status": "healthy",                              # Service status
            "service": "AI Microservice",                     # Service name
            "model_name": "LLaMA / Dummy Model",             # Current AI model
            "uptime": "running",                              # Uptime status
            "version": "1.0",                                 # Service version
            "message": "AI service is working properly"       # Status message
        }
        
        # Step 2: Return the health status as JSON response
        return jsonify(health_status), 200
    
    except Exception as e:
        # Step 3: Handle any unexpected errors
        # Return error status with error message
        error_response = {
            "status": "unhealthy",
            "service": "AI Microservice",
            "error": f"Health check failed: {str(e)}",
            "message": "AI service encountered an error"
        }
        
        return jsonify(error_response), 500
