import { NextResponse } from 'next/server'
import fs from 'fs'
import path from 'path'

const DATA_PATH = path.join(process.cwd(), 'data', 'scores.json')

function readScores() {
  try {
    const raw = fs.readFileSync(DATA_PATH, 'utf-8')
    return JSON.parse(raw)
  } catch (e) {
    return []
  }
}

function writeScores(data: any) {
  try {
    fs.writeFileSync(DATA_PATH, JSON.stringify(data, null, 2), 'utf-8')
    return true
  } catch (e) {
    return false
  }
}

export async function GET() {
  const scores = readScores()
  return NextResponse.json(scores)
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const scores = readScores()

    const entry = {
      id: `${Date.now()}-${Math.floor(Math.random() * 100000)}`,
      userId: body.userId || 'unknown',
      name: body.name || '',
      email: body.email || '',
      score: Number(body.score) || 0,
      correctCount: Number(body.correctCount) || 0,
      rounds: Number(body.rounds) || 0,
      date: new Date().toISOString(),
    }

    scores.push(entry)
    const ok = writeScores(scores)
    if (!ok) return NextResponse.json({ error: 'Could not write scores' }, { status: 500 })

    return NextResponse.json(entry, { status: 201 })
  } catch (err) {
    return NextResponse.json({ error: 'Invalid request' }, { status: 400 })
  }
}
