import type { NextAuthConfig } from "next-auth"

export const authConfig = {
  // pages: {
  //   signIn: "/auth/login",
  //   newUser: "/auth/register",
  // },
  callbacks: {
    authorized({ auth, request: { nextUrl } }) {
      const isLoggedIn = !!auth?.user
      const isOnDashboard = nextUrl.pathname.startsWith("/dashboard")
      
      if (isOnDashboard) {
        if (isLoggedIn) return true
        return false // Redirect unauthenticated users to login page
      } else if (isLoggedIn) {
        // Redirect logged-in users away from auth pages
        if (nextUrl.pathname.startsWith("/auth")) {
          return Response.redirect(new URL("/dashboard", nextUrl))
        }
      }
      return true
    },
    async session({ session, token }) {
      if (token.sub && session.user) {
        session.user.id = token.sub
      }
      return session
    },
    async jwt({ token }) {
      return token
    }
  },
  providers: [], // Configured in auth.ts
} satisfies NextAuthConfig
