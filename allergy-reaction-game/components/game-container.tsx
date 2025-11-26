"use client"

import { useState, useEffect, useCallback } from "react"
import { useRouter } from 'next/navigation'
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { CheckCircle, AlertCircle, Timer, Trophy, RotateCcw, Sparkles } from "lucide-react"

type Scenario = {
  id: number
  title: string
  description: string
  image: string
  isSafe: boolean
}

const scenarios: Scenario[] = [
  {
    id: 1,
    title: "Clean Room",
    description: "A well-ventilated room with fresh air",
    image: "/clean-modern-minimalist-bedroom-with-open-windows-.jpg",
    isSafe: true,
  },
  {
    id: 2,
    title: "Dusty Bookshelf",
    description: "Old books covered in layers of dust",
    image: "/dusty-old-bookshelf-with-visible-dust-particles-in.jpg",
    isSafe: false,
  },
  {
    id: 3,
    title: "Blooming Garden",
    description: "Colorful flowers releasing pollen",
    image: "/vibrant-garden-with-colorful-blooming-flowers-and-.jpg",
    isSafe: false,
  },
  {
    id: 4,
    title: "Moldy Bathroom",
    description: "Damp walls with visible mold growth",
    image: "/bathroom-corner-with-mold-spots-on-tiles-and-damp-.jpg",
    isSafe: false,
  },
  {
    id: 5,
    title: "Fresh Kitchen",
    description: "Clean, organized cooking space",
    image: "/bright-clean-modern-kitchen-with-organized-counter.jpg",
    isSafe: true,
  },
  {
    id: 6,
    title: "Pet Hair Zone",
    description: "Furniture covered in pet dander",
    image: "/cozy-couch-covered-with-cat-and-dog-fur-and-pet-ha.jpg",
    isSafe: false,
  },
  {
    id: 7,
    title: "Clean Factory",
    description: "A sanitary factory environment with controlled airflow",
    image: "/clean-factory-with-sanitary-standard.jpg",
    isSafe: true,
  },
  {
    id: 8,
    title: "Clean Laboratory",
    description: "A controlled laboratory space with high cleanliness standards",
    image: "/clean-laboratory-room-for-controlled-experiments.jpg",
    isSafe: true,
  },
  {
    id: 9,
    title: "Construction Site",
    description: "Open construction area with high particulate matter",
    image: "/construction-site-with-high-pm-levels.jpg",
    isSafe: false,
  },
  {
    id: 10,
    title: "Sparkling Ocean",
    description: "Open ocean with fresh sea air",
    image: "/the-sparkling-clean-ocean.jpg",
    isSafe: true,
  },
]

