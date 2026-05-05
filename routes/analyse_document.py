# Flask Blueprint for document analysis
from flask import Blueprint, request, jsonify

# Create a Blueprint named analyse_bp
analyse_bp = Blueprint('analyse_bp', __name__)


@analyse_bp.route('/analyse-document', methods=['POST'])
def analyse_document():
    """
    POST /analyse-document endpoint
    
    Accepts JSON input with document content and returns structured findings
    including insights, risks, and recommendations based on text analysis.
    
    Expected JSON input:
    {
        "text": "document content or compliance report text"
    }
    
    Returns structured findings array with type, title, description, and risk_level.
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
        
        # Step 6: Analyze the text using dummy logic
        # (In the future, this will call a real AI API)
        findings = analyze_text_for_findings(text)
        
        # Step 7: Return the analysis results as JSON response
        return jsonify({
            "status": "success",
            "findings": findings
        }), 200
    
    except Exception as e:
        # Step 8: Handle any unexpected errors
        return jsonify({
            "error": f"An error occurred: {str(e)}"
        }), 500


def analyze_text_for_findings(text):
    """
    Analyze the input text for compliance-related keywords and generate findings.
    
    This function uses dummy logic to detect common compliance keywords
    and generates structured findings based on what it finds.
    
    Args:
        text (str): The document content to analyze
        
    Returns:
        list: Array of finding objects with type, title, description, and risk_level
    """
    
    # Convert text to lowercase for case-insensitive matching
    text_lower = text.lower()
    
    # Initialize findings array
    findings = []
    
    # Step 1: Check for policy-related keywords
    if 'policy' in text_lower:
        findings.append({
            "type": "Insight",
            "title": "Policy Gap Found",
            "description": "Compliance policy references detected and may need review.",
            "risk_level": "Medium"
        })
    
    # Step 2: Check for risk-related keywords
    if 'risk' in text_lower:
        findings.append({
            "type": "Risk",
            "title": "Risk Assessment Required",
            "description": "Risk-related content detected that requires further assessment.",
            "risk_level": "High"
        })
    
    # Step 3: Check for training-related keywords
    if 'training' in text_lower:
        findings.append({
            "type": "Recommendation",
            "title": "Training Needed",
            "description": "Employee training is recommended based on document content.",
            "risk_level": "Low"
        })
    
    # Step 4: Check for audit-related keywords
    if 'audit' in text_lower:
        findings.append({
            "type": "Insight",
            "title": "Audit Reference Found",
            "description": "Audit-related content detected that may require follow-up.",
            "risk_level": "Medium"
        })
    
    # Step 5: Check for security-related keywords
    if 'security' in text_lower:
        findings.append({
            "type": "Risk",
            "title": "Security Concern",
            "description": "Security-related issues detected in the provided text.",
            "risk_level": "High"
        })
    
    # Step 6: Check for violation-related keywords
    if 'violation' in text_lower:
        findings.append({
            "type": "Risk",
            "title": "Compliance Violation",
            "description": "Potential compliance violation detected in the document.",
            "risk_level": "High"
        })
    
    # Step 7: If no keywords found, add a default finding
    if not findings:
        findings.append({
            "type": "Insight",
            "title": "Document Analyzed",
            "description": "Document has been analyzed but no specific compliance keywords were detected.",
            "risk_level": "Low"
        })
    
    return findings