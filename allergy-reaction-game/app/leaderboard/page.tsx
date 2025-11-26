import React from 'react'

export const metadata = {
  title: 'Leaderboard',
}

const mockData = [
  { id: 'm1', name: 'Alice', score: 1250, correctCount: 10, date: new Date().toISOString() },
  { id: 'm2', name: 'Bob', score: 980, correctCount: 8, date: new Date().toISOString() },
  { id: 'm3', name: 'Carol', score: 760, correctCount: 6, date: new Date().toISOString() },
]

export default async function LeaderboardPage() {
  let scores: any[] = []

  try {
    const res = await fetch('http://localhost:3000/api/scores', { cache: 'no-store' })
    if (res.ok) scores = await res.json()
  } catch (e) {
    // ignore — will use mock data
  }

  if (!scores || scores.length === 0) scores = mockData

  // sort descending by score
  scores = scores.sort((a, b) => b.score - a.score).slice(0, 20)

  return (
    <main className="p-8">
      <h1 className="text-2xl font-bold mb-4">Leaderboard</h1>
      <div className="space-y-2 max-w-3xl">
        <div className="grid grid-cols-12 gap-2 font-semibold p-2 bg-muted rounded">
          <div className="col-span-1">#</div>
          <div className="col-span-6">Name</div>
          <div className="col-span-3 text-right">Score</div>
          <div className="col-span-2 text-right">Correct</div>
        </div>
        {scores.map((s, i) => (
          <div key={s.id} className="grid grid-cols-12 gap-2 items-center p-3 border rounded bg-card">
            <div className="col-span-1">{i + 1}</div>
            <div className="col-span-6">{s.name || 'Anonymous'}</div>
            <div className="col-span-3 text-right font-bold">{s.score}</div>
            <div className="col-span-2 text-right">{s.correctCount}/10</div>
          </div>
        ))}
      </div>
    </main>
  )
}
