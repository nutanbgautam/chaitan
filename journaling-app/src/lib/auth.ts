import { AuthOptions } from 'next-auth';
import GoogleProvider from 'next-auth/providers/google';
import CredentialsProvider from 'next-auth/providers/credentials';
import { getDatabase } from '@/lib/database';
import { compare } from 'bcryptjs';
import { config } from '@/lib/config';

// Extend the session type to include user id
declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      name?: string | null;
      email?: string | null;
      image?: string | null;
    }
  }
}

export const authOptions: AuthOptions = {
  providers: [
    GoogleProvider({
      clientId: config.google.clientId,
      clientSecret: config.google.clientSecret,
    }),
    CredentialsProvider({
      name: 'credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null;
        }

        try {
          const db = getDatabase();
          const user = db.getUserByEmail(credentials.email);
          
          if (!user) {
            return null;
          }

          // Verify password using bcrypt
          const isValidPassword = await compare(credentials.password, user.password);
          if (isValidPassword) {
            return {
              id: user.id,
              email: user.email,
              name: user.name,
              image: user.avatarUrl,
            };
          }

          return null;
        } catch (error) {
          console.error('Credentials authorization error:', error);
          return null;
        }
      }
    })
  ],
  pages: {
    signIn: '/login',
  },
  session: {
    strategy: 'jwt',
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  cookies: {
    sessionToken: {
      name: process.env.NODE_ENV === 'production' ? '__Secure-next-auth.session-token' : 'next-auth.session-token',
      options: {
        httpOnly: true,
        sameSite: 'lax',
        path: '/',
        secure: process.env.NODE_ENV === 'production',
      },
    },
    callbackUrl: {
      name: process.env.NODE_ENV === 'production' ? '__Secure-next-auth.callback-url' : 'next-auth.callback-url',
      options: {
        sameSite: 'lax',
        path: '/',
        secure: process.env.NODE_ENV === 'production',
      },
    },
    csrfToken: {
      name: process.env.NODE_ENV === 'production' ? '__Secure-next-auth.csrf-token' : 'next-auth.csrf-token',
      options: {
        httpOnly: true,
        sameSite: 'lax',
        path: '/',
        secure: process.env.NODE_ENV === 'production',
      },
    },
  },
  callbacks: {
    async jwt({ token, user, account }: any) {
      console.log('JWT callback called:', { 
        token: !!token, 
        user: !!user, 
        account: !!account,
        hasTokenId: !!token?.id,
        hasTokenEmail: !!token?.email,
        userEmail: user?.email,
        accountProvider: account?.provider
      });
      
      // If we have user data, set the ID
      if (user) {
        token.id = user.id;
        console.log('JWT callback - Set user ID from user object:', user.id);
      }
      
      // If we have a token but no user ID, try to get it from the database
      if (token && !token.id && token.email) {
        try {
          const db = getDatabase();
          const dbUser = db.getUserByEmail(token.email);
          if (dbUser) {
            token.id = dbUser.id;
            console.log('JWT callback - Retrieved user ID from database:', {
              email: token.email,
              userId: dbUser.id
            });
          } else {
            console.log('JWT callback - No user found in database for email:', token.email);
          }
        } catch (error) {
          console.error('JWT callback - Error getting user from database:', error);
        }
      }
      
      // If this is a Google sign-in, ensure we have the correct user ID
      if (account?.provider === 'google' && user?.id) {
        try {
          const db = getDatabase();
          const dbUser = db.getUserByGoogleId(user.id);
          if (dbUser) {
            token.id = dbUser.id;
            console.log('JWT callback - Updated token ID from Google:', {
              originalId: user.id,
              actualId: dbUser.id
            });
          } else {
            console.log('JWT callback - No user found in database for Google ID:', user.id);
          }
        } catch (error) {
          console.error('JWT callback error:', error);
          // In production, if database fails, use the Google ID as fallback
          if (process.env.NODE_ENV === 'production') {
            token.id = user.id;
            console.log('JWT callback - Using Google ID as fallback in production:', user.id);
          }
        }
      }
      
      // Final fallback: if we still don't have an ID but have an email, create user
      if (token && !token.id && token.email && process.env.NODE_ENV === 'production') {
        try {
          const db = getDatabase();
          console.log('JWT callback - Creating user in production for email:', token.email);
          
          const userId = db.createUser({
            email: token.email,
            name: token.name || undefined,
            googleId: account?.provider === 'google' ? user?.id : undefined,
          });
          
          token.id = userId;
          console.log('JWT callback - Created user in production with ID:', userId);
        } catch (error) {
          console.error('JWT callback - Error creating user in production:', error);
        }
      }
      
      console.log('JWT callback - Final token:', {
        id: token.id,
        email: token.email,
        hasId: !!token.id
      });
      
      return token;
    },
    async session({ session, token }: any) {
      console.log('Session callback called:', { 
        hasSession: !!session, 
        hasToken: !!token,
        hasTokenId: !!token?.id,
        hasTokenEmail: !!token?.email,
        sessionUserId: session?.user?.id
      });
      
      if (token && session.user) {
        session.user.id = token.id as string;
        
        // If we don't have a user ID but have an email, try to get it from database
        if (!token.id && token.email) {
          try {
            const db = getDatabase();
            const user = db.getUserByEmail(token.email);
            if (user) {
              session.user.id = user.id;
              console.log('Session callback - Retrieved user ID from database:', {
                email: token.email,
                userId: user.id
              });
            } else {
              console.log('Session callback - No user found in database for email:', token.email);
            }
          } catch (error) {
            console.error('Session callback - Error getting user from database:', error);
          }
        }
        
        // If this looks like a Google ID, try to get the actual user ID
        if (token.id && token.id.length > 20) {
          try {
            const db = getDatabase();
            const user = db.getUserByGoogleId(token.id as string);
            if (user) {
              session.user.id = user.id;
              console.log('Session callback - Updated user ID from Google ID:', {
                googleId: token.id,
                actualId: user.id
              });
            } else {
              console.log('Session callback - No user found in database for Google ID:', token.id);
            }
          } catch (error) {
            console.error('Session callback error:', error);
            // In production, if database fails, keep the Google ID
            if (process.env.NODE_ENV === 'production') {
              session.user.id = token.id as string;
              console.log('Session callback - Using Google ID as fallback in production:', token.id);
            }
          }
        }
        
        // Final fallback: if we still don't have an ID but have an email, create user
        if (!session.user.id && token.email && process.env.NODE_ENV === 'production') {
          try {
            const db = getDatabase();
            console.log('Session callback - Creating user in production for email:', token.email);
            
            const userId = db.createUser({
              email: token.email,
              name: token.name || undefined,
            });
            
            session.user.id = userId;
            console.log('Session callback - Created user in production with ID:', userId);
          } catch (error) {
            console.error('Session callback - Error creating user in production:', error);
          }
        }
      }
      
      console.log('Session callback - Final session:', {
        userId: session.user?.id,
        email: session.user?.email,
        hasUserId: !!session.user?.id
      });
      
      return session;
    },
    async signIn({ user, account, profile }: any) {
      console.log('SignIn callback called:', { 
        hasUser: !!user, 
        hasAccount: !!account, 
        provider: account?.provider,
        userEmail: user?.email,
        userGoogleId: profile?.sub
      });
      
      if (account?.provider === 'google') {
        try {
          const db = getDatabase();
          
          // First, try to find user by Google ID
          let existingUser = db.getUserByGoogleId(profile?.sub);
          
          // If not found by Google ID, try to find by email
          if (!existingUser && user?.email) {
            existingUser = db.getUserByEmail(user.email);
            console.log('SignIn callback - User lookup by email:', {
              email: user.email,
              found: !!existingUser,
              userId: existingUser?.id
            });
          }
          
          if (!existingUser) {
            // Create new user
            console.log('SignIn callback - Creating new user:', {
              email: user.email,
              name: user.name,
              googleId: profile?.sub
            });
            
            const userId = db.createUser({
              email: user.email!,
              name: user.name || undefined,
              googleId: profile?.sub,
              avatarUrl: user.image || undefined,
            });
            
            user.id = userId;
            console.log('SignIn callback - Created new user with ID:', userId);
          } else {
            // Update existing user with Google ID if not already set
            if (!existingUser.google_id && profile?.sub) {
              console.log('SignIn callback - Updating existing user with Google ID:', {
                userId: existingUser.id,
                googleId: profile?.sub
              });
              // Note: You might need to add an updateUser method to your database
            }
            
            user.id = existingUser.id;
            console.log('SignIn callback - Using existing user ID:', existingUser.id);
          }
          
          console.log('SignIn callback - Final user ID:', user.id);
          return true;
        } catch (error) {
          console.error('SignIn callback error:', error);
          // In production, if database fails, still allow sign-in
          if (process.env.NODE_ENV === 'production') {
            user.id = profile?.sub || user.id;
            console.log('SignIn callback - Using fallback ID due to database error:', user.id);
            return true;
          }
          return false;
        }
      }
      return true;
    },
  },
  debug: process.env.NODE_ENV === 'development',
  useSecureCookies: process.env.NODE_ENV === 'production',
  secret: config.nextAuth.secret,
}; 