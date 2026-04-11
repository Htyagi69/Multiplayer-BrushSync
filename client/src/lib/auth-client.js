import { createAuthClient } from "better-auth/react"

export const authClient = createAuthClient({
  baseURL: import.meta.env.PROD 
    ? "/api/auth"                        // production - Vercel proxy
    : "http://localhost:3000/api/auth",  // local dev
  fetchOptions: {
    credentials: 'include',
  }
})
