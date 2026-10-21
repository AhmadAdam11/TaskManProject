
'use client'

import { useEffect, useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

export default function DashboardPage() {
  const supabase = useMemo(() => createClient(), [])
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let active = true

    async function checkSession() {
      const { data, error } = await supabase.auth.getUser()

      if (!active) return

      if (error || !data.user) {
        router.replace('/login')
        return
      }

      setEmail(data.user.email ?? '')
      setLoading(false)
    }

    checkSession()

    return () => {
      active = false
    }
  }, [supabase, router])

  async function handleLogout() {
    const { error } = await supabase.auth.signOut()

    if (error) {
      alert(error.message)
      return
    }

    router.replace('/login')
    router.refresh()
  }

  if (loading) return <p>Memuat...</p>

  return (
    <main>
      <h1>TaskMan Dashboard</h1>
      <p>Login sebagai: {email}</p>
      <p>Dashboard sementara. Fitur task akan dibuat berikutnya.</p>
      <button onClick={handleLogout}>Logout</button>
    </main>
  )
}
