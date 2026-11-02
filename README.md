# 🚨 ReliefConnect – Disaster Relief Coordination System

**Connecting Victims, Volunteers, NGOs, and Authorities for Effective Disaster Response.**

ReliefConnect is a web-based Disaster Relief Coordination System designed to improve communication and coordination during emergency situations. It provides a centralized platform where disaster victims can request essential assistance, volunteers can accept relief tasks, NGOs can manage available resources, and authorities can monitor relief operations.

## 🌟 Key Features

### 1. Victim Module
- Register and log in securely.
- Submit disaster relief requests.
- Request essential resources such as food, medicine, and rescue assistance.
- Track the status of submitted requests.
- Receive notifications about request updates.

### 2. Volunteer Module
- Register as a volunteer.
- View available relief requests.
- Accept and manage assigned tasks.
- Track task progress.
- Receive notifications about relief operations.

### 3. NGO Module
- Manage NGO information.
- Update available relief resources.
- View and manage relief requests.
- Coordinate resource distribution.

### 4. Authority Module
- Monitor disaster relief requests.
- View registered NGOs and volunteers.
- Manage and coordinate relief operations.
- Monitor request statuses and notifications.

## 🛠️ Technology Stack

| Component | Technology |
|---|---|
| Frontend | React.js |
| Backend | Java – Spring Boot |
| Database | MySQL |
| API | REST API |
| ORM | Spring Data JPA / Hibernate |
| Build Tool | Maven |
| Frontend Build Tool | Vite |
| Version Control | Git & GitHub |

## 🏗️ System Architecture

```text
          USERS
            |
            ▼
      REACT FRONTEND
            |
            ▼
         REST API
            |
            ▼
     SPRING BOOT BACKEND
            |
            ▼
       MYSQL DATABASE
```

## 📂 Project Structure

```text
ReliefConnect/
│
├── frontend/
│   └── disaster-relief-system/
│       ├── src/
│       ├── public/
│       ├── package.json
│       └── vite.config.js
│
├── disaster-relief-backend/
│   ├── src/
│   │   ├── main/
│   │   └── test/
│   ├── pom.xml
│   └── mvnw
│
├── .gitignore
└── README.md
```

## ⚙️ Installation and Setup

### Prerequisites

- Java JDK
- Node.js and npm
- MySQL Server
- Git

### 1. Clone the Repository

```bash
git clone https://github.com/YOUR-USERNAME/ReliefConnect.git
```

```bash
cd ReliefConnect
```

### 2. Configure MySQL

- Start your MySQL server.
- Create the required project database.
- Configure the database URL, username, and password using environment variables.

Required backend environment variables:

```text
DB_URL=jdbc:mysql://localhost:3306/your_database_name
DB_USERNAME=your_mysql_username
DB_PASSWORD=your_mysql_password
```

### 3. Run the Backend

Open a terminal:

```bash
cd disaster-relief-backend
```

For Windows PowerShell, configure the environment variables in the terminal and execute:

```powershell
.\mvnw.cmd spring-boot:run
```

### 4. Run the Frontend

Open another terminal:

```bash
cd frontend/disaster-relief-system
```

Install dependencies:

```bash
npm install
```

Start the development server:

```bash
npm run dev
```

Open the local URL displayed in the terminal to access the application.

## 🔐 Security

- Database credentials are configured through environment variables.
- Sensitive configuration files are excluded using `.gitignore`.
- Authentication and role-based access support the different user modules.

## 🎯 Project Objective

The primary objective of ReliefConnect is to provide an organized and efficient disaster relief coordination platform that helps connect people in need with volunteers, NGOs, and authorities.

By centralizing relief requests, resource management, and communication, the application aims to support faster and more coordinated disaster response.

## 👩‍💻 Developed By

**ReliefConnect Project Team**

Academic Project – Disaster Management Domain

---

⭐ If you find this project interesting, feel free to explore the repository and its features.