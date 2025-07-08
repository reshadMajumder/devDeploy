# deployer/models.py
from django.db import models

class VPS(models.Model):
    name = models.CharField(max_length=100)
    ip_address = models.GenericIPAddressField(unique=True)
    pem_file_name = models.CharField(max_length=255, null=True, blank=True)
    pem_file_content = models.BinaryField(null=True, blank=True)  # PEM file binary content
    connected = models.BooleanField(default=False)

    def __str__(self):
        return f"{self.name} ({'Connected' if self.connected else 'Disconnected'})"

class Deployment(models.Model):
    ip_address = models.GenericIPAddressField()
    repo_url = models.URLField()
    django_root = models.CharField(max_length=255)
    wsgi_path = models.CharField(max_length=255)
    deployed_at = models.DateTimeField(auto_now_add=True)
    status = models.CharField(max_length=50, default="pending")

    def __str__(self):
        return f"Deployment to {self.ip_address} ({self.status})"
