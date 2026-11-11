
import os
import time
from google import genai


class GeminiExplanationEngine:

    def __init__(self):
        self.api_key = os.getenv("GEMINI_API_KEY")
        self.model = os.getenv(
            "GEMINI_MODEL",
            "gemini-3.8-flash"
        )

        self.client = None

        if self.api_key:
            self.client = genai.Client(
                api_key=self.api_key
            )

    def explain_diagnosis(self, query, ml_result):

        if not self.client:
            return {
                "gemini_status": "not_configured",
                "gemini_explanation": None
            }

        prompt = f"""
You are the explanation assistant for Byte Force.

Machine learning preliminary result:
Category: {ml_result.get("predicted_category")}
Confidence: {ml_result.get("confidence_score")} percent
Possible issue: {ml_result.get("possible_issue")}

Customer description:
{query}

Explain:
1. What the predicted result may mean.
2. Two or three possible causes.
3. Safe external checks.
4. When to contact a qualified technician.

Safety:
- Never instruct users to open appliances.
- Never instruct users to touch wiring.
- Avoid instructions involving gas or refrigerants.
- Recommend qualified professionals for dangerous issues.
- Never present a prediction as certain.

Keep the explanation concise and understandable.
Return plain text, not JSON.
"""

        for attempt in range(3):
            try:
                response = self.client.models.generate_content(
                    model=self.model,
                    contents=prompt
                )

                explanation = (response.text or "").strip()

                if not explanation:
                    raise ValueError("Empty Gemini response")

                return {
                    "gemini_status": "available",
                    "gemini_explanation": explanation
                }

            except Exception as e:

                error_code = getattr(e, "code", None)

                if error_code in (429, 500, 502, 503, 504):
                    if attempt < 2:
                        time.sleep(2 ** attempt)
                        continue

                return {
                    "gemini_status": "unavailable",
                    "gemini_explanation": None
                }

        return {
            "gemini_status": "unavailable",
            "gemini_explanation": None
        }
