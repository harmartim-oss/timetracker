<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />
</div>

# Tim Harmar Legal - AI-Powered Practice Management

A modern, AI-powered time tracking and practice management system for legal professionals with advanced NLP capabilities and professional user authentication.

🌐 **Live Demo:** https://harmartim-oss.github.io/timetracker/

## ✨ New Features (Latest Release)

### 🔐 User Authentication System
- **Professional Landing Page** - Marketing-focused homepage with feature highlights and competitor comparison
- **Secure Sign Up** - Create accounts with password strength validation and role selection
- **User Login** - Secure authentication with session persistence
- **Profile Management** - Store firm information, billing rates, and user preferences

### 🧠 Advanced NLP/NLU Engine
- **Natural Language Time Entry** - Parse entries like "2.5 hours for Smith Corp contract review"
- **Entity Recognition** - Automatically extract clients, matters, and time durations
- **Practice Area Detection** - Identifies legal practice areas from context
- **Hybrid AI Approach** - Local NLP + Gemini AI for maximum accuracy
- **Confidence Scoring** - Transparent confidence levels for all extractions
- **Smart Suggestions** - Context-aware task suggestions based on practice area

### 🎨 Enhanced UI/UX
- **Professional Color Scheme** - Blue-based palette for trust and professionalism
- **Smooth Animations** - Subtle transitions and hover effects
- **Accessibility Improvements** - WCAG 2.1 AA compliant with keyboard navigation
- **Responsive Design** - Optimized for desktop, tablet, and mobile
- **Loading States** - Clear feedback for all asynchronous operations
- **Form Validation** - Real-time feedback with helpful error messages

## Core Features

- ⏱️ **Real-time Timer** - Track billable hours as you work
- 📝 **Time Entry Management** - Manual entry and editing capabilities
- 🧾 **Invoice Generation** - Create professional invoices with HST calculation and firm logo
- 🤖 **AI Assistant** - Powered by Google Gemini for task suggestions and legal research
- ✨ **AI Description Enhancement** - Improve time entry descriptions with AI suggestions
- 🏢 **Firm Branding** - Upload and display your firm logo on invoices and throughout the app
- 📊 **Analytics Dashboard** - Track billable hours and revenue
- ⚙️ **Customizable Settings** - Configure firm information, billing rates, and preferences
- 🔍 **Natural Language Processing** - Advanced text understanding for time entries
- 👥 **Multi-User Support** - Role-based access (Admin, Office Manager, Legal Assistant)

## Getting Started

### Prerequisites
- Node.js (v18 or higher)
- npm or yarn

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/harmartim-oss/timetracker.git
   cd timetracker
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. (Optional) Set the `GEMINI_API_KEY` in `.env.local` to enable AI features:
   ```bash
   VITE_GEMINI_API_KEY=your_api_key_here
   ```

4. Run the development server:
   ```bash
   npm run dev
   ```

5. Open http://localhost:5173/timetracker/ in your browser

### First Time Setup

1. Visit the landing page
2. Click "Get Started Free" to create your account
3. Fill in your details (name, email, firm name, password)
4. Sign in and start tracking time!

## Build for Production

```bash
npm run build
```

The built files will be in the `dist/` directory.

## Deployment

This app is automatically deployed to GitHub Pages when changes are pushed to the main branch. The deployment workflow builds the Vite app and publishes it to GitHub Pages.

## Technology Stack

- **React 18** - UI framework with hooks
- **Vite 6** - Build tool and dev server
- **Tailwind CSS** - Utility-first CSS framework
- **Lucide Icons** - Beautiful, consistent icon library
- **Google Gemini AI** - Advanced AI capabilities
- **localStorage** - Client-side data persistence

## Architecture

### Authentication System
- Password hashing (production should use bcrypt)
- Session management with localStorage
- Protected routes and user context
- Role-based access control

### NLP Engine
- Pattern-based entity extraction
- Confidence scoring for all extractions
- Hybrid local + cloud AI approach
- Extensible for spaCy integration (see `NLP_INTEGRATION.md`)

### UI/UX Design
- Mobile-first responsive design
- WCAG 2.1 AA accessibility compliance
- Professional legal industry color scheme
- Smooth animations and transitions
- Loading states and error handling

## Key Features in Detail

### 🔐 Authentication & Security
**User Registration**
- Email validation
- Password strength requirements (8+ characters)
- Password confirmation matching
- Real-time validation feedback

