'use client'

import { useMemo, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

export default function AuthForm({ mode }) {
  const supabase = useMemo(() => createClient(), [])
  const router = useRouter()
  const isRegister = mode === 'register'

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [message, setMessage] = useState('')
  const [messageType, setMessageType] = useState('error') // 'error' | 'success'
  const [loading, setLoading] = useState(false)

  async function handleSubmit(event) {
    event.preventDefault()
    setLoading(true)
    setMessage('')

    try {
      if (isRegister) {
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
        })

        if (error) throw error

        if (data.session) {
          router.push('/dashboard')
          router.refresh()
          return
        }

        setMessageType('success')
        setMessage('Registrasi berhasil. Silakan periksa email kamu.')
      } else {
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        })

        if (error) throw error

        router.push('/dashboard')
        router.refresh()
        return
      }
    } catch (error) {
      setMessageType('error')
      setMessage(error.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="grid min-h-screen bg-white lg:grid-cols-2">
      <section className="flex items-center justify-center px-6 py-10">
        <div className="w-full max-w-xs">
          <div className="flex items-center gap-2">
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-slate-900 text-white">
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="h-4 w-4"
                aria-hidden="true"
              >
                <path d="M5 12l5 5L20 7" />
              </svg>
            </div>
            <span className="text-sm font-semibold tracking-tight text-slate-900">
              TaskMan
            </span>
          </div>

          <h1 className="mt-6 text-xl font-semibold tracking-tight text-slate-900">
            {isRegister ? 'Registrasi' : 'Login'}
          </h1>

          <form onSubmit={handleSubmit} className="mt-5 space-y-3">
            <div className="space-y-1">
              <label
                htmlFor="email"
                className="block text-xs font-medium text-slate-600"
              >
                Email
              </label>
              <input
                id="email"
                type="email"
                autoComplete="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                required
                className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-900 outline-none transition focus:border-slate-900"
              />
            </div>

            <div className="space-y-1">
              <label
                htmlFor="password"
                className="block text-xs font-medium text-slate-600"
              >
                Password
              </label>
              <input
                id="password"
                type="password"
                autoComplete={isRegister ? 'new-password' : 'current-password'}
                minLength={6}
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                required
                className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-900 outline-none transition focus:border-slate-900"
              />
            </div>

            {message && (
              <p
                role="status"
                className={`text-xs ${
                  messageType === 'success'
                    ? 'text-emerald-600'
                    : 'text-red-600'
                }`}
              >
                {message}
              </p>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-lg bg-slate-900 px-3 py-2 text-sm font-medium text-white transition hover:bg-slate-800 disabled:opacity-60"
            >
              {loading ? 'Memproses...' : isRegister ? 'Daftar' : 'Login'}
            </button>
          </form>

          <p className="mt-5 text-xs text-slate-500">
            {isRegister ? 'Sudah punya akun?' : 'Belum punya akun?'}{' '}
            <Link
              href={isRegister ? '/login' : '/register'}
              className="font-medium text-slate-900 underline-offset-4 hover:underline"
            >
              {isRegister ? 'Login' : 'Daftar'}
            </Link>
          </p>
        </div>
      </section>

      <aside className="relative hidden overflow-hidden bg-slate-900 lg:block">
        <div className="relative z-10 flex h-full flex-col justify-end p-12 xl:p-16">
          <blockquote className="max-w-md">
            <p className="text-2xl font-medium leading-snug tracking-tight text-white">
              Atur tugas, fokus pada yang penting, dan selesaikan lebih cepat.
            </p>
            <footer className="mt-4 text-sm text-white/70">
              TaskMan &mdash; task management yang sederhana
            </footer>
          </blockquote>
        </div>
      </aside>
    </main>
  )
}