import NextAuth, { type NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";

// Build team list from env vars (add TEAM_USER_N_* to .env.local)
function getTeamUsers() {
  const users = [];
  let i = 1;
  while (process.env[`TEAM_USER_${i}_EMAIL`]) {
    users.push({
      id:       String(i),
      email:    process.env[`TEAM_USER_${i}_EMAIL`]!,
      password: process.env[`TEAM_USER_${i}_PASSWORD`]!,
      name:     process.env[`TEAM_USER_${i}_NAME`] ?? `User ${i}`,
      role:     (process.env[`TEAM_USER_${i}_ROLE`] ?? "agent") as "admin" | "agent",
    });
    i++;
  }
  // Fallback for local dev with no env set
  if (users.length === 0) {
    users.push({ id: "1", email: "admin@demo.com", password: "demo1234", name: "Admin", role: "admin" as const });
  }
  return users;
}

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email:    { label: "Email",    type: "email"    },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null;

        const users = getTeamUsers();
        const user  = users.find(
          u => u.email === credentials.email && u.password === credentials.password
        );
        if (!user) return null;

        return { id: user.id, name: user.name, email: user.email, role: user.role };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) token.role = (user as any).role;
      return token;
    },
    async session({ session, token }) {
      if (session.user) (session.user as any).role = token.role;
      return session;
    },
  },
  pages: {
    signIn: "/login",
  },
  session: { strategy: "jwt", maxAge: 8 * 60 * 60 }, // 8 hours
  secret: process.env.NEXTAUTH_SECRET ?? "dev-secret-change-in-prod",
};

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };
