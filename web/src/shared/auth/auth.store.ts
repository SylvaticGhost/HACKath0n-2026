import { create } from 'zustand'
import Cookies from 'js-cookie'

type AuthState = {
  unauthorizedAt: number | null
  markUnauthorized: () => void
  clearUnauthorized: () => void
}

export const useAuthStore = create<AuthState>((set) => ({
  unauthorizedAt: null,
  markUnauthorized: () => {
    Cookies.remove('session')
    set({ unauthorizedAt: Date.now() })
  },
  clearUnauthorized: () => set({ unauthorizedAt: null }),
}))
