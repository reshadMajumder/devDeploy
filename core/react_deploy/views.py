from django.shortcuts import render
from rest_framework.decorators import api_view, parser_classes
from rest_framework.response import Response
from rest_framework.parsers import MultiPartParser, FormParser
import os
# Create your views here.
from django_deploy.utils import sftp_write_files, sftp_write_env_file, connect_vps, write_pem_tempfile
from django_deploy.models import VPS, Deployment
from .utils import generate_build_dockerfile, generate_build_docker_compose, generate_static_nginx_conf, build_and_copy_dist_with_compose, upload_and_enable_nginx_conf, sftp_write_files_react





@api_view(['POST'])
@parser_classes([MultiPartParser, FormParser])
def deploy_project(request):
    ip = request.data.get('ip')
    repo_url = request.data.get('repo_url')
    app_root = request.data.get('app_root')
    # If app_root is not set, use the repo root (project_name)
    project_name = os.path.basename(repo_url).replace('.git', '')
    if not app_root:
        app_root = '.'
    env_file = request.FILES.get('env_file')
    server_name = request.data.get('server_name', ip)  # allow custom domain, fallback to IP

    if not ip or not repo_url or not app_root:
        return Response({'status': 'error', 'message': 'Missing required fields'})

    try:
        vps = VPS.objects.get(ip_address=ip)
        pem_path = write_pem_tempfile(vps.pem_file_name, vps.pem_file_content)
        ssh = connect_vps(ip, pem_path)

        # Remove any existing project folder
        ssh.exec_command(f"rm -rf {project_name}")
        ssh.exec_command(f"git clone {repo_url}")

        # Generate build-only Dockerfile and docker-compose.yml
        dockerfile = generate_build_dockerfile()
        compose_file = generate_build_docker_compose()
        remote_path = f"/home/ubuntu/{project_name}/{app_root}"
        sftp = ssh.open_sftp()
        sftp_write_files_react(sftp, remote_path, {"Dockerfile": dockerfile, "docker-compose.yml": compose_file})
        if env_file:
            sftp_write_env_file(sftp, remote_path, env_file)
        sftp.close()

        # Build and copy dist using docker compose
        remote_dist_path = f"/home/ubuntu/{project_name}/dist"
        build_and_copy_dist_with_compose(ssh, project_name, app_root, remote_dist_path)

        # Generate and upload nginx config to serve static files
        nginx_conf = generate_static_nginx_conf(server_name, static_root=remote_dist_path)
        sftp = ssh.open_sftp()
        upload_and_enable_nginx_conf(ssh, sftp, nginx_conf, server_name)
        sftp.close()

        ssh.close()
        os.unlink(pem_path)

        Deployment.objects.create(
            ip_address=ip,
            repo_url=repo_url,
            django_root=app_root,
            status="deployed"
        )

        return Response({'status': 'success', 'message': f'Project deployed at http://{server_name}'})
    except VPS.DoesNotExist:
        return Response({'status': 'error', 'message': 'VPS not found. Connect VPS first.'})
    except Exception as e:
        return Response({'status': 'error', 'message': str(e)})


