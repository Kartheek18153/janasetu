# 🇮🇳 JanaSetu

### Bridging Citizens and Government Services Through One Digital Platform

**JanaSetu** is a citizen-centric digital governance platform designed to simplify access to government services, welfare schemes, grievances, applications, documents, appointments, and public announcements through a unified interface.

Instead of requiring citizens to navigate multiple disconnected systems, JanaSetu brings essential public-service workflows together and adds **AI-powered assistance, multilingual support, secure authentication, application tracking, and administrative tools**.

> **JanaSetu — A digital bridge between citizens and public services.**

---

## 🎯 The Problem

Government services are increasingly available online, but discovering and accessing them can still be difficult.

Citizens often need to:

* Search across multiple portals
* Understand complex scheme eligibility requirements
* Find the correct department for a grievance
* Track applications separately
* Manage different documents
* Visit offices without knowing appointment availability
* Understand information written in unfamiliar languages

JanaSetu aims to reduce this fragmentation by creating a **single citizen-facing digital platform** for accessing and managing public services.

---

# ✨ Core Features

## 🏛️ Government Scheme Discovery

JanaSetu provides a dedicated scheme discovery system where citizens can explore available government schemes and view detailed information about them.

The application includes:

* Scheme listing
* Scheme detail pages
* Scheme information services
* External scheme integration support
* Structured scheme data
* Citizen-friendly scheme discovery

The goal is to make government benefits easier to discover without requiring users to manually search through multiple government websites.

---

## 🤖 AI-Powered Assistance

JanaSetu includes an AI service layer and configuration for **Google Gemini**.

The AI layer is designed to assist citizens in understanding information presented by the platform and can support intelligent interactions such as:

* Understanding government services
* Simplifying complex information
* Helping users navigate the platform
* Assisting with scheme-related information
* Language assistance and translation

This allows JanaSetu to move beyond being only a portal and toward becoming an **intelligent public-service assistant**.

---

## 📢 Public Announcements

Citizens can access important announcements through a dedicated announcements system.

This can be used for information such as:

* Government notices
* Scheme updates
* Service announcements
* Deadlines
* Public information
* Administrative updates

A dedicated announcement service separates announcement management from the rest of the application.

---

## 📝 Digital Grievance System

JanaSetu includes a grievance management workflow that allows citizens to raise issues digitally.

Dedicated interfaces are available for:

* Filing grievances
* Managing grievance information
* Tracking grievance progress

The grievance service provides the application layer responsible for handling grievance-related operations.

The objective is to provide citizens with a clear digital path from:

```text
Problem
   ↓
File Grievance
   ↓
Submit Details
   ↓
Grievance Record
   ↓
Track Status
   ↓
Resolution
```

---

## 🔎 Grievance Tracking

Submitting a complaint is only one part of the process.

JanaSetu also includes a dedicated grievance tracking interface so users can monitor their submitted issues instead of losing visibility after submission.

---

## 📄 Document Management

JanaSetu contains a dedicated document section for managing citizen documents.

The architecture includes both document-related pages and storage services, allowing document functionality to remain separated from other citizen-service modules.

This creates the foundation for a reusable digital document layer within the platform.

---

## 📅 Appointment Management

Citizens may need to interact physically with government departments even when services begin online.

JanaSetu therefore includes an appointment management system.

Users can access a dedicated appointment interface, while appointment operations are handled through a separate service layer.

This architecture can support workflows such as:

```text
Select Service
      ↓
Choose Appointment
      ↓
Reserve Slot
      ↓
Store Appointment
      ↓
Citizen Visits Office
```

---

## 📂 Application Tracking

JanaSetu provides a **My Applications** section where citizens can access their service-related applications from one location.

This is designed to create a centralized citizen dashboard instead of forcing users to remember separate application references across different services.

---

## 👤 Citizen Accounts

The application includes a complete account-oriented structure with:

* Registration
* Login
* Authentication context
* Account page
* User state management
* Protected application functionality

Firebase is used as a major backend infrastructure component for authentication and application data.

---

## 🌐 Multilingual Architecture

India's linguistic diversity makes multilingual access particularly important for public-service applications.

JanaSetu therefore includes a dedicated internationalization (`i18n`) architecture.

Combined with AI-assisted translation capabilities, this creates the foundation for making government information accessible across multiple languages.

---

## 🛡️ Administrative System

JanaSetu is not designed only for citizens.

