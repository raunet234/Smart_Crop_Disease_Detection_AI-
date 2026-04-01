"""
CropGuard AI — Backend Server
Serves static files + proxies AI requests to Gemini API
API key is stored in .env file — never exposed to the browser
"""

import http.server
import json
import urllib.request
import urllib.error
import os
import sys
import time

# ─── LOAD API KEY ─────────────────────────────────────────
def load_api_key():
    """Load API key from environment variable or .env file (local dev)"""
    # 1. Environment variable first (Railway / production)
    key = os.environ.get("GEMINI_API_KEY", "").strip()
    if key:
        return key

    # 2. .env file fallback (local development)
    env_path = os.path.join(os.path.dirname(os.path.abspath(__file__)), ".env")
    if os.path.exists(env_path):
        with open(env_path, "r") as f:
            for line in f:
                line = line.strip()
                if line.startswith("GEMINI_API_KEY="):
                    key = line.split("=", 1)[1].strip().strip('"').strip("'")
                    if key:
                        return key

    print("\n" + "=" * 55)
    print("  ❌ NO API KEY FOUND!")
    print("=" * 55)
    print("  On Railway: set GEMINI_API_KEY in Variables tab")
    print("  Locally: create a .env file with:")
    print('  GEMINI_API_KEY=your_key_here')
    print()
    print("  Get a FREE key at:")
    print("  https://aistudio.google.com/apikey")
    print("=" * 55)
    sys.exit(1)


API_KEY = load_api_key()
GEMINI_MODELS = ["gemini-2.5-flash", "gemini-2.0-flash", "gemini-2.5-pro"]
# Railway injects PORT dynamically — fall back to 8000 for local dev
PORT = int(os.environ.get("PORT", 8000))

# ─── SYSTEM PROMPT ────────────────────────────────────────
SYSTEM_PROMPT = """You are an expert agricultural plant pathologist. Look at this leaf image carefully and classify the disease.

Rules:
1. You MUST pick the BEST matching class from this list — even if not 100% sure, pick the closest match.
2. Only use Unknown___disease if the image is NOT a plant/leaf at all (e.g. a car, person, etc.).
3. If the leaf looks healthy with no disease symptoms, pick the healthy class for that crop.
4. Respond with ONLY a JSON object. No markdown, no backticks, no explanation outside JSON.

Valid classes:
Corn___Cercospora_leaf_spot, Corn___Common_rust, Corn___Northern_Leaf_Blight, Corn___healthy,
Potato___Early_blight, Potato___Late_blight, Potato___healthy,
Rice___Brown_spot, Rice___Hispa, Rice___Leaf_blast, Rice___healthy,
Tomato___Bacterial_spot, Tomato___Early_blight, Tomato___Late_blight, Tomato___healthy

JSON format (respond with ONLY this, nothing else):
{"disease_class":"CLASS_NAME_HERE","confidence":85,"analysis":"Brief description of what you see","top3":[{"label":"CLASS1","prob":85},{"label":"CLASS2","prob":10},{"label":"CLASS3","prob":5}]}"""


