import time


def generate_dockerfile():
    return '''
FROM node:18 AS build
WORKDIR /app
COPY . .
RUN npm install && npm run build

FROM node:18 AS serve
WORKDIR /app
COPY --from=build /app/dist ./dist
RUN npm install -g serve
EXPOSE 3000
CMD ["serve", "-s", "dist", "-l", "3000"]
'''

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
        "      - '3000:3000'",
        "    volumes:",
        "      - .:/app",
        "    restart: always"
    ]
    return '\n'.join(compose)

def generate_system_nginx_conf(server_name: str, spa_mode: bool = False):
    # For React SPA with serve, do NOT use try_files; let serve handle SPA fallback
    return f'''
server {{
    listen 80;
    server_name {server_name};

    location / {{
        proxy_pass http://127.0.0.1:3000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_redirect off;
    }}
}}
'''

def generate_build_dockerfile():
    return '''
FROM node:18 AS build
WORKDIR /app
COPY . .
RUN npm install && npm run build
'''

def generate_static_nginx_conf(server_name: str, static_root: str):
    return f'''
server {{
    listen 80;
    server_name {server_name};
    root {static_root};
    index index.html;
    location / {{
        try_files $uri /index.html;
    }}
}}
'''

def copy_dist_from_container(ssh, project_name, app_root, container_name, remote_dist_path):
    # Copy /app/dist from container to remote_dist_path on host
    # remote_dist_path: e.g. /home/ubuntu/{project_name}/dist
    # Remove old dist if exists
    ssh.exec_command(f"rm -rf {remote_dist_path}")
    # docker cp: container:/app/dist to remote_dist_path
    cmd = f"sudo docker cp {container_name}:/app/{app_root}/dist {remote_dist_path}"
    stdin, stdout, stderr = ssh.exec_command(cmd)
    exit_status = stdout.channel.recv_exit_status()
    if exit_status != 0:
        raise Exception(f"Failed to copy dist from container: {stderr.read().decode()}")

def upload_and_enable_nginx_conf(ssh, sftp, conf_content, server_name, ssl=False):
    """
    Upload nginx config to /home/ubuntu/{server_name}, move to /etc/nginx/sites-available/{server_name} with sudo, symlink to sites-enabled, and reload nginx. Remove any old config/symlink first. Test config before reload. Optionally support SSL.
    """
    user_tmp_path = f"/home/ubuntu/{server_name}"
    remote_conf_path = f"/etc/nginx/sites-available/{server_name}"
    # Remove old config and symlink if they exist
    cleanup_cmds = [
        f"sudo rm -f {remote_conf_path}",
        f"sudo rm -f /etc/nginx/sites-enabled/{server_name}"
    ]
    for cmd in cleanup_cmds:
        ssh.exec_command(cmd)
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
            error = stderr.read().decode()
            raise Exception(f"Failed to run '{cmd}': {error}")

def sftp_mkdirs_react(sftp, remote_directory):
    dirs = remote_directory.strip('/').split('/')
    path = ''
    for d in dirs:
        path += '/' + d
        try:
            sftp.stat(path)
        except FileNotFoundError:
            sftp.mkdir(path)

def sftp_write_files_react(sftp, remote_path, files_dict):
    sftp_mkdirs_react(sftp, remote_path)
    for filename, content in files_dict.items():
        with sftp.file(f"{remote_path}/{filename}", 'w') as f:
            f.write(content)

def generate_build_docker_compose():
    return '''
version: '3.8'
services:
  build:
    build: .
    container_name: react_build_container
    command: tail -f /dev/null
'''

def build_and_copy_dist_with_compose(ssh, project_name, app_root, remote_dist_path):
    compose_dir = f"/home/ubuntu/{project_name}/{app_root}"
    ssh.exec_command(f"rm -rf {remote_dist_path}")
    build_cmd = f"cd {compose_dir} && sudo docker-compose up --build -d"
    # Log output for debugging
    stdin, stdout, stderr = ssh.exec_command(build_cmd)
    build_out = stdout.read().decode()
    build_err = stderr.read().decode()
    # Wait for the container to be up
    container_name = "react_build_container"
    for _ in range(10):
        stdin, stdout, stderr = ssh.exec_command(f"sudo docker ps -a --format '{{{{.Names}}}}' | grep -w {container_name}")
        if stdout.read().decode().strip() == container_name:
            break
        time.sleep(1)
    else:
        raise Exception(f"Build container {container_name} did not start.\nCompose output:\n{build_out}\n{build_err}")
    copy_cmd = f"sudo docker cp {container_name}:/app/dist {remote_dist_path}"
    stdin, stdout, stderr = ssh.exec_command(copy_cmd)
    exit_status = stdout.channel.recv_exit_status()
    if exit_status != 0:
        raise Exception(f"Failed to copy dist from build container: {stderr.read().decode()}\nCompose output:\n{build_out}\n{build_err}")
    down_cmd = f"cd {compose_dir} && sudo docker-compose down"
    ssh.exec_command(down_cmd)