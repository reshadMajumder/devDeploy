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

def generate_docker_compose(env_file: bool = True):
    compose = [
        "version: '3.8'",
        "services:",
        "  web:",
        "    build: .",
    ]
    if env_file:
        compose.append("    env_file:\n      - .env")
    compose += [
        "    ports:",
        "      - '8000:8000'",
        "    volumes:",
        "      - .:/app",
        "    restart: always"
    ]
    return '\n'.join(compose)

def generate_docker_compose_for_deploy(env_file: bool = False):
    # For backward compatibility, but now just calls generate_docker_compose
    return generate_docker_compose(env_file)

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

def generate_nginx_conf_for_deploy():
    return '''
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

def generate_system_nginx_conf(server_name: str, static_root: str = "/home/ubuntu/static", media_root: str = "/home/ubuntu/media", proxy_port: int = 8000, ssl: bool = False):
    """
    Generate nginx config for system nginx (not Docker), proxying to Dockerized Django app.
    If ssl=True, include commented SSL config for easy enabling.
    """
    ssl_block = '''
    # listen 443 ssl;
    # ssl_certificate /etc/letsencrypt/live/{server_name}/fullchain.pem;
    # ssl_certificate_key /etc/letsencrypt/live/{server_name}/privkey.pem;
    ''' if ssl else ''
    return f'''
server {{
    listen 80;
    server_name {server_name};
{ssl_block}
    location /static/ {{
        alias {static_root}/;
    }}
    location /media/ {{
        alias {media_root}/;
    }}
    location / {{
        proxy_pass http://127.0.0.1:{proxy_port};
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_redirect off;
    }}
}}
'''

def upload_and_enable_nginx_conf(ssh, sftp, conf_content, server_name):
    """
    Upload nginx config to /home/ubuntu/{server_name}, move to /etc/nginx/sites-available/{server_name} with sudo, symlink to sites-enabled, and reload nginx.
    """
    user_tmp_path = f"/home/ubuntu/{server_name}"
    remote_conf_path = f"/etc/nginx/sites-available/{server_name}"
    # Upload to user-writable location
    with sftp.file(user_tmp_path, 'w') as f:
        f.write(conf_content)
    # Move to nginx config dir and reload
    commands = [
        f"sudo mv {user_tmp_path} {remote_conf_path}",
        f"sudo ln -sf {remote_conf_path} /etc/nginx/sites-enabled/{server_name}",
        "sudo nginx -t",
        "sudo systemctl reload nginx"
    ]
    for cmd in commands:
        stdin, stdout, stderr = ssh.exec_command(cmd)
        exit_status = stdout.channel.recv_exit_status()
        if exit_status != 0:
            raise Exception(f"Failed to run '{cmd}': {stderr.read().decode()}")

def sftp_write_files(sftp, remote_path, files_dict):
    """
    Write multiple files to a remote path using SFTP.
    files_dict: {filename: content}
    """
    for filename, content in files_dict.items():
        with sftp.file(f"{remote_path}/{filename}", 'w') as f:
            f.write(content)

def sftp_write_env_file(sftp, remote_path, env_file):
    with sftp.file(f"{remote_path}/.env", 'w') as f:
        for chunk in env_file.chunks():
            f.write(chunk.decode('utf-8'))
