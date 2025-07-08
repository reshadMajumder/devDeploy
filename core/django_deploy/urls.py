

# deployer/urls.py
from django.urls import path
from . import views

urlpatterns = [
    path('connect-vps/', views.connect_vps_view),
    path('install-dependencies/', views.install_dependencies),
    path('deploy-project/', views.deploy_project),
]