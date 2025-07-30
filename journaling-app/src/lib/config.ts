export const config = {
  // Database Configuration
  database: {
    url: process.env.DATABASE_URL || 'file:./data/journaling-app.db',
  },

  // NextAuth Configuration
  nextAuth: {
    url: process.env.NEXTAUTH_URL || 'http://localhost:3003',
    secret: process.env.NEXTAUTH_SECRET || 'your-nextauth-secret-here',
  },

  // Google OAuth Configuration
  google: {
    clientId: process.env.GOOGLE_CLIENT_ID || 'your-google-client-id-here',
    clientSecret: process.env.GOOGLE_CLIENT_SECRET || 'your-google-client-secret-here',
  },

  // OpenAI Configuration
  openai: {
    apiKey: process.env.OPENAI_API_KEY || 'your-openai-api-key-here',
  },

  // App Configuration
  app: {
    name: 'Chaitan Journaling App',
    version: '1.0.0',
    environment: process.env.NODE_ENV || 'development',
  },
}; 