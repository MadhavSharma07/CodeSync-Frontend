# 🚀 CodeSync Frontend

<p align="center">
  <img src="https://img.shields.io/badge/Angular-20-red?style=for-the-badge&logo=angular" />
  <img src="https://img.shields.io/badge/Spring_Boot-Microservices-green?style=for-the-badge&logo=springboot" />
  <img src="https://img.shields.io/badge/WebSocket-Realtime-blue?style=for-the-badge&logo=socketdotio" />
  <img src="https://img.shields.io/badge/Docker-Containerized-2496ED?style=for-the-badge&logo=docker&logoColor=white" />
</p>

<p align="center">
  <img src="https://img.shields.io/github/license/your-repo/codesync?style=flat-square" />
  <img src="https://img.shields.io/github/stars/your-repo/codesync?style=flat-square" />
  <img src="https://img.shields.io/github/issues/your-repo/codesync?style=flat-square" />
</p>

---

# 📌 Overview

**CodeSync** is a collaborative cloud-based coding platform designed for developers, teams, and academic environments. The platform enables real-time collaboration, project management, code execution, version comparison, and review workflows using a modern microservices architecture.

This frontend application is built using **Angular** and communicates with multiple backend microservices through an **API Gateway**.

---

# ✨ Features

## 🔐 Authentication & Authorization

* User Registration
* Secure Login
* JWT-based Authentication
* Role-based Access Control
* Developer & Admin Roles

---

## 📁 Project Management

* Create Projects
* Create Folders & Files
* File Tree Navigation
* Organized Workspace Structure

---

## 💻 Code Editor

* Integrated Code Editor
* Save Source Code
* Execute Code
* Execution Output Console
* Multi-language Execution Support

---

## 👥 Collaboration Features

* Real-time Collaboration
* Shared Coding Sessions
* Collaboration Controls
* WebSocket-based Updates
* Live Synchronization

---

## 🧠 Version & Review System

* Snapshot Creation
* Snapshot Comparison
* Diff Visualization
* Review Comments
* Version Tracking

---

## 📢 Notification System

* Admin Broadcast Notifications
* Real-time Alerts
* User Notifications

---

# 🏗️ System Architecture

```text
                           ┌─────────────────────┐
                           │    Angular Frontend │
                           │     CodeSync UI     │
                           └──────────┬──────────┘
                                      │
                                      ▼
                         ┌─────────────────────────┐
                         │      API Gateway        │
                         │     Port : 8080         │
                         └──────────┬──────────────┘
                                    │
       ┌──────────────┬─────────────┼─────────────┬──────────────┐
       ▼              ▼             ▼             ▼              ▼
┌────────────┐ ┌────────────┐ ┌────────────┐ ┌────────────┐ ┌────────────┐
│ Auth       │ │ File       │ │ Execution  │ │ Collaboration│ │ Version   │
│ Service    │ │ Service    │ │ Service    │ │ Service     │ │ Service    │
└────────────┘ └────────────┘ └────────────┘ └────────────┘ └────────────┘
       │                                                      │
       └──────────────────────┬───────────────────────────────┘
                              ▼
                     ┌────────────────┐
                     │ Notification   │
                     │ Service        │
                     └────────────────┘
```

---

# 🧰 Tech Stack

| Technology       | Purpose                 |
| ---------------- | ----------------------- |
| Angular          | Frontend Framework      |
| TypeScript       | Application Logic       |
| RxJS             | Reactive Programming    |
| Angular Material | UI Components           |
| WebSocket        | Real-time Collaboration |
| Spring Boot      | Backend Microservices   |
| Eureka Server    | Service Discovery       |
| API Gateway      | Request Routing         |
| Docker           | Containerization        |
| JWT              | Authentication          |

---

# 📂 Project Structure

```bash
CodeSync-Frontend/
│
├── src/
│   ├── app/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── services/
│   │   ├── models/
│   │   ├── guards/
│   │   ├── interceptors/
│   │   └── shared/
│   │
│   ├── environments/
│   │   ├── environment.ts
│   │   └── environment.prod.ts
│   │
│   └── assets/
│
├── package.json
├── angular.json
├── README.md
└── TRADEMARK.md
```

---

# ⚙️ Prerequisites

Before running the project, ensure the following tools are installed:

