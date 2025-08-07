# TabTrackr - Chrome Extension for Productivity & Time Tracking 🚀

> [!WARNING]
> **🚧 UNDER ACTIVE DEVELOPMENT 🚧**
>
> TabTrackr is currently in **early development stage** and not yet ready for production use. Many features are still being implemented and the extension is not available on the Chrome Web Store yet.
>
> 📋 **Track Development Progress:** Check our detailed [project roadmap and todo list](.cursor/memory-bank/todo.md) to see what's completed and what's coming next.
>
> 🤝 **Want to Contribute?** We welcome early contributors! Please read our [Contributing Guide](CONTRIBUTING.md) and check the todo list for tasks you can help with.
>
> ⭐ **Star & Watch** this repo to get notified when we release the first stable version!

<div align="center">

![TabTrackr Logo](https://img.shields.io/badge/TabTrackr-Productivity%20Extension-blue?style=for-the-badge&logo=googlechrome)

**A powerful Chrome extension that tracks your browsing time, analyzes productivity patterns, and enables real-time team collaboration for remote teams and accountability partners.**

[![Chrome Extension](https://img.shields.io/badge/Chrome-Extension-success?style=flat&logo=googlechrome)](https://chrome.google.com/webstore)
[![TypeScript](https://img.shields.io/badge/TypeScript-100%25-blue?style=flat&logo=typescript)](https://www.typescriptlang.org/)
[![React](https://img.shields.io/badge/React-19-61dafb?style=flat&logo=react)](https://reactjs.org/)
[![Supabase](https://img.shields.io/badge/Supabase-Backend-green?style=flat&logo=supabase)](https://supabase.io/)
<!-- [![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg?style=flat)](https://opensource.org/licenses/MIT) -->

[🌐 **Live Demo**](https://tabtrackr.imbios.dev) • [📖 **Documentation**](https://docs.tabtrackr.imbios.dev) • [🐛 **Report Bug**](https://github.com/ImBIOS/tab-trackr/issues) • [💡 **Request Feature**](https://github.com/ImBIOS/tab-trackr/issues)

</div>

## 🎯 What is TabTrackr?

TabTrackr is a comprehensive **browser productivity extension** that helps individuals and teams understand their browsing habits, improve focus, and boost productivity through real-time tracking and analytics.

### 🔥 Key Features

- **⏱️ Real-Time Tab Tracking** - Automatically tracks time spent on every website and tab
- **📊 Visual Analytics Dashboard** - Beautiful charts showing daily, weekly, and monthly browsing patterns
- **👥 Team Collaboration** - Share productivity stats with teammates and accountability partners
- **🎯 Focus Mode** - Block distracting websites during focused work sessions
- **⚡ Performance Optimized** - Minimal battery and CPU usage with smart background processing
- **🔒 Privacy-First** - Complete control over data sharing with enterprise-grade security
- **📱 Cross-Device Sync** - Access your productivity data across all devices
- **🎨 Modern UI** - Clean, intuitive interface built with React and Tailwind CSS

## 🚀 Quick Start Guide

### Chrome Extension Installation

1. **Install from Chrome Web Store** (Recommended)

   ```
   Visit: https://chrome.google.com/webstore/detail/tabtrackr/[extension-id]
   Click "Add to Chrome"
   ```

2. **Manual Installation** (Developer Mode)

   ```bash
   # Clone the repository
   git clone https://github.com/imbios/tab-trackr.git
   cd tab-trackr

   # Install dependencies
   pnpm install

   # Build the extension
   pnpm build:ext

   # Load in Chrome: chrome://extensions/ > Developer mode > Load unpacked > select apps/ext/dist
   ```

### Dashboard Setup

1. **Run the web dashboard locally:**

   ```bash
   # Install dependencies (if not already done)
   pnpm install

   # Start development server
   pnpm dev

   # Access dashboard at http://localhost:3001
   ```

2. **Environment Configuration:**

   ```bash
   # Copy environment files
   cp apps/web/.env.example apps/web/.env.local
   cp apps/ext/.env.example apps/ext/.env

   # Add your Supabase credentials
   # NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
   # NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
   ```

## 🏗️ Architecture & Technology Stack

### Frontend Technologies

- **React 18+** - Modern UI component library
- **TypeScript** - Type-safe development
- **Tailwind CSS** - Utility-first CSS framework
- **Shadcn/UI** - Reusable component library
- **Next.js 14** - Full-stack React framework
- **Chart.js/Recharts** - Data visualization

### Backend & Infrastructure

- **Supabase** - Backend-as-a-Service with real-time capabilities
- **PostgreSQL** - Robust relational database
- **Row Level Security** - Enterprise-grade data protection
- **Real-time Subscriptions** - Live data updates

### Chrome Extension

- **Manifest V3** - Latest Chrome extension standard
- **Service Workers** - Background processing
- **Chrome APIs** - `tabs`, `identity`, `storage`, `activeTab`
- **Content Security Policy** - Secure extension architecture

### Development Tools

- **Turborepo** - Monorepo build system
- **Biome** - Lightning-fast linting and formatting
- **pnpm** - Efficient package management
- **WXT** - Modern extension framework

## 📁 Project Structure

```
tab-trackr/
├── apps/
│   ├── web/                 # Next.js Dashboard Application
│   │   ├── src/app/         # App router pages
│   │   ├── src/components/  # React components
│   │   └── src/lib/         # Utilities and configurations
│   ├── ext/                 # Chrome Extension
│   │   ├── src/entrypoints/ # Extension entry points
│   │   ├── src/components/  # Extension UI components
│   │   └── public/          # Extension assets
│   └── doc/                 # Documentation site
├── supabase/               # Database schema and migrations
├── biome.jsonc            # Code formatting configuration
└── turbo.json             # Monorepo build configuration
```

## 🎨 Screenshots & Demo

### Extension Popup

*Clean, minimal interface showing today's browsing summary*

### Analytics Dashboard

*Comprehensive charts and insights into productivity patterns*

### Team Collaboration

*Real-time view of team member activity (with privacy controls)*

> 📸 Screenshots and live demo available at [tabtrackr.com](https://tabtrackr.com)

## ⚙️ Configuration & Customization

### Extension Settings

- **Tracking Toggle** - Enable/disable automatic tracking
- **Privacy Mode** - Control what data gets synced
- **Website Categories** - Customize productivity classifications
- **Focus Sessions** - Set up distraction-free work periods

### Dashboard Preferences

- **Theme Selection** - Dark/light mode toggle
- **Chart Types** - Customize visualization preferences
- **Data Retention** - Control how long data is stored
- **Team Settings** - Manage collaboration features

## 🔧 Development & Contributing

### Prerequisites

- Node.js 18+ and pnpm
- Chrome browser for extension testing
- Supabase account for backend services

### Development Workflow

```bash
# Start all development servers
pnpm dev

# Start specific applications
pnpm dev:web     # Dashboard only
pnpm dev:ext     # Extension only
pnpm dev:doc     # Documentation only

# Build for production
pnpm build

# Code quality checks
pnpm check       # Biome linting and formatting
pnpm check-types # TypeScript validation
```

### Testing

```bash
# Run unit tests
pnpm test

# Run integration tests
pnpm test:integration

# Run extension-specific tests
pnpm test:ext
```

## 🛣️ Roadmap & Upcoming Features

### Phase 2: Advanced Analytics

- [ ] AI-powered productivity insights
- [ ] Automated website categorization
- [ ] Focus session recommendations
- [ ] Weekly productivity reports

### Phase 3: Team Features

- [ ] Team challenges and leaderboards
- [ ] Shared productivity goals
- [ ] Manager dashboard for team oversight
- [ ] Integration with Slack/Discord

### Phase 4: Advanced Integrations

- [ ] Calendar integration for context
- [ ] Time tracking app connections
- [ ] API for third-party integrations
- [ ] Mobile companion app

## 🔒 Privacy & Security

TabTrackr is built with privacy as a core principle:

- **🛡️ Local-First Data** - All tracking happens locally by default
- **🔐 Encrypted Sync** - Optional cloud sync uses end-to-end encryption
- **👤 Anonymous Analytics** - No personal data in usage statistics
- **📝 Transparent Permissions** - Clear explanation of all required permissions
- **🗑️ Data Portability** - Export or delete your data anytime

## 📊 Performance & Optimization

- **Minimal Resource Usage** - < 1% CPU impact during normal browsing
- **Smart Background Processing** - Efficient tab tracking without performance loss
- **Optimized Bundle Size** - Extension under 2MB total size
- **Real-time Sync** - Sub-second data updates across devices

## 🤝 Contributing

We welcome contributions! Please see our [Contributing Guide](CONTRIBUTING.md) for details.

### Ways to Contribute

- 🐛 **Bug Reports** - Help us identify and fix issues
- 💡 **Feature Requests** - Suggest new functionality
- 📝 **Documentation** - Improve guides and API docs
- 🧪 **Testing** - Help test new features and releases
- 💻 **Code Contributions** - Submit pull requests

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- Built with [Better-T-Stack](https://github.com/AmanVarshney01/create-better-t-stack)
- UI components from [shadcn/ui](https://ui.shadcn.com/)
- Backend powered by [Supabase](https://supabase.io/)
- Extension framework by [WXT](https://wxt.dev/)

## 📞 Support & Community

- 💬 **Discord Community** - [Join our Discord](https://discord.gg/tabtrackr)
- 📧 **Email Support** - <support@tabtrackr.com>
- 🐦 **Twitter** - [@TabTrackrApp](https://twitter.com/TabTrackrApp)
- 📚 **Documentation** - [docs.tabtrackr.com](https://docs.tabtrackr.com)

---

<div align="center">

**⭐ Star this repository if TabTrackr helps boost your productivity!**

Made with ❤️ by the TabTrackr Team

</div>

## 🏷️ Keywords

Chrome Extension, Productivity Tracker, Time Tracking, Browser Analytics, Tab Management, Focus Timer, Team Collaboration, Remote Work Tools, Productivity Dashboard, Website Blocker, Time Management, Digital Wellbeing, Work Analytics, Browsing Habits, Productivity Insights
