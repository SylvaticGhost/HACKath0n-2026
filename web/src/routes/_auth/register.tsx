import { createFileRoute, useRouter } from '@tanstack/react-router'
import { useMemo, useState } from 'react'
import { Loader2, User as UserIcon } from 'lucide-react'
import { twMerge } from 'tailwind-merge'
import { useMutation } from '@tanstack/react-query'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { PasswordInput } from '@/components/ui/password-input.tsx'
import { ModeToggle } from '@/components/mode-toggle'
import { ApiError, fetchApi } from '@/shared/api/client'

import { PASSWORD_RULES, type UserCreatedDto } from 'shared'

export const Route = createFileRoute('/_auth/register')({
  validateSearch: (search: Record<string, unknown>) => ({
    redirect: typeof search.redirect === 'string' ? search.redirect : '/',
  }),
  component: RegisterPage,
})

type RegisterFormData = {
  display_name: string
  manuallyDefinedUsername: string
  email: string
  password: string
  avatar: string
}

type RegisterErrors = Partial<Record<keyof RegisterFormData | 'server', string>>

function isValidEmail(email: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
}

function isValidUrl(url: string) {
  try {
    new URL(url)
    return true
  } catch {
    return false
  }
}

function RegisterPage() {
  const router = useRouter()
  const { redirect } = Route.useSearch()

  const [formData, setFormData] = useState<RegisterFormData>({
    display_name: '',
    manuallyDefinedUsername: '',
    email: '',
    password: '',
    avatar: '',
  })

  const [errors, setErrors] = useState<RegisterErrors>({})

  const mutation = useMutation({
    mutationFn: async (payload: {
      email: string
      display_name?: string
      manuallyDefinedUsername?: string
      avatar?: string
      password: string
    }) => {
      return await fetchApi<UserCreatedDto>(
        '/users/create',
        {
          method: 'POST',
          body: JSON.stringify(payload),
        },
        false,
      )
    },
    onSuccess: async () => {
      await router.navigate({
        to: '/login',
        search: {
          redirect,
        },
      })
    },
    onError: (error: ApiError) => {
      setErrors({
        server: error.message || 'Failed to create account',
      })
    },
  })

  const isLoading = mutation.isPending

  const firstError = useMemo(
    () =>
      errors.server ||
      errors.display_name ||
      errors.manuallyDefinedUsername ||
      errors.email ||
      errors.password ||
      errors.avatar ||
      '',
    [errors],
  )

  const handleChange = (field: keyof RegisterFormData) => (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData((prev) => ({
      ...prev,
      [field]: e.target.value,
    }))

    setErrors((prev) => ({
      ...prev,
      [field]: '',
      server: '',
    }))
  }

  const validate = () => {
    const nextErrors: RegisterErrors = {}

    if (!formData.display_name.trim()) {
      nextErrors.display_name = 'Display name is required'
    }

    if (!formData.email.trim()) {
      nextErrors.email = 'Email is required'
    } else if (!isValidEmail(formData.email.trim())) {
      nextErrors.email = 'Enter a valid email'
    }

    if (formData.manuallyDefinedUsername.trim() && formData.manuallyDefinedUsername.trim().length < 3) {
      nextErrors.manuallyDefinedUsername = 'Username must be at least 3 characters'
    }

    if (formData.avatar.trim() && !isValidUrl(formData.avatar.trim())) {
      nextErrors.avatar = 'Avatar must be a valid URL'
    }

    if (!formData.password) {
      nextErrors.password = 'Password is required'
    } else if (formData.password.length < PASSWORD_RULES.minLength) {
      nextErrors.password = `Password must be at least ${PASSWORD_RULES.minLength} characters`
    } else if (formData.password.length > PASSWORD_RULES.maxLength) {
      nextErrors.password = `Password must be at most ${PASSWORD_RULES.maxLength} characters`
    }

    return nextErrors
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (isLoading) return

    const nextErrors = validate()
    setErrors(nextErrors)

    if (Object.keys(nextErrors).length > 0) return

    mutation.mutate({
      email: formData.email.trim(),
      display_name: formData.display_name.trim() || undefined,
      manuallyDefinedUsername: formData.manuallyDefinedUsername.trim() || undefined,
      avatar: formData.avatar.trim() || undefined,
      password: formData.password,
    })
  }

  const avatarPreview = formData.avatar.trim() && isValidUrl(formData.avatar.trim()) ? formData.avatar.trim() : ''

  return (
    <div className="min-h-screen w-full bg-background text-foreground">
      <div className="fixed right-4 top-4 z-10">
        <ModeToggle />
      </div>

      <div className="mx-auto flex min-h-screen w-full max-w-3xl flex-col items-center justify-center gap-10 px-4 py-10">
        <Card className="h-fit w-full max-w-md -translate-y-6">
          <CardHeader className="space-y-1">
            <CardTitle className="text-center text-2xl">Create Account</CardTitle>
          </CardHeader>

          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="avatar">Avatar URL</Label>

                <div className="flex items-center gap-4">
                  <div className="flex h-16 w-16 shrink-0 items-center justify-center overflow-hidden rounded-full border bg-muted">
                    {avatarPreview ? (
                      <img src={avatarPreview} alt="Avatar preview" className="h-full w-full object-cover" />
                    ) : (
                      <UserIcon className="h-7 w-7 text-muted-foreground" />
                    )}
                  </div>

                  <div className="min-w-0 flex-1">
                    <Input
                      id="avatar"
                      value={formData.avatar}
                      disabled={isLoading}
                      onChange={handleChange('avatar')}
                      placeholder="https://example.com/avatar.png"
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="display_name">Display Name</Label>
                <Input
                  id="display_name"
                  value={formData.display_name}
                  disabled={isLoading}
                  autoComplete="name"
                  onChange={handleChange('display_name')}
                  placeholder="Enter your display name"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="manuallyDefinedUsername">Username</Label>
                <Input
                  id="manuallyDefinedUsername"
                  value={formData.manuallyDefinedUsername}
                  disabled={isLoading}
                  autoComplete="username"
                  onChange={handleChange('manuallyDefinedUsername')}
                  placeholder="Choose a username"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  disabled={isLoading}
                  autoComplete="email"
                  onChange={handleChange('email')}
                  placeholder="name@example.com"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <PasswordInput
                  id="password"
                  value={formData.password}
                  disabled={isLoading}
                  autoComplete="new-password"
                  onChange={handleChange('password')}
                  placeholder="Create a password"
                />
              </div>

              <p
                className={twMerge(
                  'min-h-4 text-center text-sm font-medium leading-4 text-destructive',
                  !firstError && 'invisible',
                )}
              >
                {firstError || '\u00A0'}
              </p>

              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Register
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
