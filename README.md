# 🚀 DevDeploy

**DevDeploy** is a next-gen, developer-centric deployment platform built for freelancers, beginners, and startups who want a powerful, affordable alternative to Vercel or Render. Deploy your full-stack projects to your own VPS with just a few clicks—no DevOps expertise required.

---

## 🌟 Why DevDeploy?
- **No Recurring Fees:** Pay a one-time, ultra-low service fee per VPS (e.g., ৳200)
- **Bring Your Own VPS:** Full control, zero vendor lock-in
- **Modern CI/CD:** Automated builds & deployments from GitHub
- **Real-Time Logs:** See exactly what’s happening, as it happens
- **Secure by Design:** SSH credentials are encrypted and never shared
- **Made for You:** Especially affordable for developers in regions like Bangladesh

---

## 🧩 Microservices Architecture
DevDeploy is built as a set of modern microservices:
- **Authentication Service:** User login & registration powered by Spring Boot
- **API Backend:** Core deployment logic with Django REST Framework (DRF)
- **Frontend:** Lightning-fast React app (Vite + Tailwind CSS)

---

## 🚦 Key Features
- **Sign Up & Login** (Spring Boot Auth Service)
- **Connect GitHub**
- **Add Your VPS (SSH)**
- **Deploy Dockerized Projects**
- **Automated CI/CD**
- **Real-Time Status & Logs**

---

## 🎯 Goals & Vision
- Make deployment as easy as pushing to GitHub
- Remove DevOps complexity for everyone
- Empower developers to own their infrastructure
- Keep costs ultra-low and predictable

---

## 🛠️ Tech Stack
- **Frontend:** React, Vite, Tailwind CSS
- **Backend:** Django REST Framework
- **Auth:** Spring Boot microservice
- **CI/CD:** GitHub Actions, Docker
- **VPS:** Any server with SSH access

---

## 🚀 Quickstart

### Backend (Django + DRF)
```sh
cd core
python -m venv env
# Windows:
env\Scripts\activate
# Linux/Mac:
source env/bin/activate
pip install -r requirements.txt
python manage.py migrate
python manage.py runserver
```

### Frontend (React)
```sh
cd frontend
npm install
npm run dev
```

### Auth Service (Spring Boot)
- See `/auth-service` (coming soon) for setup and API docs

---

## 🔄 Deployment Workflow
1. **Connect GitHub**
2. **Add VPS (SSH)**
3. **Configure Dockerized Project**
4. **Push to Deploy (CI/CD)**
5. **Monitor Logs & Status**

---

## 🔒 Security
- All SSH credentials are encrypted and securely stored
- Only you can access your deployments

---

## 🤝 Contributing
We love contributions! Open issues, suggest features, or submit PRs.

---

## 📄 License
MIT License

---

> DevDeploy: Modern DevOps, democratized. Own your deployment journey.
