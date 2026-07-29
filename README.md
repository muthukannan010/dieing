<div align="center">

# 🚀 DyeTech Pro – Smart Dyeing Factory Management System

<img src="public/images/logo.svg" width="160" alt="DyeTech Pro Logo">

### Enterprise ERP Platform for Textile Dyeing Industries

<p>
  <img src="https://img.shields.io/badge/Node.js-20.x-339933?logo=node.js&logoColor=white">
  <img src="https://img.shields.io/badge/Express.js-4.x-000000?logo=express&logoColor=white">
  <img src="https://img.shields.io/badge/MySQL-Database-4479A1?logo=mysql&logoColor=white">
  <img src="https://img.shields.io/badge/SQLite-Supported-003B57?logo=sqlite&logoColor=white">
  <img src="https://img.shields.io/badge/JavaScript-ES6-F7DF1E?logo=javascript&logoColor=black">
  <img src="https://img.shields.io/badge/EJS-Template-B4CA65">
  <img src="https://img.shields.io/badge/License-MIT-success">
  <img src="https://img.shields.io/badge/Version-1.0-brightgreen">
</p>

*A complete enterprise ERP solution for Textile Dyeing Industries.*

</div>

---

# 📖 Overview

**DyeTech Pro** is a full-stack Enterprise Resource Planning (ERP) platform developed specifically for textile dyeing industries. The application automates and manages the complete textile production lifecycle, including customer management, order processing, production planning, inventory management, dye recipe calculations, machine monitoring, chemical tracking, analytics, and business reporting.

Built using the **MVC architecture**, the platform provides secure authentication, role-based access control, responsive dashboards, and modern UI components to streamline textile manufacturing operations.

---

# ✨ Key Features

- 🔐 JWT Authentication & Secure Login
- 👥 Role-Based Access Control (RBAC)
- 📦 Customer & Order Management
- 🏭 Production Planning & Batch Tracking
- 🧪 Chemical & Dye Management
- 🎨 Color Recipe Management
- ⚖️ Fabric Weight & Dye Calculators
- 📊 Interactive Dashboard & Analytics
- 📑 PDF & Excel Report Generation
- 📦 Inventory & Supplier Management
- 📱 Fully Responsive Design
- 🌙 Dark Mode Support
- 🔔 Notification System
- 📈 Production Monitoring
- 🛡️ Audit Logging

---

# 🏗️ System Architecture

```text
Browser (Client)
        │
        ▼
Express.js Server
        │
        ▼
Controllers (MVC)
        │
        ▼
Services & Middleware
        │
        ▼
MySQL / SQLite Database
```

---

# 👨‍💼 User Roles

| Role | Description |
|------|-------------|
| 👤 Customer | Create and track dyeing orders |
| ⚙️ Machine Operator | Manage assigned production batches |
| 📦 Inventory Manager | Handle chemical and stock management |
| 🏭 Production Supervisor | Monitor production workflow |
| 👨‍💼 Factory Manager | Manage factory operations |
| 👑 Super Admin | Complete ERP administration |

---

# 🛠️ Technology Stack

## Frontend

- HTML5
- CSS3
- JavaScript (ES6)
- EJS

## Backend

- Node.js
- Express.js

## Database

- MySQL
- SQLite

## Authentication

- JWT
- HTTP Only Cookies
- bcrypt

## Libraries

- Chart.js
- ApexCharts
- DataTables
- PDFKit
- ExcelJS
- QRCode.js

---

# 📂 Project Structure

```text
deying-portal/
│
├── config/
├── controllers/
├── middleware/
├── models/
├── public/
│   ├── css/
│   ├── js/
│   ├── images/
│   └── icons/
├── routes/
├── views/
├── database/
├── .env
├── package.json
├── schema.sql
└── server.js
```

---

# ⚙️ Installation

Clone the repository

```bash
git clone https://github.com/yourusername/dyetech-pro.git
```

Move into the project

```bash
cd dyetech-pro
```

Install dependencies

```bash
npm install
```

Start the application

```bash
npm start
```

Visit

```
http://localhost:3000
```

---

# 🗄️ Database Configuration

## SQLite (Development)

No configuration required.

The application automatically creates:

- Database
- Tables
- Demo Data
- Default Users

---

## MySQL (Production)

Create a `.env` file.

```env
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=password
DB_NAME=dyetech_pro

JWT_SECRET=your_secret_key
```

---

# 🔑 Default Login Credentials

## 👑 Super Admin

Username

```
admin
```

Password

```
admin123
```

---

## 👨‍💼 Factory Manager

Username

```
manager
```

Password

```
manager123
```

---

## ⚙️ Machine Operator

Username

```
operator
```

Password

```
operator123
```

---

# 📊 ERP Modules

- Customer Management
- Order Management
- Production Management
- Batch Scheduling
- Machine Management
- Chemical Management
- Dye Recipe Management
- Inventory Management
- Reports
- Analytics Dashboard
- Notifications
- User Management
- Settings

---

# 🔒 Security Features

- JWT Authentication
- Password Encryption
- Protected Routes
- Session Management
- Role-Based Authorization
- Secure Cookies
- Audit Logs
- Browser Cache Prevention

---

# 📈 Future Enhancements

- AI Color Prediction
- IoT Machine Integration
- Barcode Scanner
- QR Code Tracking
- Mobile Application
- Email Notifications
- SMS Notifications
- Cloud Deployment
- Multi-Factory Support
- AI Production Forecasting

---

# 👨‍💻 Developer

**Muthukannan K**

B.Tech – Artificial Intelligence & Data Science

- GitHub: https://github.com/muthukannan010
- LinkedIn: *(Add your LinkedIn profile)*
- Email: *(Add your email address)*

---

# 🤝 Contributing

Contributions, issues, and feature requests are welcome.

If you'd like to contribute:

1. Fork the repository.
2. Create a feature branch.
3. Commit your changes.
4. Submit a Pull Request.

---

# ⭐ Support

If you found this project useful, please consider giving it a **Star ⭐** on GitHub.

---

# 📜 License

This project is licensed under the **MIT License**.

---

<div align="center">

### 🚀 DyeTech Pro – Smart Dyeing Factory Management System

**Digitizing Textile Manufacturing with Enterprise ERP Solutions**

Made with ❤️ by **Muthukannan K**

</div>
