import { betterAuth } from "better-auth";
import { Pool } from "pg";
import dotenv from 'dotenv'
dotenv.config()

export const auth = betterAuth({
   database: new Pool({
        connectionString:process.env.DATABASE_URL
     }),
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
  trustedOrigins:["http://localhost:5173","https://multiplayer-brush-sync.vercel.app"]
});