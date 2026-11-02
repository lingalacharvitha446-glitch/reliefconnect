# 🚨 ReliefConnect – Disaster Relief Coordination System

<p align="center">
  <strong>Connecting People. Coordinating Relief. Saving Lives.</strong>
</p>

## 📌 About the Project

**ReliefConnect** is a web-based Disaster Relief Coordination System developed to improve communication and coordination during disaster situations.

The application provides a centralized platform connecting four major users: **Victims, Volunteers, NGOs, and Authorities**.

Victims can request essential assistance, volunteers can accept relief tasks, NGOs can manage available resources, and authorities can monitor and coordinate relief operations.

The main objective is to make disaster relief operations more organized, accessible, and efficient.

## 🎯 Objectives

- Provide a centralized disaster relief coordination platform.
- Help victims request essential emergency assistance.
- Connect volunteers with people who need help.
- Enable NGOs to manage and update available resources.
- Allow authorities to monitor and coordinate relief activities.
- Improve communication and transparency during disaster situations.

## ✨ Key Features

### 👤 1. Victim Module
- User registration and login.
- Submit disaster relief requests.
- Request food, medicine, rescue and other essential assistance.
- Track submitted requests.
- Receive notifications and updates.

### 🤝 2. Volunteer Module
- Volunteer registration and login.
- View available relief requests.
- Accept and manage assigned tasks.
- Track task progress.
- Receive notifications.

### 🏢 3. NGO Module
- NGO registration and login.
- Manage NGO information.
- Update available resources.
- View and manage relief requests.
- Coordinate resource distribution.

### 🛡️ 4. Authority Module
- Monitor disaster relief requests.
- View registered NGOs and volunteers.
- Manage and coordinate relief operations.
- Monitor request statuses.
- Receive notifications about relief activities.

## 🛠️ Technology Stack

| Component | Technology |
|---|---|
| Frontend | React.js |
| Backend | Java |
| Backend Framework | Spring Boot |
| Database | MySQL |
| API Communication | REST API |
| ORM | Spring Data JPA / Hibernate |
| Build Tool | Maven |
| Frontend Build Tool | Vite |
| Version Control | Git & GitHub |

## 🏗️ System Architecture

```text
                 USERS
                   |
       +-----------+-----------+
       |           |           |
       v           v           v
     VICTIMS   VOLUNTEERS     NGOs
       |           |           |
       +-----------+-----------+
                   |
                   v
           REACT FRONTEND
                   |
                   v
                REST API
                   |
                   v
          SPRING BOOT BACKEND
                   |
                   v
             MYSQL DATABASE
                   |
                   v
         DATA MANAGEMENT AND
          RELIEF COORDINATION
```

## 📂 Project Structure

```text
ReliefConnect/
│
├── frontend/
│   └── disaster-relief-system/
│       ├── public/
│       ├── src/
│       │   ├── components/
│       │   ├── pages/
│       │   ├── assets/
│       │   └── utils/
│       ├── package.json
│       ├── package-lock.json
│       └── vite.config.js
│
├── disaster-relief-backend/
│   ├── src/
│   │   ├── main/
│   │   │   ├── java/
│   │   │   └── resources/
│   │   └── test/
│   ├── pom.xml
│   ├── mvnw
│   └── mvnw.cmd
│
├── .gitignore
└── README.md
```

## ⚙️ Installation and Setup

### Prerequisites

Make sure the following software is installed:

- Java JDK
- Node.js and npm
- MySQL Server
- MySQL Workbench (optional)
- Git
- Visual Studio Code (recommended)

### 1. Clone the Repository

Open your terminal and execute:

```bash
git clone https://github.com/lingalacharvitha446-glitch/reliefconnect.git
```

Navigate into the project directory:

```bash
cd reliefconnect
```

### 2. Database Configuration

1. Start your MySQL server.
2. Open MySQL Workbench.
3. Create the required project database.
4. Configure the database connection in the backend.

Set the following environment variables:

```text
DB_URL=jdbc:mysql://localhost:3306/your_database_name
DB_USERNAME=your_mysql_username
DB_PASSWORD=your_mysql_password
```

Replace the example values with your actual local MySQL configuration.

**Note:** Never upload actual database passwords or sensitive credentials to GitHub.

### 3. Run the Backend (Spring Boot)

Open a terminal in VS Code:

```bash
cd disaster-relief-backend
```

For Windows:

```powershell
.\mvnw.cmd spring-boot:run
```

The Spring Boot backend will start using the configured application port.

### 4. Run the Frontend (React)

Open another terminal:

```bash
cd frontend/disaster-relief-system
```

Install the required dependencies:

```bash
npm install
```

Start the React development server:

```bash
npm run dev
```

Open the local URL displayed in your terminal to access the application.

## 🔐 Security

- Database credentials are managed using environment variables.
- Sensitive configuration files are excluded using `.gitignore`.
- Authentication supports different application user roles.
- Backend and frontend communicate through REST APIs.

## 🌍 Project Impact

ReliefConnect aims to support disaster management by bringing victims, volunteers, NGOs, and authorities together on a single platform.

It helps organize relief requests, coordinate available resources, and improve communication between different stakeholders during emergency situations.

## 🚀 Future Enhancements

- Real-time disaster alerts and notifications.
- Live location tracking and interactive maps.
- AI-based prioritization of emergency requests.
- Integration with emergency response services.
- Improved analytics and disaster monitoring dashboards.

## 👩‍💻 Project Information

**Project Name:** ReliefConnect

**Domain:** Disaster Management

**Project Type:** Web-Based Application

**Developed By:** ReliefConnect Project Team

**Technologies:** React.js, Java, Spring Boot and MySQL

**GitHub Repository:**  
https://github.com/lingalacharvitha446-glitch/reliefconnect

---

<p align="center">
  <strong>ReliefConnect – Together Towards Faster Disaster Relief. ❤️</strong>
</p>