The project also contains a dedicated **admin section** for managing platform operations.

The service architecture includes administrative capabilities such as:

* Audit services
* Department services
* Announcement management
* Scheme management
* Application data management
* Platform administration

This creates two major sides of the platform:

```text
                  JANASETU
                     │
           ┌─────────┴─────────┐
           │                   │
       CITIZENS             ADMINS
           │                   │
     Discover Services      Manage Data
     File Grievances        Manage Schemes
     Track Applications     Manage Notices
     Manage Documents       Audit Operations
     Book Appointments      Manage Departments
```

---

# 🏗️ System Architecture

JanaSetu follows a modern client/cloud architecture.

```text
┌──────────────────────────────────────────────┐
│                 JANASETU UI                  │
│                                              │
│         React + TypeScript + Vite            │
└─────────────────────┬────────────────────────┘
                      │
                      ▼
┌──────────────────────────────────────────────┐
│            Application Service Layer         │
│                                              │
│ Auth │ Schemes │ Grievances │ Documents      │
│ Appointments │ Notifications │ AI │ Admin    │
└───────────────┬───────────────────┬──────────┘
                │                   │
                ▼                   ▼
       ┌────────────────┐   ┌─────────────────┐
       │    Firebase    │   │   Gemini AI     │
       │                │   │                 │
       │ Authentication │   │ AI Assistance   │
       │ Firestore      │   │ Translation     │
       │ Storage        │   │ Language Tasks  │
       │ Hosting        │   │ Smart Features  │
       └────────────────┘   └─────────────────┘
```

---

# 🧠 Application Architecture

The source code is divided into clear functional layers:

```text
src/
│
├── components/
├── context/
├── data/
├── firebase/
├── hooks/
├── i18n/
├── pages/
├── services/
├── test/
├── types/
├── utils/
│
├── App.tsx
├── index.css
└── main.tsx
```

### `components/`

Reusable user-interface components used throughout the application.

### `context/`

Global React context providers, including:

* Application context
* Authentication context

### `data/`

Static or structured application data.

### `firebase/`

Firebase configuration and Firebase-related functionality.

### `hooks/`

Reusable React hooks.

### `i18n/`

Internationalization and multilingual support.

### `pages/`

Application-level screens and routes.

### `services/`

The primary business-logic and data-access layer.

### `types/`

Shared TypeScript type definitions.

### `utils/`

Reusable utility functions.

### `test/`

Testing infrastructure and application tests.

---

# 📱 Major Pages

The current application contains pages for:

```text
Home
│
├── Login
├── Register
│
├── Schemes
│     └── Scheme Details
│
├── File Grievance
├── Track Grievance
│
├── My Applications
├── Documents
├── Appointments
├── Announcements
├── Account
│
└── Admin
```

This structure allows JanaSetu to function as more than a scheme-discovery website; it acts as a broader **citizen-service portal**.

---

# ⚙️ Service Architecture

One of the strongest architectural aspects of JanaSetu is the separation of application functionality into dedicated services.

```text
services/
│
├── aiService.ts
├── announcementService.ts
├── appointmentService.ts
├── auditService.ts
├── authService.ts
├── departmentService.ts
├── emailService.ts
├── externalSchemeService.ts
├── grievanceService.ts
├── localDocService.ts
├── notificationService.ts
├── schemeData.ts
├── schemeService.ts
├── seedService.ts
├── storageService.ts
├── validation.ts
└── utils.ts
```

Each service focuses on a particular responsibility.

This separation helps keep UI components independent from data-access and business logic.

---

# 🔥 Firebase Integration

Firebase forms the cloud infrastructure layer of JanaSetu.

The repository includes configuration for:

* Firebase Authentication
* Firestore
* Firebase Storage
* Firebase Hosting
* Firestore security rules
* Firestore indexes
* Local emulator support

Firebase allows the application to operate without requiring a traditional standalone backend server for many of its core operations.

---

# 🔐 Firestore Security

JanaSetu contains dedicated:

```text
firestore.rules
firestore.indexes.json
```

This allows database authorization policies and query indexes to be version-controlled alongside the application.

Security rules are particularly important because JanaSetu handles authenticated citizen-facing data and administrative functionality.

---

# 🤖 Gemini AI Integration

The project supports Google Gemini through an environment variable:

```env
VITE_GEMINI_API_KEY=
```

The application also contains:

