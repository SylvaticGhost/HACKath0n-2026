import { createFileRoute, Link, useRouter } from '@tanstack/react-router'
import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { PasswordInput } from '@/components/ui/password-input.tsx'
import { twMerge } from 'tailwind-merge'
import { useMutation } from '@tanstack/react-query'
import { ApiError, fetchApi } from '@/shared/api/client'
import { JWT_EXPIRES_IN_HOURS, type UserLoggedDto } from 'shared'
import Cookies from 'js-cookie'
import { Loader2 } from 'lucide-react'
import { ModeToggle } from '@/components/mode-toggle'

export const Route = createFileRoute('/_auth/login')({
  validateSearch: (search: Record<string, unknown>) => ({
    redirect: typeof search.redirect === 'string' ? search.redirect : '/',
  }),
  component: LoginPage,
})

function LoginPage() {
  const router = useRouter()
  const { redirect } = Route.useSearch()

  const [formData, setFormData] = useState({
    username: '',
    password: '',
  })

  const [errors, setErrors] = useState<{
    username?: string
    password?: string
    server?: string
  }>({})

  const mutation = useMutation({
    mutationFn: async ({ username, password }: { username: string; password: string }) => {
      const result = await fetchApi<UserLoggedDto>(
        '/users/login',
        {
          method: 'POST',
          body: JSON.stringify({ username, password }),
        },
        false,
      )

      return result
    },
    onSuccess: async (data) => {
      console.log('login success', data)

      Cookies.set('session', JSON.stringify(data), {
        expires: JWT_EXPIRES_IN_HOURS / 24,
      })

      console.log('cookie after set', Cookies.get('session'))

      await router.navigate({
        to: '/',
      })
    },
    onError: (error: ApiError) => {
      setErrors({ password: error.message })
    },
  })

  const isLoading = mutation.isPending

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (isLoading) return

    const nextErrors = {
      username: formData.username.trim() ? '' : 'Username is required',
      password: formData.password ? '' : 'Password is required',
    }

    setErrors(nextErrors)

    if (!nextErrors.username && !nextErrors.password) {
      mutation.mutate({
        username: formData.username.trim(),
        password: formData.password,
      })
    }
  }

  return (
    <div className="min-h-screen w-full bg-background text-foreground">
      <div className="fixed right-4 top-4 z-10">
        <ModeToggle />
      </div>

      <div className="mx-auto flex min-h-screen w-full max-w-3xl flex-col items-center justify-center gap-10 px-4 py-10">
        <Card className="h-fit w-full max-w-sm -translate-y-6">
          <CardHeader className="space-y-1">
            <CardTitle className="text-center text-2xl">Welcome Back</CardTitle>
            <p className="text-center text-sm text-muted-foreground">Sign in to continue to your account</p>
          </CardHeader>

          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="username">Username</Label>
                <Input
                  id="username"
                  value={formData.username}
                  disabled={isLoading}
                  autoComplete="username"
                  onChange={(e) => {
                    setFormData({ ...formData, username: e.target.value })
                    setErrors({ ...errors, username: '', server: '' })
                  }}
                  placeholder="Enter your username"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <PasswordInput
                  id="password"
                  value={formData.password}
                  disabled={isLoading}
                  autoComplete="current-password"
                  onChange={(e) => {
                    setFormData({ ...formData, password: e.target.value })
                    setErrors({ ...errors, password: '', server: '' })
                  }}
                  placeholder="Enter your password"
                />
              </div>

              <p
                className={twMerge(
                  'min-h-4 text-center text-sm font-medium leading-4 text-destructive',
                  !errors?.password && !errors?.username && !errors?.server && 'invisible',
                )}
              >
                {errors?.server || [errors?.password, errors?.username].filter(Boolean).join(', ') || '\u00A0'}
              </p>

              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Log In
              </Button>

              <p className="text-center text-sm text-muted-foreground">
                Don&apos;t have an account?{' '}
                <Link
                  to="/register"
                  search={{ redirect }}
                  className="font-medium text-foreground underline underline-offset-4 transition-opacity hover:opacity-80"
                >
                  Register
                </Link>
              </p>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
