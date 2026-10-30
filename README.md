# e-Iskolar Bayan Management Portal (IBMS) - PHP & MySQL Edition

Official web-based management portal for the **Iskolar Bayan ng Malungon (IBM) Program**, LGU Malungon, Sarangani Province.

Fully converted and replicated from Google Apps Script to a native **PHP 8 + MySQL + Apache (XAMPP)** tech stack.

---

## Quick Start Guide with XAMPP

### 1. Start XAMPP Services
1. Open the **XAMPP Control Panel** (`C:\xampp\xampp-control.exe`).
2. Click **Start** next to **Apache**.
3. Click **Start** next to **MySQL**.

### 2. Initialize the Database
Open your web browser and navigate to:
```
http://localhost/ibms/install.php
```
Click **Initialize Database Now**. This will:
- Create the MySQL database `ibms_db`.
- Build all required tables (`scholars`, `semesters`, `scholar_semesters`, `payroll`, `graduates`, `other_grants`, `requirements`, `settings`, `activity_logs`, `users`).
- Seed initial semesters and create the default administrator account.

> *Note: If you run `index.php` directly, the system also features auto-initialization fallback on first connection.*

### 3. Open the IBMS Portal
Navigate to:
```
http://localhost/ibms/index.php
```

#### Default Administrator Credentials
- **Username**: `admin`
- **Password**: `admin123` (or `admin`)

---

## Key Features & Modules

### 1. Iskolar Registry (`Iskolar Registry` tab)
- **Real-Time Search & Advanced Filters**: Filter by Barangay, Year Level, Payroll Status, and Semester Status.
- **Add / Edit Scholar**: Auto-calculates padded Control Number and IBM ID (`IBM-YY-YY-00001`).
- **Batch Processing**:
  - **Batch Add**: Enrolls selected scholars into a specific grant period.
  - **Batch Edit**: Bulk update School Year, Status, Course, School, Remarks, or individual Year Levels.
  - **Batch Graduate**: Moves graduating scholars into the Alumni / Graduates database.
  - **Batch Grants**: Moves scholars with external grants (DOST, CHED, etc.) to Other Grants and sets status to Delisted.
- **Disciplinary Actions**: Process academic violations (1 fail = probation, >1 fails = termination), compliance, medical leaves (frozen semesters), financial leaves, or voluntary withdrawals.

### 2. Payroll Registry (`Payroll Registry` tab)
- View enrolled scholars for the active grant period.
- Syncs automatically with the main database.
- Auto-promotion: automatically advances Year Level when enrolling into a 1st Semester period.
- Auto-graduating: automatically flags 4th/5th-year students enrolling into a 2nd Semester period.
- **Export to CSV**: Export payroll registry directly to CSV.

### 3. Reports & Analytics (`Reports & Summaries` tab)
- **Summary Breakdown & Charts**: Interactive Chart.js visualizations.
- **Certified List (Paid/OK)** vs **Target for Renewal (Pending)**.
- **Matrix Breakdown**: Barangay vs Year Level matrix with print capabilities.
- **Alumni Matrix**: Detailed breakdown of graduates by year and Latin honors.
- **Payroll Tracking (Sem vs Sem)**: Side-by-side comparison of baseline vs current semester with status filters.
- **Print Manager**: Official IBM Payroll Form (Landscape), Admin & Accounting List, Fund Utilization Request (FURS), Authority to Debit Account (ADA), and Financial Expenditure Reports.

### 4. Requirement Validations (`Requirement Validations` tab)
- Turn student submission portal **OPEN** or **CLOSED**.
- Select active semester for requirements.
- Review submitted documents.
- **One-Click Approval**: Automatically approves the requirement and adds the scholar to the Payroll Registry.
- Student upload portal available at:
  ```
  http://localhost/ibms/upload_requirement.php
  ```

### 5. Official Certificate Generator
- Built-in printable certificate view (`certificate.php`) with official LGU Malungon seals and formatting.
- Print directly or "Save as PDF" cleanly via browser print (`Ctrl + P`).

---

## Project Structure

```
C:\xampp\htdocs\ibms/  (or d:\IBM-Latin\IBMS\)
├── config/
│   └── db.php                  # PDO MySQL connection and error handler
├── database/
│   └── schema.sql              # Complete database schema and seed data
├── assets/
│   ├── css/
│   │   └── stylesheet.css      # SaaS / Tailwind design system styles
│   └── js/
│       ├── api-bridge.js       # google.script.run emulation bridge
│       └── admin.js            # Frontend logic, filters, and matrix reporting
├── uploads/
│   └── requirements/           # Uploaded PDFs and student documents
├── api.php                     # Central REST/RPC controller (ported from code.gs)
├── certificate.php             # Printable certificate template
├── deploy_to_xampp.bat         # Sync script to C:\xampp\htdocs\ibms
├── index.php                   # Main portal interface
├── install.php                 # One-click database installer & status check
└── upload_requirement.php      # Student requirements upload portal
```
