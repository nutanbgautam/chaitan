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
      name: `next-auth.session-token`,
      options: {
        httpOnly: true,
        sameSite: 'lax',
        path: '/',
        secure: process.env.NODE_ENV === 'production',
      },
    },
    callbackUrl: {
      name: `next-auth.callback-url`,
      options: {
        sameSite: 'lax',
        path: '/',
        secure: process.env.NODE_ENV === 'production',
      },
    },
    csrfToken: {
      name: `next-auth.csrf-token`,
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
      console.log('JWT callback called:', { token: !!token, user: !!user, account: !!account });
      
      if (user) {
        token.id = user.id;
        
        // If this is a Google sign-in, ensure we have the correct user ID
        if (account?.provider === 'google') {
          try {
            const db = getDatabase();
            const dbUser = db.getUserByGoogleId(user.id);
            if (dbUser) {
              token.id = dbUser.id;
              console.log('JWT callback - Updated token ID:', {
                originalId: user.id,
                actualId: dbUser.id
              });
            }
          } catch (error) {
            console.error('JWT callback error:', error);
            // In production, if database fails, use the Google ID as fallback
            if (process.env.NODE_ENV === 'production') {
              token.id = user.id;
            }
          }
        }
      }
      return token;
    },
    async session({ session, token }: any) {
      console.log('Session callback called:', { hasSession: !!session, hasToken: !!token });
      
      if (token && session.user) {
        session.user.id = token.id as string;
        
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
            }
          } catch (error) {
            console.error('Session callback error:', error);
            // In production, if database fails, keep the Google ID
            if (process.env.NODE_ENV === 'production') {
              session.user.id = token.id as string;
            }
          }
        }
      }
      return session;
    },
    async signIn({ user, account, profile }: any) {
      console.log('SignIn callback called:', { 
        hasUser: !!user, 
        hasAccount: !!account, 
        provider: account?.provider 
      });
      
      if (account?.provider === 'google') {
        try {
          const db = getDatabase();
          
          // Check if user already exists
          const existingUser = db.getUserByGoogleId(profile?.sub);
          
          if (!existingUser) {
            const userId = db.createUser({
              email: user.email!,
              name: user.name || undefined,
              googleId: profile?.sub,
              avatarUrl: user.image || undefined,
            });
            user.id = userId;
          } else {
            user.id = existingUser.id;
          }
          console.log('SignIn callback - Google user:', {
            originalId: user.id,
            googleId: profile?.sub,
            existingUser: existingUser?.id,
            finalId: user.id
          });
          return true;
        } catch (error) {
          console.error('SignIn callback error:', error);
          // In production, if database fails, still allow sign-in
          if (process.env.NODE_ENV === 'production') {
            user.id = profile?.sub || user.id;
            return true;
          }
          return false;
        }
      }
      return true;
    },
  },
  debug: process.env.NODE_ENV === 'development',
}; 