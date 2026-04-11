import { createAuthClient } from "better-auth/react"

export const authClient = createAuthClient({
  baseURL: import.meta.env.PROD 
    ? "https://multiplayer-brush-sync.vercel.app/api/auth"  // full URL via Vercel proxy
    : "http://localhost:3000/api/auth",
  fetchOptions: {
    credentials: 'include',
  }
})