export function GameContainer() {
  const [gameState, setGameState] = useState<"start" | "playing" | "result">("start")
  const [currentScenario, setCurrentScenario] = useState<Scenario | null>(null)
  const [score, setScore] = useState(0)
  const [lives, setLives] = useState(3)
  const [correctCount, setCorrectCount] = useState(0)
  const [userName, setUserName] = useState("")
  const [userEmail, setUserEmail] = useState("")
  const [userRole, setUserRole] = useState<'player' | 'admin'>('player')
  const [userId, setUserId] = useState<string | null>(null)
  const [roundsPlayed, setRoundsPlayed] = useState(0)

  const router = useRouter()
  const [feedback, setFeedback] = useState<"correct" | "wrong" | null>(null)
  const [showSneeze, setShowSneeze] = useState(false)
  const [reactionTime, setReactionTime] = useState<number | null>(null)
  const [startTime, setStartTime] = useState<number | null>(null)
  const [usedScenarios, setUsedScenarios] = useState<number[]>([])

  const getRandomScenario = useCallback(() => {
    const availableScenarios = scenarios.filter((s) => !usedScenarios.includes(s.id))

    if (availableScenarios.length === 0) {
      setUsedScenarios([])
      return scenarios[Math.floor(Math.random() * scenarios.length)]
    }

    const scenario = availableScenarios[Math.floor(Math.random() * availableScenarios.length)]
    setUsedScenarios((prev) => [...prev, scenario.id])
    return scenario
  }, [usedScenarios])

  const startGame = () => {
    setGameState("playing")
    setScore(0)
    setLives(3)
    setCorrectCount(0)
    setRoundsPlayed(0)
    setUsedScenarios([])
    setFeedback(null)
    if (!userId) {
      setUserId(`${Date.now()}-${Math.floor(Math.random() * 10000)}`)
    }
    const scenario = getRandomScenario()
    setCurrentScenario(scenario)
    setStartTime(Date.now())
  }

  const handleAnswer = (playerAnswer: boolean) => {
    if (!currentScenario || !startTime || feedback) return

    const timeTaken = Date.now() - startTime
    setReactionTime(timeTaken)

    const isCorrect = playerAnswer === currentScenario.isSafe

    if (isCorrect) {
      setFeedback("correct")
      setCorrectCount((c) => c + 1)
      const timeBonus = Math.max(0, Math.floor((3000 - timeTaken) / 100))
      setScore((prev) => prev + 100 + timeBonus)
    } else {
      setFeedback("wrong")
      setShowSneeze(true)
      setLives((prev) => prev - 1)

      setTimeout(() => setShowSneeze(false), 600)
    }

    setTimeout(() => {
      const newRounds = roundsPlayed + 1
      setRoundsPlayed(newRounds)

      if (newRounds >= 10) {
        setGameState("result")
        // submit score when game ends
        ;(async () => {
          try {
            await fetch('/api/scores', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                userId: userId || 'anonymous',
                name: userName,
                email: userEmail,
                score,
                correctCount,
                rounds: newRounds,
              }),
            })
          } catch (e) {
            // ignore
          }
        })()
      } else {
        setFeedback(null)
        const nextScenario = getRandomScenario()
        setCurrentScenario(nextScenario)
        setStartTime(Date.now())
        setReactionTime(null)
      }
    }, 1500)
  }

  const getTierInfo = (count: number) => {
    if (count >= 9) return { title: "Flawless Mastery", extended: "Spotless Performance" }
    if (count >= 7) return { title: "Solid Performance", extended: "Great Effort" }
    if (count >= 4) return { title: "Decent Attempt", extended: "Fair Attempt" }
    return { title: "Needs Major Improvement", extended: "Significant Improvement Needed" }
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="w-full max-w-4xl">
        {gameState === "start" && (
          <Card className="p-8 md:p-12 text-center space-y-6 bg-card border-2 shadow-xl">
            <div className="float">
              <Sparkles className="w-16 h-16 mx-auto text-primary" />
            </div>
            <h1 className="text-4xl md:text-6xl font-bold text-balance bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent">
              Safe or Sneeze?
            </h1>
            <p className="text-lg md:text-xl text-muted-foreground text-pretty max-w-2xl mx-auto">
              Test your reaction time! Identify allergy-safe environments quickly. Tap{" "}
              <span className="font-bold text-primary">SAFE</span> for clean spaces or{" "}
              <span className="font-bold text-destructive">SNEEZE</span> for allergen zones.
            </p>
            <div className="grid md:grid-cols-3 gap-4 text-sm text-muted-foreground max-w-xl mx-auto">
              <div className="flex flex-col items-center gap-2">
                <Timer className="w-8 h-8 text-secondary" />
                <p className="text-foreground font-medium">Speed Bonus</p>
                <p className="text-xs">Faster answers = more points</p>
              </div>
              <div className="flex flex-col items-center gap-2">
                <AlertCircle className="w-8 h-8 text-destructive" />
                <p className="text-foreground font-medium">Mistake Indicator</p>
                <p className="text-xs">Wrong answers show feedback; game continues</p>
              </div>
              <div className="flex flex-col items-center gap-2">
                <Trophy className="w-8 h-8 text-primary" />
                <p className="text-foreground font-medium">10 Rounds</p>
                <p className="text-xs">Complete all for max score</p>
              </div>
            </div>

            <div className="pt-6 max-w-md mx-auto space-y-4 text-left">
              <label className="block text-sm font-medium text-foreground">Name</label>
              <input
                value={userName}
                onChange={(e) => setUserName(e.target.value)}
                className="w-full rounded-md border px-3 py-2 bg-background"
                placeholder="Your name"
              />

              <label className="block text-sm font-medium text-foreground">Email</label>
              <input
                value={userEmail}
                onChange={(e) => setUserEmail(e.target.value)}
                className="w-full rounded-md border px-3 py-2 bg-background"
                placeholder="you@example.com"
              />

              <label className="block text-sm font-medium text-foreground">Role</label>
              <select
                value={userRole}
                onChange={(e) => setUserRole(e.target.value as 'player' | 'admin')}
                className="w-full rounded-md border px-3 py-2 bg-background"
              >
                <option value="player">Player</option>
                <option value="admin">Admin</option>
              </select>

              <div className="text-center pt-2">
                <Button
                  onClick={() => {
                    // require name/email before starting to collect personal data
                    if (!userName || !userEmail) {
                      alert('Please enter your name and email to start')
                      return
                    }

                    // simple email validation: must include '@' and '.com'
                    const email = userEmail.trim()
                    if (!email.includes('@') || !email.toLowerCase().includes('.com')) {
                      alert('Please enter a valid email address (must include "@" and ".com")')
                      return
                    }

                    if (userRole === 'admin') {
                      // persist user info for admin session and redirect to admin dashboard
                      try {
                        localStorage.setItem('gameUser', JSON.stringify({
                          userId: userId || `${Date.now()}-${Math.floor(Math.random() * 10000)}`,
                          name: userName,
                          email: userEmail,
                          role: userRole,
                        }))
                      } catch (e) {
                        // ignore
                      }

                      // redirect admins to the admin dashboard instead of starting the game
                      router.push('/admin')
                      return
                    }

                    startGame()
                  }}
                  size="lg"
                  className="text-lg px-8 py-6 bg-primary hover:bg-primary/90 text-primary-foreground"
                >
                  Start Game
                </Button>
              </div>
            </div>
          </Card>
        )}

        {gameState === "playing" && currentScenario && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-4">
                <div className="text-sm font-medium text-foreground">
                  Round: <span className="text-primary">{roundsPlayed + 1}/10</span>
                </div>
                <div className="text-sm font-medium text-foreground">
                  Score: <span className="text-secondary">{score}</span>
                </div>
              </div>
              <div className="flex items-center gap-2">
                {Array.from({ length: 3 }).map((_, i) => (
                  <div key={i} className={`w-3 h-3 rounded-full ${i < lives ? "bg-primary" : "bg-muted"}`} />
                ))}
              </div>
            </div>

            <Card
              className={`overflow-hidden border-2 shadow-2xl ${showSneeze ? "sneeze-shake" : ""} ${feedback === "correct" ? "border-primary" : feedback === "wrong" ? "border-destructive" : ""}`}
            >
              <div className="relative aspect-video">
                <img
                  src={currentScenario.image || "/placeholder.svg"}
                  alt={currentScenario.title}
                  className="w-full h-full object-cover"
                />
                {feedback && (
                  <div
                    className={`absolute inset-0 flex items-center justify-center ${feedback === "correct" ? "bg-primary/20" : "bg-destructive/20"} backdrop-blur-sm`}
                  >
                    <div className="text-center space-y-2">
                      {feedback === "correct" ? (
                        <>
                          <CheckCircle className="w-20 h-20 mx-auto text-primary animate-bounce" />
                          <p className="text-2xl font-bold text-primary">Correct!</p>
                          {reactionTime && (
                            <p className="text-lg text-primary-foreground">{(reactionTime / 1000).toFixed(2)}s</p>
                          )}
                        </>
                      ) : (
                        <>
                          <AlertCircle className="w-20 h-20 mx-auto text-destructive animate-pulse" />
                          <p className="text-2xl font-bold text-destructive">Achoo!</p>
                          <p className="text-lg text-destructive-foreground">Wrong answer!</p>
                        </>
                      )}
                    </div>
                  </div>
                )}
              </div>

              <div className="p-6 space-y-4 bg-card">
                <div className="text-center">
                  <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-2">{currentScenario.title}</h2>
                  <p className="text-muted-foreground">{currentScenario.description}</p>
                </div>

                {!feedback && (
                  <div className="grid grid-cols-2 gap-4">
                    <Button
                      onClick={() => handleAnswer(true)}
                      size="lg"
                      className="h-16 text-xl font-bold bg-primary hover:bg-primary/90 text-primary-foreground transition-all hover:scale-105"
                    >
                      <CheckCircle className="w-6 h-6 mr-2" />
                      SAFE
                    </Button>
                    <Button
                      onClick={() => handleAnswer(false)}
                      size="lg"
                      variant="destructive"
                      className="h-16 text-xl font-bold bg-destructive hover:bg-destructive/90 text-destructive-foreground transition-all hover:scale-105"
                    >
                      <AlertCircle className="w-6 h-6 mr-2" />
                      SNEEZE
                    </Button>
                  </div>
                )}
              </div>
            </Card>
          </div>
        )}

        {gameState === "result" && (
          <Card className="p-8 md:p-12 text-center space-y-6 bg-card border-2 shadow-xl">
            <Trophy className="w-20 h-20 mx-auto text-secondary float" />
            <h2 className="text-4xl md:text-5xl font-bold text-foreground">Results</h2>
            <div className="space-y-4">
              {(() => {
                const tier = getTierInfo(correctCount)
                return (
                  <>
                    <div className="text-6xl font-bold text-primary">{correctCount}/10</div>
                    <p className="text-xl text-muted-foreground">Correct Answers</p>

                    <div className="pt-4">
                      <h3 className="text-2xl font-bold text-foreground">{tier.title}</h3>
                      <p className="text-sm text-muted-foreground">{tier.extended}</p>
                    </div>
                  </>
                )
              })()}

              <div className="grid md:grid-cols-2 gap-4 max-w-md mx-auto pt-4">
                <div className="p-4 rounded-lg bg-muted">
                  <p className="text-sm text-muted-foreground">Rounds Completed</p>
                  <p className="text-2xl font-bold text-foreground">{roundsPlayed}/10</p>
                </div>
                <div className="p-4 rounded-lg bg-muted">
                  <p className="text-sm text-muted-foreground">Total Points</p>
                  <p className="text-2xl font-bold text-foreground">{score}</p>
                </div>
              </div>
            </div>

            <div className="flex justify-center gap-4">
              <Button
                onClick={() => {
                  // navigate back to the start screen
                  // also reset internal game state so the start UI is shown
                  setGameState('start')
                  setScore(0)
                  setLives(3)
                  setCorrectCount(0)
                  setRoundsPlayed(0)
                  setUsedScenarios([])
                  setFeedback(null)
                  setCurrentScenario(null)
                  try {
                    router.push('/')
                  } catch (e) {
                    // ignore
                  }
                }}
                size="lg"
                variant="outline"
                className="text-lg px-6 py-3"
              >
                Home
              </Button>

              <Button
                onClick={startGame}
                size="lg"
                className="text-lg px-8 py-6 bg-secondary hover:bg-secondary/90 text-secondary-foreground"
              >
                <RotateCcw className="w-5 h-5 mr-2" />
                Play Again
              </Button>
            </div>
          </Card>
        )}
      </div>
    </div>
  )
}