## ✅ Required Software

1. Node.js (LTS Version)
2. npm
3. Angular CLI
4. Git
5. Docker Desktop (Optional)

---

# 🔧 Installation

## 1️⃣ Clone Repository

```bash
git clone https://github.com/your-username/codesync-frontend.git
```

---

## 2️⃣ Navigate to Project

```bash
cd CodeSync-Frontend
```

---

## 3️⃣ Install Dependencies

```bash
npm install
```

---

# 🌍 Environment Configuration

## Development Environment

Open:

```bash
src/environments/environment.ts
```

Update:

```ts
export const environment = {
  production: false,
  apiBaseUrl: 'http://localhost:8080'
};
```

---

## Production Environment

Open:

```bash
src/environments/environment.prod.ts
```

Update:

```ts
export const environment = {
  production: true,
  apiBaseUrl: 'https://your-production-url.com'
};
```

---

# ▶️ Run Application

## Start Angular Development Server

```bash
ng serve
```

Application URL:

```bash
http://localhost:4200
```

---

## Run on Custom Port

```bash
ng serve --port 4300
```

---

# 🏗️ Build Project

## Development Build

```bash
ng build
```

---

## Production Build

```bash
ng build --configuration production
```

---

# 🧪 Testing

## Run Unit Tests

```bash
ng test
```

---

## Headless Testing

```bash
ng test --watch=false --browsers=ChromeHeadless
```

---

# 🔗 Required Backend Services

The frontend depends on the following backend services:

| Service               | Description                    |
| --------------------- | ------------------------------ |
| Eureka Service        | Service Discovery              |
| API Gateway           | Central API Routing            |
| Auth Service          | Authentication & Authorization |
| File Service          | File & Folder Management       |
| Execution Service     | Code Execution                 |
| Collaboration Service | Real-time Collaboration        |
| Version Service       | Snapshot & Diff Management     |
| Notification Service  | Broadcast Notifications        |

---

# 🌐 Expected Gateway URL

```bash
http://localhost:8080
```

---

# 🐳 Docker Support

## Build Docker Image

```bash
docker build -t codesync-frontend .
```

---

## Run Docker Container

```bash
docker run -p 4200:80 codesync-frontend
```

---

# 📸 Demo Workflow

```text
1. Register User
2. Login User
3. Create Project
4. Add Folder
5. Add File
6. Write Code
7. Save & Execute
8. Create Snapshots
9. Compare Versions
10. Add Review Comments
11. Use Admin Broadcast
```

---

# ❗ Troubleshooting

## ⚠️ ng Command Not Recognized

```bash
npm install -g @angular/cli
```

---

## ⚠️ White Screen Issue

### Possible Fixes:

* Check browser console
* Restart Angular server
* Hard refresh browser (`Ctrl + F5`)
* Verify environment API URL
* Ensure backend services are running

---

## ⚠️ Login/Register Failed

### Verify:

* API Gateway is running
* Auth Service is running
* JWT configuration is correct
* Backend logs for 400/401/500 errors

---

## ⚠️ Execution Stuck in QUEUED/FAILED

### Verify:

* Execution Service status
* Docker executor configuration
* Backend execution logs

---

## ⚠️ Collaboration Offline

### Verify:

* Collaboration Service is running
* WebSocket endpoint is configured
* Gateway routes are correct

---

# 🔒 Security Features

* JWT Authentication
* Route Guards
* API Interceptors
* Secure Role Access
* Request Validation

---

# 🚀 Future Enhancements

* AI Code Suggestions
* Real-time Cursor Tracking
* Voice Collaboration
* Integrated Video Calls
* Cloud Deployment
* CI/CD Pipelines
* Kubernetes Deployment

---

# 👨‍💻 Contributors

| Name          | Role                 |
| ------------- | -------------------- |
| Madhav Sharma | Full Stack Developer |

---

# 📄 License

This project is intended for:

* Academic Use
* Learning Purposes
* Internal Demonstrations

Refer to:

```bash
TRADEMARK.md
```

for branding and usage policies.

---

# ⭐ Support

If you like this project:

* ⭐ Star the repository
* 🍴 Fork the project
* 🛠️ Contribute improvements

---


<p align="center">
  Made with ❤️ using Angular + Spring Boot Microservices
</p>
