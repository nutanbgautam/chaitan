# Chaitan - AI-Powered Personal Journaling & Life Analytics

A comprehensive personal journaling and life analytics platform powered by AI, designed to help users track their personal growth, relationships, finances, and life goals through intelligent analysis and insights.

## 🚀 Current Status

The application is **fully functional** and running on **http://localhost:3000**. All core features are implemented and working:

### ✅ Working Features
- **Authentication**: Email/password and Google OAuth login
- **AI-Powered Journaling**: Voice and text journaling with intelligent analysis
- **Personality Tracking**: Big Five personality analysis and evolution
- **Life Area Management**: Wheel of Life assessment and tracking
- **Relationship Analytics**: People tracking and relationship insights
- **Financial Tracking**: Expense and income tracking with AI insights
- **Task Management**: Goal-oriented task tracking
- **Check-ins**: Mood, energy, and wellness tracking
- **Recaps**: Weekly and monthly personalized recaps
- **Dashboard**: Comprehensive analytics and insights

### 🔧 Recent Fixes
- ✅ Fixed authentication configuration issues
- ✅ Added missing OpenAI dependency
- ✅ Created centralized configuration management
- ✅ Resolved environment variable setup
- ✅ Added comprehensive setup scripts
- ✅ Fixed TypeScript compilation errors

## 🎯 Core Features

### AI-Powered Journaling
- **Voice Recording**: Record and transcribe voice journal entries
- **Text Journaling**: Rich text editor for written entries
- **Intelligent Analysis**: Sentiment analysis, entity extraction, and insights
- **Processing Types**: Transcribe-only or full AI analysis

### Personality & Life Analytics
- **SoulMatrix**: Big Five personality tracking and evolution
- **Wheel of Life**: 8 life areas assessment and goal tracking
- **Check-ins**: Daily mood, energy, and wellness tracking
- **Correlation Analysis**: Find patterns between different life aspects

### Relationship & Social Tracking
- **People Analytics**: Track relationships and interactions
- **Sentiment Analysis**: Understand relationship dynamics
- **Frequency Tracking**: Monitor relationship patterns
- **Context Awareness**: Capture relationship context and history

### Financial Intelligence
- **Expense Tracking**: Categorize and track expenses
- **Income Management**: Monitor income sources and patterns
- **AI Insights**: Get intelligent financial recommendations
- **Goal Tracking**: Set and monitor financial goals

### Goal & Task Management
- **Smart Task Extraction**: AI identifies tasks from journal entries
- **Goal Alignment**: Connect tasks to life area goals
- **Progress Tracking**: Monitor completion and progress
- **Priority Management**: Intelligent priority suggestions

### Personalized Insights
- **Weekly/Monthly Recaps**: Story-format personalized summaries
- **Life Area Nudges**: Intelligent recommendations for improvement
- **Predictive Analytics**: Identify patterns and predict trends
- **Actionable Recommendations**: Specific steps for growth

## 🛠️ Technology Stack

- **Frontend**: Next.js 15, React 19, TypeScript
- **Styling**: Tailwind CSS, Bootstrap
- **Authentication**: NextAuth.js
- **Database**: SQLite with better-sqlite3
- **AI**: OpenAI GPT-4o-mini
- **Charts**: Chart.js, Recharts
- **Voice**: Web Audio API
- **Forms**: React Hook Form with Zod validation

## 📦 Installation & Setup

### Quick Start
```bash
# Clone the repository
git clone <repository-url>
cd journaling-app

# Install dependencies
npm install

# Run setup script
npm run setup

# Start development server
npm run dev
```

### Environment Configuration
The setup script automatically creates a `.env.local` file with:
- NextAuth secret (auto-generated)
- OpenAI API key (pre-configured)
- Database configuration
- Google OAuth placeholders

### Manual Setup
If you prefer manual setup, create `.env.local`:
```env
NEXTAUTH_SECRET=your-secret-key
NEXTAUTH_URL=http://localhost:3000
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
OPENAI_API_KEY=your-openai-api-key
DATABASE_URL=./data/journaling-app.db
```

