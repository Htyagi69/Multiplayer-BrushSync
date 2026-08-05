import { betterAuth } from "better-auth";
import { Pool } from "pg";
import dotenv from 'dotenv'
dotenv.config()

export const auth = betterAuth({
   database: new Pool({
        connectionString:process.env.DATABASE_URL
     }),
     secret: process.env.BETTER_AUTH_SECRET,
     baseURL: process.env.BETTER_AUTH_URL,
       emailAndPassword: { 
       enabled: true, 
       autoSignIn:true,
  }, 
  socialProviders: { 
    google: { 
      clientId: process.env.GOOGLE_CLIENT_ID, 
      clientSecret: process.env.GOOGLE_CLIENT_SECRET, 
    }, 
  },
  trustedOrigins:[process.env.CLIENT_URL],
  // // trustedOrigins:["https://multiplayer-brush-sync.vercel.app"],
  //    advanced: {
  //   defaultCookieAttributes: {
  //     sameSite: "none",
  //     secure: true,
  //     partitioned: true,
  //   },
  //   crossSubdomainCookies: {
  //     enabled: false,
  //   },
  //   useSecureCookies: true,
  // },
  //  account: {
  //   // Keep this to fix the state_mismatch across different domains
  //   skipStateCookieCheck: true, 
  // }
});
