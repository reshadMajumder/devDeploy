# deployer/views.py
import os
from rest_framework.decorators import api_view, parser_classes
from rest_framework.parsers import MultiPartParser, FormParser
from rest_framework.response import Response
from .utils import connect_vps
from .utils import write_pem_tempfile, generate_dockerfile, generate_docker_compose, generate_nginx_conf
from .models import Deployment, VPS

@api_view(['POST'])
@parser_classes([MultiPartParser, FormParser])
def connect_vps_view(request):
    ip = request.data.get('ip')
    name = request.data.get('name')
    pem_file = request.FILES.get('pem_file')
    if not pem_file or not ip or not name:
        return Response({'status': 'error', 'message': 'Missing required fields'})
    try:
        pem_content = pem_file.read()
        vps_obj, created = VPS.objects.update_or_create(
            ip_address=ip,
            defaults={
                'name': name,
                'pem_file_name': pem_file.name,
                'pem_file_content': pem_content,
                'connected': False  # Initially false, update after success
            }
        )
        pem_path = write_pem_tempfile(pem_file.name, pem_content)
        ssh = connect_vps(ip, pem_path)
        ssh.close()
        os.unlink(pem_path)

        vps_obj.connected = True
        vps_obj.save()

        return Response({'status': 'success', 'message': 'VPS connected successfully'})
    except Exception as e:
        VPS.objects.update_or_create(
            ip_address=ip,
            defaults={
                'name': name,
                'pem_file_name': pem_file.name,
                'pem_file_content': pem_content,
                'connected': False
            }
        )
        return Response({'status': 'error', 'message': str(e)})

@api_view(['POST'])
def install_dependencies(request):
    ip = request.data.get('ip')
    if not ip:
        return Response({'status': 'error', 'message': 'IP is required'})
    try:
        vps = VPS.objects.get(ip_address=ip)
        pem_path = write_pem_tempfile(vps.pem_file_name, vps.pem_file_content)
        ssh = connect_vps(ip, pem_path)

        commands = [
            # Update and basic tools
            "sudo apt update",
            "sudo apt install -y git curl python3 python3-pip python3-venv",
            # Docker
            "sudo apt install -y docker.io",
            "sudo systemctl enable docker",
            "sudo systemctl start docker",
            # Docker Compose (modern Ubuntu: as plugin)
            "sudo apt install -y docker-compose || sudo apt install -y docker-compose-plugin || true",
            # Nginx
            "sudo apt install -y nginx"
        ]
        failed = []
        details = []
        for cmd in commands:
            stdin, stdout, stderr = ssh.exec_command(cmd)
            exit_status = stdout.channel.recv_exit_status()
            out = stdout.read().decode()
            err = stderr.read().decode()
            details.append({
                'command': cmd,
                'exit_status': exit_status,
                'stdout': out,
                'stderr': err
            })
            if exit_status != 0:
                failed.append({'command': cmd, 'stderr': err})
        ssh.close()
        os.unlink(pem_path)

        if failed:
            return Response({'status': 'error', 'message': 'Some commands failed', 'details': details, 'failed': failed})
        return Response({'status': 'success', 'message': 'Dependencies installed', 'details': details})
    except VPS.DoesNotExist:
        return Response({'status': 'error', 'message': 'VPS not found. Connect VPS first.'})
    except Exception as e:
        return Response({'status': 'error', 'message': str(e)})

