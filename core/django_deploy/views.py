# deployer/views.py
import os
from rest_framework.decorators import api_view, parser_classes
from rest_framework.parsers import MultiPartParser, FormParser
from rest_framework.response import Response
from .utils import connect_vps
from .utils import write_pem_tempfile, generate_dockerfile, generate_docker_compose, generate_nginx_conf
from .utils import generate_docker_compose_for_deploy, generate_nginx_conf_for_deploy, sftp_write_files, sftp_write_env_file
from .utils import generate_system_nginx_conf, upload_and_enable_nginx_conf
from .models import Deployment, VPS


from .aws import create_instance
from .models import UserInstance
from django.utils.timezone import now





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
    server_name = request.data.get('server_name', ip)  # allow custom domain, fallback to IP

    project_name = os.path.basename(repo_url).replace('.git', '')
    if not django_root:
        django_root = project_name

    if not ip or not repo_url or  not wsgi_path:
        return Response({'status': 'error', 'message': 'Missing required fields'})

    try:
        vps = VPS.objects.get(ip_address=ip)
        pem_path = write_pem_tempfile(vps.pem_file_name, vps.pem_file_content)
        ssh = connect_vps(ip, pem_path)

        # Remove any existing project folder
        ssh.exec_command(f"rm -rf {project_name}")
        ssh.exec_command(f"git clone {repo_url}")

        # Generate deployment files using utils
        dockerfile = generate_dockerfile(wsgi_path)
        # Compose file: only web service, no nginx, no static volume, .env only if present
        compose_file = generate_docker_compose(env_file=bool(env_file))
        remote_path = f"/home/ubuntu/{project_name}/{django_root}"
        sftp = ssh.open_sftp()

        # Write Dockerfile, docker-compose.yml
        sftp_write_files(sftp, remote_path, {
            "Dockerfile": dockerfile,
            "docker-compose.yml": compose_file
        })

        # Write .env if provided
        if env_file:
            sftp_write_env_file(sftp, remote_path, env_file)

        # Generate and upload system nginx config
        nginx_conf = generate_system_nginx_conf(server_name)
        upload_and_enable_nginx_conf(ssh, sftp, nginx_conf, server_name)

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

        return Response({'status': 'success', 'message': f'Project deployed at http://{server_name}', 'stdout': out})
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
        # Stop and remove running containers,git pull then rebuild and restart
        commands = [
            f"cd {remote_path} && sudo docker-compose down",
            # f"cd {remote_path} && git pull",
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




@api_view(['POST'])
@parser_classes([MultiPartParser, FormParser])
def deploy_project_aws(request):
    repo_url = request.data.get('repo_url')
    django_root = request.data.get('django_root')
    wsgi_path = request.data.get('wsgi_path')
    env_file = request.FILES.get('env_file')

    try:
        # 🔥 Create EC2 instance
        instance_id, ip_address = create_instance()

        # 💾 Save to DB
        UserInstance.objects.create(
            instance_id=instance_id,
            ip_address=ip_address
        )

        # 🔐 Connect via SSH
        pem_path = '/path/to/deploy-key.pem'  # Your local .pem path
        ssh = connect_vps(ip_address, pem_path)

        # 🧰 Install dependencies
        commands = [
            "sudo apt update",
            "sudo apt install -y git docker.io docker-compose nginx",
            "sudo systemctl enable docker",
            "sudo systemctl start docker"
        ]
        for cmd in commands:
            ssh.exec_command(cmd)

        # 📦 Clone repo and deploy (same as before)
        project_name = os.path.basename(repo_url).replace('.git', '')
        django_root = request.data.get('django_root')
        project_name = os.path.basename(repo_url).replace('.git', '')
        if not django_root:
            django_root = project_name
        dockerfile = generate_dockerfile(wsgi_path)
        compose_file = generate_docker_compose(env_file=bool(env_file))
        remote_path = f"/home/ubuntu/{project_name}/{django_root}"
        ssh.exec_command(f"rm -rf {project_name}")
        ssh.exec_command(f"git clone {repo_url}")
        sftp = ssh.open_sftp()
        sftp_write_files(sftp, remote_path, {
            "Dockerfile": dockerfile,
            "docker-compose.yml": compose_file
        })
        if env_file:
            sftp_write_env_file(sftp, remote_path, env_file)
        nginx_conf = generate_system_nginx_conf(ip_address)
        upload_and_enable_nginx_conf(ssh, sftp, nginx_conf, ip_address)
        sftp.close()
        start_cmd = f"cd {project_name}/{django_root} && sudo docker-compose up --build -d"
        stdin, stdout, stderr = ssh.exec_command(start_cmd)
        exit_status = stdout.channel.recv_exit_status()
        out = stdout.read().decode()
        err = stderr.read().decode()
        ssh.close()
        if exit_status != 0:
            return Response({'status': 'error', 'message': 'docker-compose up failed', 'stdout': out, 'stderr': err})
        return Response({'status': 'success', 'message': f'Deployed at http://{ip_address}', 'stdout': out})
    except Exception as e:
        return Response({'status': 'error', 'message': str(e)})



@api_view(['GET'])
def docker_containers(request):
    """List all Docker containers (running and stopped) on the VPS."""
    ip = request.data.get('ip')
    if not ip:
        return Response({'status': 'error', 'message': 'Missing required field: ip'})
    try:
        vps = VPS.objects.get(ip_address=ip)
        pem_path = write_pem_tempfile(vps.pem_file_name, vps.pem_file_content)
        ssh = connect_vps(ip, pem_path)
        cmd = "sudo docker ps -a --format '{{json .}}'"
        stdin, stdout, stderr = ssh.exec_command(cmd)
        containers = [eval(line) for line in stdout.read().decode().splitlines() if line.strip()]
        ssh.close()
        os.unlink(pem_path)
        return Response({'status': 'success', 'containers': containers})
    except Exception as e:
        return Response({'status': 'error', 'message': str(e)})

@api_view(['POST'])
def delete_docker_container(request):
    """Delete a Docker container by name or ID on the VPS."""
    ip = request.data.get('ip')
    container = request.data.get('container')
    if not ip or not container:
        return Response({'status': 'error', 'message': 'Missing required fields: ip, container'})
    try:
        vps = VPS.objects.get(ip_address=ip)
        pem_path = write_pem_tempfile(vps.pem_file_name, vps.pem_file_content)
        ssh = connect_vps(ip, pem_path)
        cmd = f"sudo docker rm -f {container}"
        stdin, stdout, stderr = ssh.exec_command(cmd)
        out = stdout.read().decode()
        err = stderr.read().decode()
        ssh.close()
        os.unlink(pem_path)
        if err.strip():
            return Response({'status': 'error', 'message': err.strip()})
        return Response({'status': 'success', 'message': out.strip()})
    except Exception as e:
        return Response({'status': 'error', 'message': str(e)})


