<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />
</div>

# Tim Harmar Legal - AI-Powered Practice Management

A modern, AI-powered time tracking and practice management system for legal professionals.

🌐 **Live Demo:** https://harmartim-oss.github.io/timetracker/

## Features

- ⏱️ **Real-time Timer** - Track billable hours as you work
- 📝 **Time Entry Management** - Manual entry and editing capabilities
- 🧾 **Invoice Generation** - Create professional invoices with HST calculation
- 🤖 **AI Assistant** - Powered by Google Gemini for task suggestions and legal research
- 📊 **Analytics Dashboard** - Track billable hours and revenue

## Run Locally

**Prerequisites:**  Node.js (v18 or higher)

1. Install dependencies:
   ```bash
   npm install
   ```

2. (Optional) Set the `GEMINI_API_KEY` in `.env.local` to enable AI features:
   ```bash
   GEMINI_API_KEY=your_api_key_here
   ```

3. Run the development server:
   ```bash
   npm run dev
   ```

4. Open http://localhost:5173/timetracker/ in your browser

## Build for Production

```bash
npm run build
```

The built files will be in the `dist/` directory.

## Deployment

This app is automatically deployed to GitHub Pages when changes are pushed to the main branch. The deployment workflow builds the Vite app and publishes it to GitHub Pages.

## Technology Stack

- **React** - UI framework
- **Vite** - Build tool and dev server
- **Tailwind CSS** - Styling
- **Lucide Icons** - Icon library
- **Google Gemini AI** - AI-powered features
