import requests
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from django.conf import settings
import json
import jwt
from django.utils.decorators import method_decorator
from django.views import View

@csrf_exempt
def login(request):
    if request.method != "POST":
        return JsonResponse({"error": "POST required"}, status=405)
    data = json.loads(request.body)
    resp = requests.post(settings.SPRING_AUTH_URL, json=data)
    if resp.status_code == 200:
        return JsonResponse(resp.json())
    return JsonResponse({"error": "Invalid credentials"}, status=401)


def protected_view(request):
    auth = request.headers.get("Authorization", "")
    if not auth.startswith("Bearer "):
        return JsonResponse({"error": "Missing token"}, status=401)
    token = auth.split(" ")[1]
    try:
        payload = jwt.decode(token, settings.JWT_SECRET, algorithms=[settings.JWT_ALGORITHM])
        return JsonResponse({"message": f"Hello, {payload.get('username', 'user')}!"})
    except jwt.InvalidTokenError:
        return JsonResponse({"error": "Invalid token"}, status=401)