@api_view(['POST'])
@parser_classes([MultiPartParser, FormParser])
def deploy_project(request):
    ip = request.data.get('ip')
    repo_url = request.data.get('repo_url')
    django_root = request.data.get('django_root')
    wsgi_path = request.data.get('wsgi_path')
    env_file = request.FILES.get('env_file')

    if not ip or not repo_url or not django_root or not wsgi_path:
        return Response({'status': 'error', 'message': 'Missing required fields'})

    try:
        vps = VPS.objects.get(ip_address=ip)
        pem_path = write_pem_tempfile(vps.pem_file_name, vps.pem_file_content)
        ssh = connect_vps(ip, pem_path)
        project_name = os.path.basename(repo_url).replace('.git', '')

        # Remove any existing project folder
        ssh.exec_command(f"rm -rf {project_name}")
        ssh.exec_command(f"git clone {repo_url}")

        dockerfile = generate_dockerfile(wsgi_path)
        # Compose file: include env_file only if env_file is present
        if env_file:
            compose_file = '''
version: '3.8'
services:
  web:
    build: .
    env_file:
      - .env
    expose:
      - "8000"
    volumes:
      - .:/app
    restart: always
  nginx:
    image: nginx:latest
    ports:
      - "80:80"
    volumes:
      - ./nginx.conf:/etc/nginx/conf.d/default.conf
      - ./static:/app/static
    depends_on:
      - web
'''
        else:
            compose_file = '''
version: '3.8'
services:
  web:
    build: .
    expose:
      - "8000"
    volumes:
      - .:/app
    restart: always
  nginx:
    image: nginx:latest
    ports:
      - "80:80"
    volumes:
      - ./nginx.conf:/etc/nginx/conf.d/default.conf
      - ./static:/app/static
    depends_on:
      - web
'''
        # Nginx conf for Dockerized setup
        nginx_conf = '''
server {
    listen 80;
    server_name _;

    location /static/ {
        alias /app/static/;
    }

    location / {
        proxy_pass http://web:8000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
'''

        remote_path = f"/home/ubuntu/{project_name}/{django_root}"
        sftp = ssh.open_sftp()

        for filename, content in {
            "Dockerfile": dockerfile,
            "docker-compose.yml": compose_file,
            "nginx.conf": nginx_conf
        }.items():
            with sftp.file(f"{remote_path}/{filename}", 'w') as f:
                f.write(content)

        if env_file:
            with sftp.file(f"{remote_path}/.env", 'w') as f:
                for chunk in env_file.chunks():
                    f.write(chunk.decode('utf-8'))

        sftp.close()

        # Build and run docker-compose, capture output
        start_cmd = f"cd {project_name}/{django_root} && sudo docker-compose up --build -d"
        stdin, stdout, stderr = ssh.exec_command(start_cmd)
        exit_status = stdout.channel.recv_exit_status()
        out = stdout.read().decode()
        err = stderr.read().decode()

        ssh.close()
        os.unlink(pem_path)

        if exit_status != 0:
            return Response({'status': 'error', 'message': 'docker-compose up failed', 'stdout': out, 'stderr': err})

        Deployment.objects.create(
            ip_address=ip,
            repo_url=repo_url,
            django_root=django_root,
            wsgi_path=wsgi_path,
            status="deployed"
        )

        return Response({'status': 'success', 'message': f'Project deployed at http://{ip}', 'stdout': out})
    except VPS.DoesNotExist:
        return Response({'status': 'error', 'message': 'VPS not found. Connect VPS first.'})
    except Exception as e:
        return Response({'status': 'error', 'message': str(e)})

@api_view(['POST'])
def redeploy_project(request):
    ip = request.data.get('ip')
    django_root = request.data.get('django_root')
    repo_url = request.data.get('repo_url')
    if not ip or not django_root or not repo_url:
        return Response({'status': 'error', 'message': 'Missing required fields'})
    try:
        vps = VPS.objects.get(ip_address=ip)
        pem_path = write_pem_tempfile(vps.pem_file_name, vps.pem_file_content)
        ssh = connect_vps(ip, pem_path)
        project_name = os.path.basename(repo_url).replace('.git', '')
        remote_path = f"/home/ubuntu/{project_name}/{django_root}"
        # Stop and remove running containers, then rebuild and restart
        commands = [
            f"cd {remote_path} && sudo docker-compose down",
            f"cd {remote_path} && sudo docker-compose up --build -d"
        ]
        details = []
        failed = []
        for cmd in commands:
            stdin, stdout, stderr = ssh.exec_command(cmd)
            exit_status = stdout.channel.recv_exit_status()
            out = stdout.read().decode()
            err = stderr.read().decode()
            details.append({
                'command': cmd,
                'exit_status': exit_status,
                'stdout': out,
                'stderr': err
            })
            if exit_status != 0:
                failed.append({'command': cmd, 'stderr': err})
        ssh.close()
        os.unlink(pem_path)
        if failed:
            return Response({'status': 'error', 'message': 'Some commands failed', 'details': details, 'failed': failed})
        return Response({'status': 'success', 'message': 'Project redeployed', 'details': details})
    except VPS.DoesNotExist:
        return Response({'status': 'error', 'message': 'VPS not found. Connect VPS first.'})
    except Exception as e:
        return Response({'status': 'error', 'message': str(e)})