**Session Management**
- Persistent login across sessions
- Secure logout functionality
- User profile associated with all data
- Role-based permissions

### 🧠 Natural Language Processing
**Time Entry Parsing**
```
Input: "log 2.5 hours for Smith Corp contract review"
Output: {
  client: "Smith Corp",
  matter: "contract review",
  hours: 2,
  minutes: 30,
  confidence: 85%
}
```

**Supported Formats**
- Decimal hours: "2.5 hours", "3.25h"
- Explicit time: "3 hours 15 minutes"
- Fractions: "1 and 1/2 hours"
- Ranges: "2-3 hours" (averages to 2.5)

**Entity Recognition**
- Client names (companies and individuals)
- Matter descriptions
- Practice areas (8 categories)
- Task descriptions with confidence scoring

### 🎨 Professional UI Design
**Landing Page**
- Hero section with clear value proposition
- Feature grid with icons and descriptions
- Benefits section with metrics
- Competitor comparison table
- Professional footer

**Authentication Pages**
- Clean, focused form design
- Real-time validation
- Password strength indicator
- Loading states
- Error messaging

**Main Application**
- Gradient header with branding
- Card-based layout
- Consistent spacing and typography
- Hover effects and animations
- Mobile-responsive design

### 🏢 Firm Branding
Upload your law firm's logo in Settings and it will automatically appear:
- In the application header
- On all generated invoices
- Professional, responsive sizing
- Supports PNG, JPG, and SVG formats (max 2MB)

### 🤖 AI-Powered Features
**Description Enhancement**
- Click "AI Enhance" next to any task description
- Get professional, billable-hour appropriate suggestions
- Accept or reject AI improvements with one click
- Powered by Google Gemini AI

**Natural Language Entry**
- Type entries in plain English
- Automatic parsing of clients, matters, and time
- Confidence scoring for accuracy
- Fallback to manual entry if needed

**Task Suggestions**
- Context-aware suggestions based on practice area
- Common legal tasks pre-populated
- Billable hour appropriate descriptions

**Legal Research Assistant**
- AI-powered legal research queries
- Relevant case law and statutes
- Canadian and Ontario law focus

**Predictive Billing**
- Revenue forecasting
- Efficiency trend analysis
- Actionable recommendations

### 📊 Professional Invoice Generation
- Automatic firm logo placement
- Uses your firm's contact information from settings
- HST calculation for Ontario
- Professional layout and typography
- Export-ready format
- Status tracking (draft, sent, paid, overdue)

### ⚙️ Customizable Settings
- Firm information and contact details
- Logo upload and management
- Default billing rates and payment terms
- User profiles and roles (Admin, Office Manager, Legal Assistant)
- Invoice preferences and templates

## Documentation

- **[NLP_INTEGRATION.md](NLP_INTEGRATION.md)** - Detailed NLP/NLU implementation and spaCy integration guide
- **[UI_BEST_PRACTICES.md](UI_BEST_PRACTICES.md)** - UI/UX design principles and best practices
- **[IMPLEMENTATION_NOTES.md](IMPLEMENTATION_NOTES.md)** - Technical implementation details

## Browser Support

- Chrome/Edge (latest)
- Firefox (latest)
- Safari (latest)
- Mobile browsers (iOS Safari, Chrome Mobile)

## Security Notes

**Current Implementation (Demo/Development)**
- Uses localStorage for data persistence
- Simple password hashing (not production-ready)
- No backend server required

**Production Recommendations**
- Implement proper backend with Node.js/Express
- Use bcrypt for password hashing
- Implement JWT tokens for authentication
- Use PostgreSQL/MongoDB for data storage
- Enable HTTPS
- Add rate limiting and CSRF protection
- Implement proper audit logging

## Contributing

Contributions are welcome! Please follow these guidelines:

1. Fork the repository
2. Create a feature branch
3. Make your changes with clear commit messages
4. Test thoroughly
5. Submit a pull request

## License

This project is part of the Tim Harmar Legal practice management system.

## Support

For questions or issues:
- Email: contact@timharmar.com
- GitHub Issues: [Create an issue](https://github.com/harmartim-oss/timetracker/issues)

## Acknowledgments

- Google Gemini AI for natural language processing
- Tailwind CSS for the styling framework
- Lucide for the beautiful icon set
- The open-source community for inspiration and tools
