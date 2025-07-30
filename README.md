# Chaitan Journaling App

A comprehensive AI-powered journaling application built with Next.js 14, featuring voice transcription, sentiment analysis, and life area tracking.

## 🌟 Features

### Core Functionality
- **AI-Powered Journaling**: Voice and text journaling with OpenAI integration
- **Sentiment Analysis**: Automatic mood and emotion tracking
- **Life Area Tracking**: Wheel of Life integration with 8 life areas
- **Goal Management**: Create and track goals for each life area
- **People Management**: Track relationships and interactions
- **Check-ins**: Daily mood and energy tracking
- **Recaps**: Weekly/monthly summaries with AI insights
- **Task Management**: Todo list with completion tracking

### Authentication
- **Google OAuth**: Secure sign-in with Google
- **Email/Password**: Traditional authentication
- **Session Management**: Persistent user sessions

### AI Features
- **Voice Transcription**: Whisper API integration
- **Content Analysis**: GPT-4 powered insights
- **Entity Extraction**: People, places, and topics detection
- **Sentiment Tracking**: Mood analysis over time
- **Personalized Insights**: AI-generated recommendations

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ 
- npm or yarn
- SQLite3
- OpenAI API key
- Google OAuth credentials

### Installation

1. **Clone the repository**
   ```bash
   git clone <your-repo-url>
   cd ChaitanAppRevised
   ```

2. **Install dependencies**
   ```bash
   npm install
   cd journaling-app
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp journaling-app/.env.example journaling-app/.env.local
   ```
   
   Edit `.env.local` with your credentials:
   ```env
   # Database
   DATABASE_URL=file:./data/journaling-app.db
   
   # NextAuth Configuration
   NEXTAUTH_URL=http://localhost:3003
   NEXTAUTH_SECRET=your-secret-here
   
   # Google OAuth
   GOOGLE_CLIENT_ID=your-google-client-id
   GOOGLE_CLIENT_SECRET=your-google-client-secret
   
   # OpenAI
   OPENAI_API_KEY=your-openai-api-key
   ```

4. **Run the development server**
   ```bash
   cd journaling-app
   PORT=3003 npm run dev
   ```

5. **Open your browser**
   Navigate to [http://localhost:3003](http://localhost:3003)

## 📱 Mobile App

### Android Build
```bash
cd journaling-app
npm run build
npx cap sync
npx cap build android
```

### iOS Build
```bash
cd journaling-app
npm run build
npx cap sync
npx cap build ios
```

## 🛠️ Development

### Project Structure
```
journaling-app/
├── src/
│   ├── app/                 # Next.js 14 app router
│   │   ├── api/            # API routes
│   │   ├── dashboard/      # Dashboard pages
│   │   ├── journal/        # Journal pages
│   │   └── ...
│   ├── components/         # React components
│   ├── lib/               # Utilities and configs
│   └── types/             # TypeScript definitions
├── data/                  # SQLite database
├── public/               # Static assets
└── scripts/              # Build and setup scripts
```

### Key Technologies
- **Frontend**: Next.js 14, React 18, TypeScript
- **Styling**: Tailwind CSS, Bootstrap
- **Database**: SQLite3 with better-sqlite3
- **Authentication**: NextAuth.js
- **AI**: OpenAI API (GPT-4, Whisper)
- **Mobile**: Capacitor
- **Deployment**: Vercel, Netlify, Custom servers

## 🚀 Deployment

### Web Deployment
- **Vercel**: `vercel --prod`
- **Netlify**: `netlify deploy --prod`
- **Custom Server**: See `PLAN.md` for detailed instructions

### Mobile Deployment
- **Android**: Generate APK with `npx cap build android`
- **iOS**: Use Xcode to build and distribute

## 📊 Database Schema

### Core Tables
- `users`: User accounts and profiles
- `journal_entries`: Journal entries with metadata
- `analysis_results`: AI analysis results
- `check_ins`: Daily mood and energy tracking
- `people`: Relationship tracking
- `goals`: Goal management
- `tasks`: Todo items
- `wheel_of_life`: Life area assessments
- `recaps`: Weekly/monthly summaries

## 🔧 API Endpoints

### Authentication
- `POST /api/auth/signin/google` - Google OAuth
- `POST /api/auth/signin/credentials` - Email/password

### Journal
- `GET /api/journal/entries` - List entries
- `POST /api/journal/entries` - Create entry
- `POST /api/journal/analyze` - AI analysis

### Analytics
- `GET /api/analytics/correlations` - Mood correlations
- `GET /api/analytics/personality-evolution` - Growth tracking

### Life Areas
- `GET /api/wheel-of-life` - Life area data
- `POST /api/wheel-of-life` - Update assessments

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- OpenAI for AI capabilities
- NextAuth.js for authentication
- Capacitor for mobile development
- The open-source community

## 📞 Support

For support, email support@chaitan.app or create an issue in this repository.

---

**Built with ❤️ for mindful journaling and personal growth** 