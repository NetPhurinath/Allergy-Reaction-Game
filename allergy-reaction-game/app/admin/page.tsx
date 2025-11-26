"use client"

import React, { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'

// Note: metadata must not be exported from a client component. If you need
// page metadata, add a server component wrapper or a separate `head` file.

export default function AdminPageClient() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [scores, setScores] = useState<any[]>([])
  const [userName, setUserName] = useState<string | null>(null)

  useEffect(() => {
    try {
      const raw = localStorage.getItem('gameUser')
      if (!raw) {
        router.push('/')
        return
      }

      const user = JSON.parse(raw)
      if (!user || user.role !== 'admin') {
        router.push('/')
        return
      }

      setUserName(user.name || null)

      // fetch scores
      ;(async () => {
        try {
          const res = await fetch('/api/scores')
          if (res.ok) {
            const data = await res.json()
            setScores(data.sort((a: any, b: any) => b.score - a.score))
          }
        } catch (e) {
          // ignore
        } finally {
          setLoading(false)
        }
      })()
    } catch (e) {
      router.push('/')
    }
  }, [router])

  if (loading) return <div className="p-8">Loading admin dashboard...</div>

  return (
    <main className="p-8">
      <h1 className="text-2xl font-bold mb-2">Admin Dashboard</h1>
      <div className="flex items-center justify-between mb-4">
        {userName && <p className="text-sm text-muted-foreground">Welcome, {userName}</p>}
        <div>
          <button
            onClick={() => router.push('/')}
            className="px-3 py-2 rounded-md border bg-background text-sm"
          >
            Home
          </button>
        </div>
      </div>

      <h2 className="text-xl font-semibold mb-2">Scores</h2>
      <div className="space-y-4">
        {scores.length === 0 && <p>No scores yet.</p>}
        {scores.map((s: any) => (
          <div key={s.id} className="p-4 border rounded-md bg-card">
            <div className="flex justify-between">
              <div>
                <div className="font-semibold">{s.name} ({s.email})</div>
                <div className="text-sm text-muted-foreground">{new Date(s.date).toLocaleString()}</div>
              </div>
              <div className="text-right">
                <div className="text-xl font-bold">{s.score}</div>
                <div className="text-sm">{s.correctCount}/10 correct</div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </main>
  )
}