def call_gemini(image_base64, mime_type):
    """Try multiple Gemini models with automatic fallback and retry"""
    last_error = None

    for model in GEMINI_MODELS:
        for attempt in range(2):  # Retry each model once
            try:
                if attempt > 0:
                    print(f"  ⏳ Retry {model} after 2s wait...")
                    time.sleep(2)
                else:
                    print(f"  🔄 Trying {model}...")

                url = f"https://generativelanguage.googleapis.com/v1beta/models/{model}:generateContent?key={API_KEY}"

                body = {
                    "contents": [{
                        "parts": [
                            {"text": SYSTEM_PROMPT},
                            {
                                "inline_data": {
                                    "mime_type": mime_type or "image/jpeg",
                                    "data": image_base64
                                }
                            }
                        ]
                    }],
                    "generationConfig": {
                        "temperature": 0.1,
                        "maxOutputTokens": 2048
                    }
                }

                # Disable thinking for 2.5 models (causes multi-part responses)
                if "2.5" in model:
                    body["generationConfig"]["thinkingConfig"] = {"thinkingBudget": 0}

                payload = json.dumps(body).encode("utf-8")

                req = urllib.request.Request(url, data=payload, headers={
                    "Content-Type": "application/json"
                })

                with urllib.request.urlopen(req, timeout=60) as resp:
                    data = json.loads(resp.read().decode("utf-8"))
                    # Extract text from ALL parts (2.5 models may return thinking + response)
                    parts = data.get("candidates", [{}])[0].get("content", {}).get("parts", [])
                    text = ""
                    for part in parts:
                        if "text" in part:
                            text = part["text"]  # Take the LAST text part (actual response)
                    print(f"  ✅ Success with {model}")
                    print(f"  📄 Raw response: {text[:300]}")
                    result = parse_ai_response(text)
                    if result.get("disease_class") != "Unknown___disease" or result.get("confidence", 0) > 0:
                        return result
                    # If Unknown with 0 confidence, try next model
                    print(f"  ⚠️ {model} returned Unknown, trying next model...")
                    last_error = "Model returned Unknown___disease"
                    break

            except urllib.error.HTTPError as e:
                error_body = e.read().decode("utf-8", errors="replace")
                print(f"  ⚠️ {model} failed ({e.code}): {error_body[:150]}")
                last_error = error_body

                if e.code == 429 or "quota" in error_body.lower() or "rate" in error_body.lower():
                    if attempt == 0:
                        continue  # Retry once
                    break  # Try next model
                elif e.code == 400 and "API_KEY_INVALID" in error_body:
                    return {"error": "Invalid API key. Please update your .env file with a valid Gemini API key."}
                else:
                    return {"error": f"API error ({e.code}): {error_body[:300]}"}

            except Exception as e:
                print(f"  ⚠️ {model} error: {str(e)}")
                last_error = str(e)
                break

    return {"error": "Quota exceeded on all models. Your API key's free tier is exhausted. Please generate a NEW key at https://aistudio.google.com/apikey and update the .env file."}


def parse_ai_response(text):
    """Parse JSON from AI response — handles code fences, extra text, truncation, etc."""
    import re
    cleaned = text.strip()
    print(f"  🔍 Parsing response ({len(cleaned)} chars)")

    # Remove markdown code fences
    if "```" in cleaned:
        match = re.search(r'```(?:json)?\s*\n?(.*?)\n?```', cleaned, re.DOTALL)
        if match:
            cleaned = match.group(1).strip()

    # Try to find JSON object in the text
    if not cleaned.startswith("{"):
        start = cleaned.find("{")
        if start != -1:
            cleaned = cleaned[start:]

    # Find the matching closing brace
    if cleaned.startswith("{"):
        depth = 0
        for i, ch in enumerate(cleaned):
            if ch == "{":
                depth += 1
            elif ch == "}":
                depth -= 1
                if depth == 0:
                    cleaned = cleaned[:i+1]
                    break

    # Attempt 1: Direct JSON parse
    try:
        result = json.loads(cleaned)
        return format_result(result)
    except (json.JSONDecodeError, ValueError):
        pass

    # Attempt 2: Fix truncated JSON — try to complete it
    for fix in ['}]}', ']}', '}']:
        try:
            result = json.loads(cleaned + fix)
            print(f"  🔧 Fixed truncated JSON with: {fix}")
            return format_result(result)
        except (json.JSONDecodeError, ValueError):
            continue

    # Attempt 3: Extract fields with regex
    print(f"  ⚠️ JSON parse failed, trying regex extraction...")
    print(f"  📄 Text was: {text[:400]}")
    disease_match = re.search(r'"disease_class"\s*:\s*"([^"]+)"', text)
    conf_match = re.search(r'"confidence"\s*:\s*(\d+\.?\d*)', text)
    analysis_match = re.search(r'"analysis"\s*:\s*"([^"]+)"', text)

    if disease_match:
        disease_class = disease_match.group(1)
        confidence = float(conf_match.group(1)) if conf_match else 75
        analysis = analysis_match.group(1) if analysis_match else "Disease identified via AI analysis."
        print(f"  ✅ Regex extracted: {disease_class} ({confidence}%)")

        # Extract top3 if possible
        top3 = []
        top3_matches = re.findall(r'"label"\s*:\s*"([^"]+)"\s*,\s*"prob"\s*:\s*(\d+\.?\d*)', text)
        for label, prob in top3_matches[:3]:
            top3.append({"label": label, "prob": min(100, max(0, float(prob)))})

        return {
            "disease_class": disease_class,
            "confidence": min(100, max(0, confidence)),
            "analysis": analysis,
            "top3": top3
        }

    return {
        "disease_class": "Unknown___disease",
        "confidence": 0,
        "analysis": "AI returned an unexpected format. Please try again.",
        "top3": []
    }


