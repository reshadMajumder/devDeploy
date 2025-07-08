# deployer/ssh_utils.py
import paramiko

def connect_vps(ip, pem_path, username="ubuntu"):
    ssh = paramiko.SSHClient()
    ssh.set_missing_host_key_policy(paramiko.AutoAddPolicy())
    ssh.connect(ip, username=username, key_filename=pem_path)
    return ssh


# deployer/utils.py
import os
import tempfile

def write_pem_tempfile(pem_name, pem_content):
    temp_file = tempfile.NamedTemporaryFile(delete=False, suffix=f"_{pem_name}")
    temp_file.write(pem_content)
    temp_file.flush()
    temp_file.close()
    os.chmod(temp_file.name, 0o600)
    return temp_file.name

def generate_dockerfile(wsgi_path):
    project_module = wsgi_path.split("/")[-2]  # Get Django project module name
    return f"""
FROM python:3.10
WORKDIR /app
COPY . /app
RUN pip install --upgrade pip && pip install -r requirements.txt
CMD gunicorn {project_module}.wsgi:application --bind 0.0.0.0:8000
"""

def generate_docker_compose():
    return """
version: '3.8'
services:
  web:
    build: .
    env_file:
      - .env
    ports:
      - "8000:8000"
    volumes:
      - .:/app
    restart: always
"""

def generate_nginx_conf():
    return """
server {
    listen 80;
    server_name _;

    location /static/ {
        alias /app/static/;
    }

    location / {
        proxy_pass http://127.0.0.1:8000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
"""