## 🎨 User Interface

### Modern Design
- **Responsive Layout**: Works on desktop, tablet, and mobile
- **Dark/Light Mode**: Automatic theme switching
- **Intuitive Navigation**: Easy-to-use interface
- **Real-time Updates**: Live data synchronization
- **Beautiful Charts**: Interactive data visualizations

### Key Pages
- **Dashboard**: Overview of all life areas and insights
- **Journal**: Create and manage journal entries
- **Wheel of Life**: Life area assessment and tracking
- **People**: Relationship management and analytics
- **Finance**: Financial tracking and insights
- **Goals**: Goal setting and progress tracking
- **Tasks**: Task management and organization
- **Check-ins**: Daily wellness tracking
- **Recaps**: Personalized weekly/monthly summaries

## 🔍 AI Analysis Capabilities

### Entity Extraction
- **People**: Names, relationships, sentiment, context
- **Finance**: Amounts, categories, transactions, decisions
- **Tasks**: Action items, deadlines, priorities, completion
- **Locations**: Places, travel, work, home references
- **Temporal**: Dates, times, durations, deadlines

### Sentiment Analysis
- **Emotional Tracking**: Joy, sadness, anger, fear, surprise
- **Mood Patterns**: Daily and weekly mood trends
- **Intensity Levels**: Emotional intensity scoring
- **Context Awareness**: Situation-based sentiment analysis

### Life Area Analysis
- **Relevance Scoring**: How entries relate to life areas
- **Priority Alignment**: Connection to user's priorities
- **Growth Tracking**: Progress in different life areas
- **Balance Assessment**: Overall life balance evaluation

## 📊 Data & Privacy

### Data Storage
- **Local SQLite Database**: All data stored locally
- **No Cloud Dependencies**: Complete privacy control
- **Automatic Backups**: Database backup functionality
- **Export Capabilities**: Data export in multiple formats

### Privacy Features
- **Local Processing**: AI analysis happens locally when possible
- **Secure Authentication**: Industry-standard auth practices
- **Data Encryption**: Sensitive data encryption
- **User Control**: Complete control over personal data

## 🚀 Getting Started

1. **First Visit**: Create an account or sign in
2. **Onboarding**: Complete the Wheel of Life assessment
3. **Start Journaling**: Create your first journal entry
4. **Explore Features**: Try voice recording, check-ins, and analytics
5. **Set Goals**: Define goals in different life areas
6. **Track Progress**: Monitor your growth and insights

## 🔧 Development

### Project Structure
```
src/
├── app/                 # Next.js app router
│   ├── api/            # API routes
│   ├── dashboard/      # Dashboard pages
│   ├── journal/        # Journal pages
│   └── ...
├── components/         # React components
├── lib/               # Utility libraries
├── types/             # TypeScript definitions
└── ...
```

### Key Commands
```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run start        # Start production server
npm run lint         # Run ESLint
npm run setup        # Run setup script
```

### API Routes
- `/api/auth/*` - Authentication
- `/api/journal/*` - Journal entries and analysis
- `/api/check-ins` - Daily check-ins
- `/api/wheel-of-life` - Life area tracking
- `/api/people` - Relationship management
- `/api/finance` - Financial tracking
- `/api/goals` - Goal management
- `/api/tasks` - Task management
- `/api/recaps` - Personalized recaps

## 🎯 Roadmap

### Planned Features
- [ ] Mobile app (React Native)
- [ ] Advanced analytics dashboard
- [ ] Integration with health apps
- [ ] Calendar integration
- [ ] Social features (optional)
- [ ] Advanced AI models
- [ ] Export to various formats
- [ ] Cloud sync (optional)

### Performance Improvements
- [ ] Database optimization
- [ ] Caching strategies
- [ ] Lazy loading
- [ ] Progressive Web App features

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License.

## 🆘 Support

- **Documentation**: See `setup.md` for detailed setup instructions
- **Issues**: Report bugs and feature requests via GitHub issues
- **Discussions**: Join community discussions for help and ideas

---

**Chaitan** - Your AI-powered companion for personal growth and life analytics. 🌟
