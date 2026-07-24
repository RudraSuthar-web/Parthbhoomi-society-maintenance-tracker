# Parthbhoomi Society Maintenance Tracker

A premium, civic-flow inspired React + Vite web application coupled with a FastAPI backend & Supabase database integration to manage society maintenance, ledger records, bulletins, and expenditures. It features a complete serverless Google Drive archival pipeline for bills and receipts.

---

## 🚀 Key Features

### 🏢 Resident Portal
- **Financial Status Banner**: Color-coded, high-visibility billing alerts (e.g., `#ffdad6` for unpaid dues, `#e8f5e9` for fully settled dues).
- **Yearly Contribution Rail**: A responsive, chronological 12-month status tracker (Jan-Dec) indicating payment statuses (Paid, Partial, Unpaid, Unbilled) at a glance.
- **Accordion Transaction Ledger**: Interactive, collapsible records showing breakdown details, transaction IDs (`#TXNxxxx`), payment methods, and receipt downloads.
- **Physical-style Receipt Modal**: A realistic, print-friendly invoice displaying clearance dates, payment methods, society stamps, and integrated web printing.
- **Society Bulletin**: Announcements board synced with the administration database.
- **Resident Profile Settings**: Real-time name and contact editing with immediate UI propagation.
- **Expenditures Log**: Read-only access to society expenses with a direct preview of official receipts stored in Google Drive.

### 👑 Admin Control Panel
- **Financial Bento Grid**: Real-time KPI widgets calculating monthly collection rates, total collected amount, outstanding dues, and active notice indicators.
- **Interactive Defaulters List**: Highlights partial and unpaid units for the selected billing cycle with quick action triggers.
- **Tenement Directory**: High-density management table containing unit profiles, billing status controls, and payment installment dialogs (supports Cash, Cheque, or Bank Transfer).
- **Bulletin Broadcaster**: Interface to publish announcements with customized severity alerts.
- **Expense Log & File Uploader**: An administration ledger to record expenditures (category, description, date, amount) and upload bill attachments.
- **Google Drive Archival pipeline**: Serverless connection using a Google Apps Script Web App to upload and share bill receipts directly in Drive.

---

## 🛠️ Tech Stack

- **Frontend**: React 19, Vite, Tailwind CSS, React Router DOM (Hash Router for single-page routing).
- **Backend / Database**: Supabase Client & REST API Integration, FastAPI (optional local fallback).
- **Archival API**: Google Apps Script (Serverless CORS-redirect File Uploader Gateway).
- **Linting**: Oxlint (ultra-fast linter).

---

## 📁 Project Structure

```
parthbhoomi-tracker/
├── frontend/                     # React + Vite Application
│   ├── src/
│   │   ├── components/
│   │   │   ├── admin/            # OverviewTab, TenementsTab, AddExpenseModal, etc.
│   │   │   ├── resident/         # DashboardTab, LedgerTab, ProfileTab, etc.
│   │   │   ├── ui/               # Reusable blocks (AlertBanner, EmptyState, StatCard)
│   │   │   └── DrivePreviewModel.jsx # Google Drive iframe preview frame
│   │   ├── context/
│   │   │   └── AppContext.jsx    # Global React Context & Offline fallback sync
│   │   ├── data/
│   │   │   └── mockData.js       # Offline seed credentials
│   │   ├── services/
│   │   │   ├── apiService.js     # Unified database API client
│   │   │   └── supabaseClient.js # Supabase connection configuration
│   │   ├── views/
│   │   │   ├── AdminDashboard.jsx
│   │   │   ├── ResidentDashboard.jsx
│   │   │   └── Login.jsx
│   │   └── utils/
│   │       └── dateUtils.js      # Billing periods calculations
│   ├── .env                      # Local environment configuration
│   └── package.json
├── backend/                      # Optional FastAPI Local Server code
└── google_apps_script_deploy.md  # Google Drive Web App deployment guide
```

---

## ⚙️ Installation & Getting Started

### 1. Prerequisites
- **Node.js**: Version 18.x or newer.
- **Package Manager**: npm.

### 2. Frontend Setup
Navigate into the `frontend` directory:
```bash
cd parthbhoomi-tracker/frontend
```

Install dependencies:
```bash
npm install
```

### 3. Environment Configuration
Create a `.env` file in `parthbhoomi-tracker/frontend` (or modify the existing one):
```ini
# Supabase Database Configuration
VITE_SUPABASE_URL="https://your-supabase-project.supabase.co/"
VITE_SUPABASE_ANON_KEY="your-supabase-anonymous-key"

# Google Apps Script Web App Integration (Optional)
VITE_APPS_SCRIPT_URL="https://script.google.com/macros/s/.../exec"
VITE_APPS_SCRIPT_FOLDER_ID="your-google-drive-folder-id"
```

### 4. Running the Development Server
Launch the local Vite server:
```bash
npm run dev
```
Open `http://localhost:5173` in your browser.

### 5. Production Compilation
Generate the optimized static build:
```bash
npm run build
```

---

## 📂 Google Drive Web App Integration Setup
To configure the serverless Google Drive archival pipeline for bill uploads, follow the detailed setup instructions and copy the JavaScript uploader script from:
👉 **[google_apps_script_deploy.md](google_apps_script_deploy.md)**

---

## 🔑 Demo Credentials
If no Supabase database is connected, the application runs in a fully-interactive local cache mode with the following seed accounts:

| Role | Username | Password |
| :--- | :--- | :--- |
| **Administrator** | `ADMIN-01` | `password` |
| **Resident (Fully Paid)** | `1` *(Amit Patel)* | `password` |
| **Resident (Unpaid Dues)** | `42` *(Rohan Mehta)* | `password` |
