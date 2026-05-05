# Flask Blueprint for generating compliance reports
import time
from flask import Blueprint, request, jsonify, Response, stream_with_context

# Create a Blueprint named report_bp
report_bp = Blueprint('report_bp', __name__)


@report_bp.route('/generate-report', methods=['POST'])
def generate_report():
    """
    POST /generate-report endpoint
    
    Accepts JSON input with compliance issue details and returns
    a structured professional report.
    
    Expected JSON input:
    {
        "text": "compliance issue details"
    }
    """
    
    try:
        # Step 1: Validate that request has JSON body
        if not request.is_json:
            return jsonify({
                "error": "Request body must be JSON"
            }), 400
        
        # Step 2: Get the JSON data from request
        data = request.get_json()
        
        # Step 3: Validate that request body is not empty
        if not data:
            return jsonify({
                "error": "Request body cannot be empty"
            }), 400
        
        # Step 4: Validate that 'text' field exists
        if 'text' not in data:
            return jsonify({
                "error": "Missing required field: 'text'"
            }), 400
        
        # Step 5: Get the text and validate it's not empty
        text = data.get('text', '').strip()
        
        if not text:
            return jsonify({
                "error": "The 'text' field cannot be empty"
            }), 400
        
        # Step 6: Generate a dummy professional report based on input text
        # (In the future, this will call a real AI API)
        report = generate_dummy_report(text)
        
        # Step 7: Return the report as JSON response
        return jsonify(report), 200
    
    except Exception as e:
        # Step 8: Handle any unexpected errors
        return jsonify({
            "error": f"An error occurred: {str(e)}"
        }), 500


@report_bp.route('/generate-report-stream', methods=['GET'])
def generate_report_stream():
    """
    GET /generate-report-stream endpoint
    
    Uses Server-Sent Events (SSE) to stream a compliance report line by line.
    The frontend can receive real-time updates as the report is generated.
    
    Query parameter:
    - text: The compliance issue details to analyze
    
    Example:
    GET /generate-report-stream?text=Company has missing compliance policies
    
    Frontend usage:
    const source = new EventSource("http://127.0.0.1:5000/generate-report-stream?text=test");
    source.onmessage = function(event) {
        console.log(event.data);
    };
    """
    
    try:
        # Step 1: Get the text query parameter
        text = request.args.get('text', '').strip()
        
        # Step 2: Validate that text parameter is not empty
        if not text:
            # Return error as a stream format
            return Response(
                stream_with_context(
                    stream_error_message("Error: Missing 'text' query parameter")
                ),
                mimetype='text/event-stream'
            ), 400
        
        # Step 3: Create the streaming response with the generator function
        # stream_with_context preserves the Flask application context
        return Response(
            stream_with_context(generate_report_stream_content(text)),
            mimetype='text/event-stream'
        )
    
    except Exception as e:
        # Step 4: Handle any unexpected errors
        return Response(
            stream_with_context(
                stream_error_message(f"Error: {str(e)}")
            ),
            mimetype='text/event-stream'
        ), 500


def generate_report_stream_content(text):
    """
    Generator function that streams report content line by line.
    
    This function yields lines in Server-Sent Events (SSE) format.
    Each line is prefixed with "data: " to be compatible with EventSource API.
    
    Args:
        text (str): The compliance issue details
        
    Yields:
        str: Each line of the report in SSE format
    """
    
    try:
        # Step 1: Stream initial message
        yield f"data: Generating Compliance Report...\n\n"
        time.sleep(1)
        
        # Step 2: Stream the title
        yield f"data: Title: Compliance Risk Report\n\n"
        time.sleep(1)
        
        # Step 3: Stream the executive summary
        summary_text = text[:100]
        yield f"data: Executive Summary: Compliance assessment for {summary_text}. This issue requires immediate attention and proper documentation.\n\n"
        time.sleep(1)
        
        # Step 4: Stream the overview
        yield f"data: Overview: Detailed compliance review based on submitted issue: '{text}'. The organization must ensure full adherence to regulatory requirements and internal policies.\n\n"
        time.sleep(1)
        
        # Step 5: Stream the top items header
        yield f"data: Top Items:\n\n"
        time.sleep(0.5)
        
        # Step 6: Stream each top item
        top_items = [
            "Policy gaps identified",
            "Training required",
            "Audit pending"
        ]
        for item in top_items:
            yield f"data: - {item}\n\n"
            time.sleep(0.5)
        
        # Step 7: Stream the recommendations header
        yield f"data: Recommendations:\n\n"
        time.sleep(0.5)
        
        # Step 8: Stream each recommendation
        recommendations = [
            "Update compliance policies",
            "Conduct employee training",
            "Perform regular audits"
        ]
        for rec in recommendations:
            yield f"data: - {rec}\n\n"
            time.sleep(0.5)
        
        # Step 9: Stream completion message
        yield f"data: Report Completed\n\n"
        
    except Exception as e:
        # Handle errors during streaming
        yield f"data: Error generating report: {str(e)}\n\n"


def stream_error_message(message):
    """
    Helper function to stream an error message in SSE format.
    
    Args:
        message (str): The error message to stream
        
    Yields:
        str: Error message in SSE format
    """
    yield f"data: {message}\n\n"


def generate_dummy_report(text):
    """
    Generate a dummy professional compliance report.
    
    This function creates a structured report based on the input text.
    In a real implementation, this would call an AI API to generate
    intelligent recommendations based on the compliance issue details.
    
    Args:
        text (str): The compliance issue details
        
    Returns:
        dict: A structured compliance report in the required format
    """
    
    # Extract first 100 characters for the executive summary
    summary_text = text[:100]
    
    # Create the structured report response
    report = {
        "title": "Compliance Risk Report",
        "executive_summary": f"Compliance assessment for: {summary_text}. This issue requires immediate attention and proper documentation.",
        "overview": f"Detailed compliance review based on submitted issue: '{text}'. The organization must ensure full adherence to regulatory requirements and internal policies.",
        "top_items": [
            "Policy gaps identified",
            "Training required",
            "Audit pending"
        ],
        "recommendations": [
            "Update compliance policies",
            "Conduct employee training",
            "Perform regular audits"
        ]
    }
    
    return report
