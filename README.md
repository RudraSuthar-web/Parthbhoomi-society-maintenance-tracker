# Parthbhoomi Tracker

Parthbhoomi Tracker is a React + Vite web application for managing a society or residential community’s maintenance records. It provides separate experiences for administrators and residents, including dues tracking, installment payments, notices, and profile management.

## Features

- Admin dashboard for monitoring society records
- Resident dashboard for viewing dues and updating profile information
- Monthly maintenance grid and payment status tracking
- Installment-based payment flow with partial/full payment support
- Notice board for society announcements
- Local persistence using browser storage for a lightweight offline-friendly experience

## Tech Stack

- React 19
- Vite
- Tailwind CSS
- React Router DOM
- Supabase client support (prepared for backend integration)

## Getting Started

### Prerequisites

- Node.js 18 or newer
- npm

### Installation

```bash
npm install
```

### Run locally

```bash
npm run dev
```

Then open the local Vite URL shown in the terminal.

## Available Scripts

- `npm run dev` — start the development server
- `npm run build` — build the app for production
- `npm run preview` — preview the production build locally
- `npm run lint` — run the linter

## Project Structure

- `src/context` — application state and context providers
- `src/views` — admin, resident, login, and dashboard views
- `src/components` — reusable UI components
- `src/data` — mock data and initial seed data
- `src/services` — service layer for backend/API integration
- `src/utils` — helper utilities

## Notes

The current build uses local storage-backed data and mock seed content. The service layer in [src/services/apiService.js](src/services/apiService.js) is ready to be connected to a real backend or database later.
