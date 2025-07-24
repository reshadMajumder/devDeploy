# devDeploy

A full-stack deployment manager for Django and React projects.

## Features
- Django backend for managing VPS, deployments, and Docker containers
- React frontend dashboard for managing deployments and VPS
- Automated deployment to remote servers via SSH
- Docker-based project builds and Nginx configuration

---

## Getting Started

### 1. Clone the Repository
```bash
# Clone the repo
git clone <your-repo-url>
cd devDeploy
```

---

### 2. Backend (Django)

#### a. Create and activate a virtual environment
```bash
cd core
python3 -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
```

#### b. Install dependencies
```bash
pip install -r requirements.txt
```

#### c. Run migrations
```bash
python manage.py migrate
```

#### d. Start the Django server
```bash
python manage.py runserver 0.0.0.0:8000
```

The backend API will be available at `http://127.0.0.1:8000/`

---

### 3. Frontend (React)

#### a. Install dependencies
```bash
cd ../frontend
npm install
```

#### b. Start the React development server
```bash
npm run dev
```

The frontend will be available at `http://localhost:5173/` (or as shown in your terminal).

---

## 4. Environment Variables
- For Django, you can use a `.env` file in the `core` directory for secrets and settings.
- For React, you can use a `.env` file in the `frontend` directory for frontend environment variables.

---

## 5. Usage
- Access the React dashboard at `http://localhost:5173/`.
- Use the dashboard to add VPS, deploy projects, and manage Docker containers.
- The backend API endpoints are available under `/api/django/` (see code for details).

---

## 6. Notes
- Make sure Docker and docker-compose are installed on your VPS/servers.
- The backend uses SSH and PEM files to connect to remote servers for deployment.
- For production, configure allowed hosts, HTTPS, and secure your secrets.

---

## 7. Project Structure
```
devDeploy/
  core/         # Django backend
  frontend/     # React frontend
```

---

## 8. License
MIT 