def format_result(result):
    """Normalize a parsed JSON result into our standard format"""
    return {
        "disease_class": result.get("disease_class", "Unknown___disease"),
        "confidence": min(100, max(0, float(result.get("confidence", 0)))),
        "analysis": result.get("analysis", ""),
        "top3": [
            {"label": p.get("label", "Unknown"), "prob": min(100, max(0, float(p.get("prob", 0))))}
            for p in result.get("top3", [])
        ]
    }


class CropGuardHandler(http.server.SimpleHTTPRequestHandler):
    """Custom handler: serves static files + /api/diagnose endpoint"""

    def do_POST(self):
        if self.path == "/api/diagnose":
            self.handle_diagnose()
        else:
            self.send_error(404, "Not Found")

    def do_OPTIONS(self):
        """Handle CORS preflight"""
        self.send_response(200)
        self.send_header("Access-Control-Allow-Origin", "*")
        self.send_header("Access-Control-Allow-Methods", "POST, OPTIONS")
        self.send_header("Access-Control-Allow-Headers", "Content-Type")
        self.end_headers()

    def handle_diagnose(self):
        try:
            content_length = int(self.headers.get("Content-Length", 0))
            body = self.rfile.read(content_length)
            data = json.loads(body)

            image_base64 = data.get("image")
            mime_type = data.get("mimeType", "image/jpeg")

            if not image_base64:
                self.send_json({"error": "No image provided"}, 400)
                return

            print(f"\n🔬 Diagnosis request received ({len(image_base64) // 1024}KB image)")

            result = call_gemini(image_base64, mime_type)
            self.send_json(result)

        except json.JSONDecodeError:
            self.send_json({"error": "Invalid JSON in request"}, 400)
        except Exception as e:
            print(f"❌ Server error: {e}")
            self.send_json({"error": str(e)}, 500)

    def send_json(self, data, status=200):
        response = json.dumps(data).encode("utf-8")
        self.send_response(status)
        self.send_header("Content-Type", "application/json")
        self.send_header("Access-Control-Allow-Origin", "*")
        self.send_header("Content-Length", len(response))
        self.end_headers()
        self.wfile.write(response)

    def log_message(self, format, *args):
        msg = format % args
        if "/api/" in msg:
            print(f"  📡 {msg}")
        elif "200" not in msg and "304" not in msg:
            print(f"  {msg}")


def main():
    print("=" * 55)
    print("  🌿 CropGuard AI Server")
    print("=" * 55)
    print(f"  📍 http://localhost:{PORT}")
    print(f"  🤖 AI Backend: Gemini (key from .env)")
    print(f"  🔑 Key: {API_KEY[:10]}...{API_KEY[-4:]}")
    print(f"  📁 Serving: {os.getcwd()}")
    print("=" * 55)
    print()

    server = http.server.HTTPServer(("", PORT), CropGuardHandler)
    try:
        server.serve_forever()
    except KeyboardInterrupt:
        print("\n\n👋 Server stopped.")
        server.server_close()


if __name__ == "__main__":
    main()
