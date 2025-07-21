
from django.contrib import admin
from django.urls import path
from .views import deploy_project

urlpatterns = [
    path("deploy/",deploy_project,name='deploy-react')
]
