# deployer/models.py
from django.db import models

class VPS(models.Model):
    name = models.CharField(max_length=100)
    ip_address = models.GenericIPAddressField(unique=True)
    pem_file_name = models.CharField(max_length=255, null=True, blank=True)
    pem_file_content = models.BinaryField(null=True, blank=True)  # PEM file binary content
    connected = models.BooleanField(default=False)
    username = models.CharField(max_length=150, null=True, blank=True)  # Track user

    def __str__(self):
        return f"{self.name} ({'Connected' if self.connected else 'Disconnected'})"

class Deployment(models.Model):
    ip_address = models.GenericIPAddressField()
    repo_url = models.URLField()
    django_root = models.CharField(max_length=255)
    wsgi_path = models.CharField(max_length=255,null=True, blank=True)
    deployed_at = models.DateTimeField(auto_now_add=True)
    status = models.CharField(max_length=50, default="pending")
    username = models.CharField(max_length=150, null=True, blank=True)  # Track user

    def __str__(self):
        return f"Deployment to {self.ip_address} ({self.status})"




# using amazon ec2
class UserInstance(models.Model):
    instance_id = models.CharField(max_length=50)
    ip_address = models.GenericIPAddressField()
    started_at = models.DateTimeField(auto_now_add=True)
    stopped_at = models.DateTimeField(null=True, blank=True)
    status = models.CharField(max_length=20, default='running')
    hourly_rate = models.DecimalField(max_digits=6, decimal_places=3, default=0.020)

    def runtime_hours(self):
        from django.utils.timezone import now
        end = self.stopped_at or now()
        return round((end - self.started_at).total_seconds() / 3600, 2)

    def estimated_cost(self):
        return round(self.runtime_hours() * float(self.hourly_rate), 4)