```text
src/services/aiService.ts
```

which provides a dedicated location for AI-related application functionality.

Conceptually:

```text
Citizen
   │
   ▼
JanaSetu UI
   │
   ▼
AI Service
   │
   ▼
Gemini
   │
   ▼
AI-generated assistance
   │
   ▼
Citizen
```

---

# 🛠️ Technology Stack

| Layer             | Technology              |
| ----------------- | ----------------------- |
| Frontend          | React 18                |
| Language          | TypeScript              |
| Build Tool        | Vite                    |
| Styling           | Tailwind CSS            |
| Routing           | React Router            |
| Authentication    | Firebase Authentication |
| Database          | Cloud Firestore         |
| Storage           | Firebase Storage        |
| Hosting           | Firebase Hosting        |
| AI                | Google Gemini           |
| Email             | EmailJS                 |
| Validation        | Zod                     |
| UI Components     | Headless UI             |
| Icons             | Heroicons               |
| Testing           | Vitest                  |
| Component Testing | Testing Library         |
| Linting           | ESLint                  |

---

# 🔄 How JanaSetu Works

A typical citizen interaction can look like:

```text
Citizen
   │
   ▼
Register / Login
   │
   ▼
JanaSetu Dashboard
   │
   ├───────────────┐
   │               │
   ▼               ▼
Schemes        Grievances
   │               │
   ▼               ▼
Discover        File Issue
   │               │
   ▼               ▼
View Details    Track Status
   │
   ├───────────────┐
   │               │
   ▼               ▼
Documents     Appointments
   │               │
   ▼               ▼
Manage Docs    Book / Manage
   │
   ▼
My Applications
```

AI and multilingual services can assist across this workflow.

---

# 📁 Project Structure

```text
janasetu/
│
├── .github/
│   └── workflows/
│
├── public/
│
├── src/
│   ├── components/
│   ├── context/
│   │   ├── AppContext.tsx
│   │   └── AuthContext.tsx
│   │
│   ├── data/
│   ├── firebase/
│   ├── hooks/
│   ├── i18n/
│   │
│   ├── pages/
│   │   ├── admin/
│   │   ├── AccountPage.tsx
│   │   ├── AnnouncementsPage.tsx
│   │   ├── AppointmentsPage.tsx
│   │   ├── DocumentsPage.tsx
│   │   ├── FileGrievancePage.tsx
│   │   ├── HomePage.tsx
│   │   ├── LoginPage.tsx
│   │   ├── MyApplicationsPage.tsx
│   │   ├── RegisterPage.tsx
│   │   ├── SchemeDetailPage.tsx
│   │   ├── SchemesPage.tsx
│   │   └── TrackGrievancePage.tsx
│   │
│   ├── services/
│   │   ├── aiService.ts
│   │   ├── announcementService.ts
│   │   ├── appointmentService.ts
│   │   ├── auditService.ts
│   │   ├── authService.ts
│   │   ├── departmentService.ts
│   │   ├── emailService.ts
│   │   ├── externalSchemeService.ts
│   │   ├── grievanceService.ts
│   │   ├── localDocService.ts
│   │   ├── notificationService.ts
│   │   ├── schemeData.ts
│   │   ├── schemeService.ts
│   │   ├── seedService.ts
│   │   ├── storageService.ts
│   │   └── validation.ts
│   │
│   ├── test/
│   ├── types/
│   ├── utils/
│   │
│   ├── App.tsx
│   ├── index.css
│   └── main.tsx
│
├── .env.example
├── .firebaserc
├── firebase.json
├── firestore.indexes.json
├── firestore.rules
├── package.json
├── tsconfig.json
├── vite.config.ts
└── vitest.config.ts
```

---

# 🚀 Getting Started

## Prerequisites

Make sure you have:

* Node.js
* npm
* A Firebase project
* Firebase Authentication configured
* Cloud Firestore configured
* Firebase Storage configured
* A Gemini API key if using AI functionality

---

## 1. Clone the Repository

```bash
git clone https://github.com/Kartheek18153/janasetu.git
cd janasetu
```

---

## 2. Install Dependencies

```bash
npm install
```

---

## 3. Configure Environment Variables

Copy the example environment configuration:

```bash
cp .env.example .env
```

Configure the Firebase values:

