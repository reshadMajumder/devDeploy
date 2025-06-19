# DevDeploy

DevDeploy is a cost-effective, developer-centric deployment platform designed for freelancers, beginner developers, and startups seeking an affordable alternative to solutions like Vercel or Render. The platform empowers users to deploy full-stack web projects with ease, leveraging their own infrastructure and modern DevOps practices.

## Key Features

- **User Accounts:** Create and manage your own account.
- **GitHub Integration:** Connect your GitHub repositories for seamless code management.
- **VPS Connection:** Remotely connect your own Virtual Private Server (VPS) using secure SSH credentials.
- **Full-Stack Deployments:** Deploy Dockerized web projects (frontend & backend) with CI/CD automation.
- **One-Time Fee:** Pay a low-cost, one-time service fee per VPS connection (e.g., ৳200), making DevDeploy especially affordable for developers in regions like Bangladesh.
- **Real-Time Logs:** Access real-time deployment logs and status updates.

## Goals and Objectives

- Offer a simple and intuitive deployment experience.
- Eliminate the need for in-depth DevOps or server knowledge.
- Enable automated builds and deployments from GitHub to user VPS.
- Ensure secure storage and handling of SSH credentials.
- Provide real-time logs and deployment status.
- Make the platform affordable and accessible.

## Technology Stack

- **Backend:** Django REST Framework (DRF)
- **Frontend:** React (Vite + Tailwind CSS)
- **CI/CD:** Automated pipelines for building and deploying Dockerized projects
- **VPS Integration:** SSH-based secure connections

## Getting Started

### Prerequisites
- Python 3.10+
- Node.js 18+
- Docker (for deployments)
- A VPS with SSH access

### Backend Setup (Django + DRF)
1. Navigate to the `core/` directory:
   ```sh
   cd core
   ```
2. Create and activate a virtual environment (optional but recommended):
   ```sh
   python -m venv env
   env\Scripts\activate  # On Windows
   source env/bin/activate  # On Linux/Mac
   ```
3. Install dependencies:
   ```sh
   pip install -r requirements.txt
   ```
4. Run migrations and start the server:
   ```sh
   python manage.py migrate
   python manage.py runserver
   ```

### Frontend Setup (React)
1. Navigate to the `frontend/` directory:
   ```sh
   cd frontend
   ```
2. Install dependencies:
   ```sh
   npm install
   ```
3. Start the development server:
   ```sh
   npm run dev
   ```

## Deployment Workflow
1. **Connect GitHub:** Link your GitHub account and select a repository.
2. **Add VPS:** Provide your VPS SSH credentials securely.
3. **Configure Project:** Set up your Dockerized project for deployment.
4. **Automated CI/CD:** Push to GitHub to trigger automated builds and deployments to your VPS.
5. **Monitor:** View real-time logs and deployment status from the dashboard.

## Security
- All SSH credentials are securely stored and handled.
- Only authorized users can access and manage their deployments.

## Contributing
Contributions are welcome! Please open issues or submit pull requests for improvements, bug fixes, or new features.

## License
This project is licensed under the MIT License.

---

**DevDeploy** aims to democratize modern DevOps for emerging tech professionals by reducing complexity and recurring costs. Join us in making deployment accessible for everyone!
