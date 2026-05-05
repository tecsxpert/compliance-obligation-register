from flask import Blueprint, jsonify, request


# Blueprint keeps recommend routes organized in one file
recommend_bp = Blueprint("recommend", __name__)


@recommend_bp.route("/recommend", methods=["POST"])
def recommend():
    try:
        # Read JSON sent by the client
        data = request.get_json(silent=True)

        # Check if JSON is valid
        if not isinstance(data, dict):
            return jsonify({"error": "Invalid JSON body."}), 400

        # Check if "text" field exists and is not empty
        text = data.get("text")
        if not isinstance(text, str) or not text.strip():
            return jsonify({"error": "The 'text' field is required and cannot be empty."}), 400

        # For now, return fixed dummy recommendations (no real AI)
        recommendations = [
            {
                "action_type": "Policy Update",
                "description": "Update internal policies to meet compliance standards",
                "priority": "High"
            },
            {
                "action_type": "Training",
                "description": "Conduct employee training on compliance rules",
                "priority": "Medium"
            },
            {
                "action_type": "Audit",
                "description": "Perform regular compliance audits",
                "priority": "Low"
            }
        ]

        # Return the response
        return jsonify({"recommendations": recommendations})

    except Exception as error:
        # Handle any unexpected errors
        return jsonify({"error": "An unexpected error occurred.", "details": str(error)}), 500
