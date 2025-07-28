import jwt
from django.conf import settings
from rest_framework.response import Response

def jwt_required(view_func):
    def _wrapped_view(request, *args, **kwargs):
        auth = (
            request.META.get("HTTP_AUTHORIZATION") or
            request.META.get("HTTP_X_AUTHORIZATION", "")
        )
        if not auth.startswith("Bearer "):
            return Response({"error": "Missing token"}, status=401)
        token = auth.split(" ")[1]
        try:
            payload = jwt.decode(token, settings.JWT_SECRET, algorithms=[settings.JWT_ALGORITHM])
            request.jwt_payload = payload  # Attach payload to request for use in view
            return view_func(request, *args, **kwargs)
        except jwt.InvalidTokenError:
            return Response({"error": "Invalid token"}, status=401)
    return _wrapped_view 