```env
VITE_FIREBASE_API_KEY=
VITE_FIREBASE_AUTH_DOMAIN=
VITE_FIREBASE_PROJECT_ID=
VITE_FIREBASE_STORAGE_BUCKET=
VITE_FIREBASE_MESSAGING_SENDER_ID=
VITE_FIREBASE_APP_ID=
VITE_FIREBASE_MEASUREMENT_ID=
```

Configure Gemini:

```env
VITE_GEMINI_API_KEY=
```

Optional local Firebase emulator configuration:

```env
VITE_USE_EMULATORS=false
```

Application configuration:

```env
VITE_APP_NAME=JanaSetu
VITE_APP_URL=http://localhost:5173
```

---

## 4. Start Development Server

```bash
npm run dev
```

Vite will start the development environment locally.

---

# 🧪 Testing

JanaSetu uses **Vitest** and React Testing Library.

Run all tests:

```bash
npm test
```

Watch tests during development:

```bash
npm run test:watch
```

Run the Vitest UI:

```bash
npm run test:ui
```

---

# 🔍 Code Quality

Run ESLint:

```bash
npm run lint
```

Automatically fix supported linting issues:

```bash
npm run lint:fix
```

---

# 📦 Production Build

Create a production build:

```bash
npm run build
```

Preview the production build locally:

```bash
npm run preview
```

---

# ☁️ Firebase Deployment

The project includes Firebase deployment scripts.

Deploy the complete application:

```bash
npm run deploy
```

Deploy Firestore rules only:

```bash
npm run deploy:rules
```

Deploy Firestore indexes:

```bash
npm run deploy:indexes
```

Deploy Firebase Hosting:

```bash
npm run deploy:hosting
```

---

# 🔒 Security Considerations

Because JanaSetu deals with citizen-facing information and administrative functionality, security is an important part of the architecture.

The project includes:

* Firebase Authentication
* Firestore security rules
* Input validation
* Authentication context
* Administrative separation
* Audit services
* Environment-based configuration
* Disposable-email-domain detection
* Database indexes and access policies

For a production government-service environment, additional identity verification, server-side AI proxying, data encryption policies, regulatory compliance, rate limiting, and comprehensive security auditing would be recommended.

---

# 🎯 Project Vision

JanaSetu is built around a simple idea:

> **Citizens should not need to understand the structure of government to access government services.**

Instead of asking citizens to determine which portal, department, website, or process they need, JanaSetu aims to provide one accessible interface from which they can discover and interact with public services.

```text
                   TODAY

Citizen
   │
   ├── Portal A
   ├── Portal B
   ├── Department C
   ├── Scheme Website
   ├── Grievance Portal
   └── Government Office


                WITH JANASETU

Citizen
   │
   ▼
┌─────────────────────┐
│      JANASETU       │
│                     │
│ One Citizen Gateway │
└──────────┬──────────┘
           │
           ├── Schemes
           ├── Grievances
           ├── Applications
           ├── Documents
           ├── Appointments
           ├── Announcements
           └── AI Assistance
```

---

# 🔮 Future Scope

JanaSetu can be expanded further with:

* 🪪 DigiLocker integration
* 🆔 Government identity verification
* 📱 Native Android/iOS application
* 🎙️ Voice-based navigation
* 🗣️ Expanded Indian-language support
* 🧠 AI-based scheme recommendations
* 🤖 Conversational citizen assistant
* 📊 Personalized citizen dashboard
* 🔔 SMS / WhatsApp notifications
* 🏛️ Direct department integrations
* 📍 Location-aware service discovery
* 📝 AI-assisted grievance drafting
* 🔎 Unified application tracking
* ♿ Advanced accessibility features
* 📈 Government analytics dashboards
* 🔐 Stronger production identity and authorization systems

---

# 🌍 Social Impact

JanaSetu is designed around **digital inclusion**.

A successful implementation could particularly help users who struggle with:

* Navigating complex government websites
* Understanding eligibility requirements
* Finding relevant schemes
* Identifying the correct grievance channel
* Tracking government applications
* Language barriers
* Managing documents across different services

The long-term goal is not simply digitization.

It is to make digital public services **discoverable, understandable and accessible**.

---

# 👨‍💻 Author

**Kartheek**

GitHub:
https://github.com/Kartheek18153

---

# ⭐ JanaSetu

### One Platform. Multiple Services. A Stronger Citizen–Government Connection.

Built with **React, TypeScript, Firebase, Vite and AI** to make digital public services simpler and more accessible.
