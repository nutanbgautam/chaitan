# Chaitan Journaling App Setup Guide

## Quick Start

1. **Install Dependencies**
   ```bash
   npm install
   ```

2. **Environment Configuration**
   Create a `.env.local` file in the root directory with the following variables:

   ```env
   # NextAuth Configuration
   NEXTAUTH_SECRET=your-secret-key-here-change-in-production
   NEXTAUTH_URL=http://localhost:3000

   # Google OAuth (optional - for Google sign-in)
   GOOGLE_CLIENT_ID=your-google-client-id
   GOOGLE_CLIENT_SECRET=your-google-client-secret

   # OpenAI Configuration
   OPENAI_API_KEY=your-openai-api-key

   # Database Configuration
   DATABASE_URL=./data/journaling-app.db
   ```

3. **Start Development Server**
   ```bash
   npm run dev
   ```

4. **Access the Application**
   Open [http://localhost:3000](http://localhost:3000) in your browser.

## Features

### Core Features
- **AI-Powered Journaling**: Voice and text journaling with intelligent analysis
- **Personality Tracking**: Big Five personality analysis and evolution tracking
- **Life Area Management**: Wheel of Life assessment and goal tracking
- **Relationship Analytics**: People tracking and relationship insights
- **Financial Tracking**: Expense and income tracking with insights
- **Task Management**: Goal-oriented task tracking
- **Check-ins**: Mood, energy, and wellness tracking
- **Recaps**: Weekly and monthly personalized recaps

### AI Analysis Capabilities
- Sentiment analysis and emotional tracking
- People extraction and relationship mapping
- Financial data extraction and categorization
- Task and goal identification
- Location and temporal reference tracking
- Life area relevance analysis
- Personalized insights and recommendations

## Database

The app uses SQLite for data storage. The database file is automatically created at `./data/journaling-app.db` on first run.

## Authentication

The app supports both email/password and Google OAuth authentication. For Google OAuth:

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing one
3. Enable Google+ API
4. Create OAuth 2.0 credentials
5. Add your domain to authorized origins
6. Update the environment variables with your credentials

## OpenAI Integration

The app uses OpenAI's GPT models for intelligent analysis. You'll need an OpenAI API key:

1. Sign up at [OpenAI](https://openai.com/)
2. Get your API key from the dashboard
3. Add it to your `.env.local` file

## Development

### Project Structure
```
src/
├── app/                 # Next.js app router pages
│   ├── api/            # API routes
│   ├── dashboard/      # Dashboard pages
│   ├── journal/        # Journal pages
│   └── ...
├── components/         # React components
├── lib/               # Utility libraries
├── types/             # TypeScript type definitions
└── ...
```

### Key Technologies
- **Next.js 15**: React framework with app router
- **NextAuth.js**: Authentication
- **SQLite**: Database
- **OpenAI API**: AI analysis
- **TypeScript**: Type safety
- **Tailwind CSS**: Styling
- **Chart.js**: Data visualization

## Troubleshooting

### Common Issues

1. **Authentication Errors**
   - Ensure NEXTAUTH_SECRET is set
   - Check Google OAuth credentials if using Google sign-in

2. **OpenAI API Errors**
   - Verify your API key is correct
   - Check your OpenAI account has sufficient credits

3. **Database Errors**
   - Ensure the `data` directory exists and is writable
   - Check file permissions

4. **Port Already in Use**
   - The app will automatically use the next available port
   - Check the terminal output for the correct URL

### Getting Help

If you encounter issues:
1. Check the browser console for errors
2. Review the terminal output for server errors
3. Ensure all environment variables are properly set
4. Try restarting the development server

## Production Deployment

For production deployment:

1. Set proper environment variables
2. Use a production database (PostgreSQL recommended)
3. Configure proper authentication providers
4. Set up proper CORS and security headers
5. Use a reverse proxy (nginx recommended)
6. Set up SSL certificates

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

This project is licensed under the MIT License. 