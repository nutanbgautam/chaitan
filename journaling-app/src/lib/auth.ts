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
      }
    })
  ],
  callbacks: {
    async jwt({ token, user, account }: any) {
      if (user) {
        token.id = user.id;
        
        // If this is a Google sign-in, ensure we have the correct user ID
        if (account?.provider === 'google') {
          const db = getDatabase();
          const dbUser = db.getUserByGoogleId(user.id);
          if (dbUser) {
            token.id = dbUser.id;
            console.log('JWT callback - Updated token ID:', {
              originalId: user.id,
              actualId: dbUser.id
            });
          }
        }
      }
      return token;
    },
    async session({ session, token }: any) {
      if (token && session.user) {
        session.user.id = token.id as string;
        
        // If this looks like a Google ID, try to get the actual user ID
        if (token.id && token.id.length > 20) {
          const db = getDatabase();
          const user = db.getUserByGoogleId(token.id as string);
          if (user) {
            session.user.id = user.id;
            console.log('Session callback - Updated user ID from Google ID:', {
              googleId: token.id,
              actualId: user.id
            });
          }
        }
      }
      return session;
    },
    async signIn({ user, account, profile }: any) {
      if (account?.provider === 'google') {
        const db = getDatabase();
        const existingUser = db.getUserByGoogleId(profile?.sub!);
        
        if (!existingUser) {
          // Create new user from Google
          const userId = db.createUser({
            email: user.email!,
            name: user.name || undefined,
            googleId: profile?.sub,
            avatarUrl: user.image || undefined,
          });
          // Update the user object with the correct ID
          user.id = userId;
        } else {
          // Use existing user's ID
          user.id = existingUser.id;
        }
        
        console.log('SignIn callback - Google user:', {
          originalId: user.id,
          googleId: profile?.sub,
          existingUser: existingUser?.id,
          finalId: user.id
        });
      }
      return true;
    }
  },
  pages: {
    signIn: '/login',
  },
  session: {
    strategy: 'jwt' as const,
  },
  secret: config.nextAuth.secret,
  cookies: {
    sessionToken: {
      name: 'next-auth.session-token',
      options: {
        httpOnly: true,
        sameSite: 'lax',
        path: '/',
        secure: process.env.NODE_ENV === 'production',
      },
    },
    callbackUrl: {
      name: 'next-auth.callback-url',
      options: {
        sameSite: 'lax',
        path: '/',
        secure: process.env.NODE_ENV === 'production',
      },
    },
    csrfToken: {
      name: 'next-auth.csrf-token',
      options: {
        httpOnly: true,
        sameSite: 'lax',
        path: '/',
        secure: process.env.NODE_ENV === 'production',
      },
    },
  },
}; 