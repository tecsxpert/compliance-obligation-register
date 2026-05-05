<<<<<<< HEAD
from flask import Blueprint, request, jsonify
from services.groq_client import GroqClient

categorise_bp = Blueprint("categorise", __name__)
client = GroqClient()

@categorise_bp.route("/categorise", methods=["POST"])
def categorise():
    data = request.get_json()

    if not data or "text" not in data:
        return jsonify({"error": "Text is required"}), 400

    user_text = data["text"]

    prompt = f"""
    Classify the following text into a category.
    Also give confidence (0 to 1) and reasoning.

    Text: {user_text}

    Respond ONLY in JSON:
    {{
      "category": "",
      "confidence": 0.0,
      "reasoning": ""
    }}
    """

    response = client.generate([
        {"role": "user", "content": prompt}
    ])

    return jsonify({"result": response})
=======
from flask import Blueprint
categorise_bp = Blueprint('categorise', __name__)
>>>>>>> upstream/main
