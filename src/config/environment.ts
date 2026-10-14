/**
 * Environment configuration read from Vite's import.meta.env.
 * Never import process.env here — this is a browser bundle.
 */

export const API_BASE_URL: string =
  import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:8000'

export const APP_NAME: string =
  import.meta.env.VITE_APP_NAME ?? 'One Herd, One Truth'
