'use client'

import { useMemo, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import Image from "next/image";

export default function AuthForm({ mode }) {
  const supabase = useMemo(() => createClient(), [])
  const router = useRouter()
  const isRegister = mode === 'register'

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
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

  const inputClass =
    'w-full rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-slate-900'

  return (
    <main className="grid min-h-screen bg-white lg:grid-cols-[1.1fr_1fr]">
      {/* ===== Panel kiri (gelap) ===== */}
      <aside className="relative hidden overflow-hidden bg-[#121212] lg:flex lg:flex-col lg:justify-center lg:px-12">
        <div className="relative z-10 max-w-md">
          <div className="flex items-center gap-2">
            <div
              className="flex h-7 w-7 items-center justify-center rounded-md border border-dashed border-[#e4ff7a]/70 text-[7px] font-medium uppercase text-[#e4ff7a]/70"
              aria-label="Logo placeholder"
            >
              Takman
            </div>
            <span className="text-base font-semibold tracking-tight text-[#e4ff7a]">
              TaskMan
            </span>
          </div>

          <h2 className="mt-5 text-2xl font-semibold leading-snug tracking-tight text-white xl:text-[28px]">
            Designed for Smarter Project{' '}
            <span className="font-serif font-normal italic text-[#e4ff7a]">
              Management
            </span>
          </h2>

          <p className="mt-3 max-w-sm text-sm leading-relaxed text-white/60">
            Track tasks, manage teams, and monitor progress — all in one
            seamless platform.
          </p>

          {/* Indikator slide */}
          <div className="mt-6 flex items-center gap-1.5" aria-hidden="true">
            <span className="h-2 w-8 rounded-full bg-white" />
            <span className="h-2 w-2 rounded-full bg-white/40" />
            <span className="h-2 w-2 rounded-full bg-white/40" />
            <span className="h-2 w-2 rounded-full bg-white/40" />
          </div>
        </div>

      <div className="absolute bottom-8 right-8 h-40 w-40 xl:h-48 xl:w-48">
        <Image
          src="/accent.png"
          alt="Aksen bunga dekoratif"
          fill
          className="object-contain"
          priority
        />
      </div>
      </aside>

      {/* ===== Panel kanan (form) ===== */}
      <section className="flex items-center justify-center px-6 py-10">
        <div className="w-full max-w-sm">
          <h1 className="text-2xl font-semibold tracking-tight text-slate-900">
            {isRegister ? 'Create Account' : 'Welcome Back'}
          </h1>
          <p className="mt-2 text-sm leading-relaxed text-slate-500">
            {isRegister
              ? 'Enter your email and password to create your account'
              : 'Enter your email and password to access your account'}
          </p>

          <form onSubmit={handleSubmit} className="mt-7 space-y-4">
            <div className="space-y-1.5">
              <label
                htmlFor="email"
                className="block text-sm font-semibold text-slate-900"
              >
                Email address
              </label>
              <input
                id="email"
                type="email"
                autoComplete="email"
                placeholder="Enter email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                required
                className={inputClass}
              />
            </div>

            <div className="space-y-1.5">
              <label
                htmlFor="password"
                className="block text-sm font-semibold text-slate-900"
              >
                Password
              </label>
              <div className="relative">
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete={isRegister ? 'new-password' : 'current-password'}
                  placeholder="Enter password"
                  minLength={6}
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  required
                  className={`${inputClass} pr-11`}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  aria-label={
                    showPassword ? 'Sembunyikan password' : 'Tampilkan password'
                  }
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-600 hover:text-slate-900"
                >
                  {showPassword ? (
                    <svg
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className="h-4 w-4"
                      aria-hidden="true"
                    >
                      <path d="M1 12s4-7 11-7 11 7 11 7-4 7-11 7S1 12 1 12z" />
                      <circle cx="12" cy="12" r="3" />
                    </svg>
                  ) : (
                    <svg
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className="h-4 w-4"
                      aria-hidden="true"
                    >
                      <path d="M17.94 17.94A10.94 10.94 0 0 1 12 19c-7 0-11-7-11-7a19.8 19.8 0 0 1 5.06-5.94" />
                      <path d="M9.9 4.24A10.9 10.9 0 0 1 12 4c7 0 11 7 11 7a19.9 19.9 0 0 1-3.17 4.19" />
                      <path d="M14.12 14.12a3 3 0 1 1-4.24-4.24" />
                      <path d="M1 1l22 22" />
                    </svg>
                  )}
                </button>
              </div>
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
              className="w-full rounded-xl bg-[#e4ff7a] px-4 py-2.5 text-sm font-semibold text-slate-900 transition hover:bg-[#d9f566] disabled:opacity-60"
            >
              {loading ? 'Memproses...' : isRegister ? 'Register' : 'Login'}
            </button>
          </form>

          <p className="mt-6 text-center text-xs text-slate-500">
            {isRegister ? 'Already have an account?' : "Don't Have Account?"}{' '}
            <Link
              href={isRegister ? '/login' : '/register'}
              className="font-semibold text-slate-900 underline underline-offset-4"
            >
              {isRegister ? 'Login Now' : 'Register Now'}
            </Link>
          </p>
        </div>
      </section>
    </main>
  )
}