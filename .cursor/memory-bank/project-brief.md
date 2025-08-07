# Project Idea: "TabTrackr" - A Chrome Extension for Productivity and Real-Time Team Collaboration

---

## 🧠 Core Concept

A Chrome Extension that tracks your active tabs and browsing time in real-time, visualizes it in a dashboard (via Supabase), and lets users optionally share their activity with a team (e.g., for accountability partners or remote teams).

---

## 💡 Why it's a solid portfolio project

* Real-world use case
* Covers **auth**, **database**, **browser APIs**, **real-time sync**, **Chrome extension security**, and **React+TS+Tailwind+Shadcn UI**
* Demonstrates thoughtful **UX around permissions, CSP, and privacy**

---

## 👨‍💻 Features Breakdown

### **Frontend (Chrome Extension + Dashboard UI)**

* Popup: Minimalist UI to toggle tracking, see time summary, and sign in (Chrome Identity API)
* Options page: Preferences for tracking, team sync, dark mode toggle
* Full dashboard (in a React app):

  * Visualize browsing time per site (daily/weekly)
  * Team panel: See what your teammates are currently browsing (optional/consented)
  * Tailwind + Shadcn for modern UI

### **Backend (Supabase or Firebase)**

* Auth: Sign in with Google (Chrome Identity API → Supabase Auth)
* DB: Store tab activity (`url`, `duration`, `timestamp`, `userId`)
* Realtime: Live update teammates' browsing activity on dashboard
* REST API: For fallback or additional endpoints (e.g., manual sync)

### **Chrome Extension (Manifest V3)**

* Uses `tabs`, `identity`, and `storage` APIs
* Background service worker to log tab activity every X seconds
* Handles OAuth2 via Chrome Identity API, then syncs to Supabase
* Extension CSP: Securely load resources and handle inline scripts safely

---

## ⚙️ Technologies Used

| Area      | Stack                                                       |
| --------- | ----------------------------------------------------------- |
| UI        | React + TypeScript + Tailwind CSS + Shadcn UI               |
| Extension | Manifest V3, Chrome APIs (`tabs`, `identity`, `storage`)    |
| Backend   | Supabase (or Firebase) for Auth, Realtime, and DB           |
| APIs      | REST endpoints for custom data sync                         |
| Security  | Uses secure permissions, token handling, CSP best practices |

---

## 🧪 Bonus (Optional Enhancements)

* Pomodoro mode
* Blocking distracting sites temporarily
* Charts: Daily usage graph with `Recharts` or `Chart.js`
* Notification API for alerts (break reminders)
