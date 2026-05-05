from datetime import datetime
from pathlib import Path

from flask import Blueprint, jsonify, request


# Blueprint keeps describe routes organized in one file
describe_bp = Blueprint("describe", __name__)


def load_prompt_template():
    prompt_path = Path(__file__).resolve().parents[1] / "prompts" / "describe.txt"
    return prompt_path.read_text(encoding="utf-8")


def call_groq_api(prompt_text):
    # Mock Groq API call for development and initial testing.
    # Replace this with a real API client when Groq is available.
    return {
        "title": "Sample Compliance Description",
        "summary": "This summary explains the compliance obligation in a clear and formal business style.",
        "key_points": [
            "Identify the main requirement from the input text.",
            "Highlight the most important compliance elements.",
            "Note the risk and any required actions."
        ],
        "risk_level": "Medium",
        "recommendation": "Review the described obligation and update controls to ensure compliance."
    }


@describe_bp.route("/describe", methods=["POST"])
def describe():
    try:
        data = request.get_json(silent=True)
        if not isinstance(data, dict):
            return jsonify({"error": "Invalid JSON body."}), 400

        text = data.get("text")
        if not isinstance(text, str) or not text.strip():
            return jsonify({"error": "The 'text' field is required and cannot be empty."}), 400

        prompt_template = load_prompt_template()
        prompt_text = prompt_template.replace("{user_input}", text.strip())

        generated = call_groq_api(prompt_text)

        response = {
            "title": generated.get("title", ""),
            "summary": generated.get("summary", ""),
            "key_points": generated.get("key_points", []),
            "risk_level": generated.get("risk_level", ""),
            "recommendation": generated.get("recommendation", ""),
            "generated_at": datetime.utcnow().isoformat() + "Z"
        }

        return jsonify(response)

    except FileNotFoundError:
        return jsonify({"error": "Prompt template file not found."}), 500
    except Exception as error:
        return jsonify({"error": "An unexpected error occurred.", "details": str(error)}), 500
