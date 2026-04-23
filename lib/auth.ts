import NextAuth from "next-auth"
import MicrosoftEntraID from "next-auth/providers/microsoft-entra-id"

export const { handlers, signIn, signOut, auth } = NextAuth({
  providers: [
    MicrosoftEntraID({
      clientId: process.env.AUTH_MICROSOFT_ENTRA_ID_ID,
      clientSecret: process.env.AUTH_MICROSOFT_ENTRA_ID_SECRET,
      tenantId: process.env.AUTH_MICROSOFT_ENTRA_ID_TENANT_ID,
      authorization: {
        params: {
          scope: "openid profile email offline_access Files.ReadWrite",
        },
      },
    }),
  ],
  callbacks: {
    async jwt({ token, account }) {
      if (account) {
        console.log("Auth Callback: Account object received with access token?", !!account.access_token);
        token.accessToken = account.access_token
      }
      return token
    },
    async session({ session, token }) {
      // @ts-expect-error adding accessToken to session type dynamically
      session.accessToken = token.accessToken
      console.log("Auth Callback: Session object created with access token?", !!session.accessToken);
      return session
    }
  }
})
