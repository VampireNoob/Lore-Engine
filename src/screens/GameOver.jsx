import { useEffect, useState } from 'react'
import { getSettingById } from '../settings'

function playDoomSound() {
    try {
        const ctx = new (window.AudioContext || window.webkitAudioContext)()
        const now = ctx.currentTime

        // Tiefer, absteigender Ton — dramatischer "Game Over"-Sting
        const osc = ctx.createOscillator()
        const gain = ctx.createGain()
        osc.type = 'sawtooth'
        osc.frequency.setValueAtTime(180, now)
        osc.frequency.exponentialRampToValueAtTime(40, now + 1.8)

        gain.gain.setValueAtTime(0.15, now)
        gain.gain.exponentialRampToValueAtTime(0.001, now + 1.8)

        osc.connect(gain)
        gain.connect(ctx.destination)
        osc.start(now)
        osc.stop(now + 1.8)
    } catch (e) {
        console.error('Audio konnte nicht abgespielt werden:', e)
    }
}

export function GameOver({ gameState, onNewGame }) {
    const setting = getSettingById(gameState.setting)
    const [visible, setVisible] = useState(false)
    const players = gameState.players || []
    const stats = gameState.stats || { combatsWon: 0, totalXpEarned: 0, totalCapsEarned: 0 }

    useEffect(() => {
        playDoomSound()
        const timer = setTimeout(() => setVisible(true), 300)
        return () => clearTimeout(timer)
    }, [])

    return (
        <div className="min-h-screen flex items-center justify-center p-8"
            style={{ background: '#000' }}>
            <div className="max-w-xl w-full text-center">

                <div
                    className="text-6xl font-black tracking-[0.2em] mb-2 transition-all duration-1000"
                    style={{
                        color: setting.colors.danger,
                        opacity: visible ? 1 : 0,
                        transform: visible ? 'scale(1)' : 'scale(1.3)',
                        textShadow: `0 0 30px ${setting.colors.danger}`,
                    }}
                >
                    GAME OVER
                </div>

                <div
                    className="text-xs tracking-[0.3em] uppercase mb-10 transition-opacity duration-1000 delay-500"
                    style={{ color: '#666', opacity: visible ? 1 : 0 }}
                >
                    Die Gruppe ist gefallen
                </div>

                {/* Charakter-Übersicht */}
                <div className="border p-5 mb-4 text-left transition-opacity duration-1000 delay-700"
                    style={{ background: '#0d0d0d', borderColor: '#2a2a2a', opacity: visible ? 1 : 0 }}>
                    <div className="text-xs tracking-widest mb-3" style={{ color: setting.colors.primary }}>
                        // EURE REISE
                    </div>
                    <div className="flex flex-col gap-2">
                        {players.map((p, i) => (
                            <div key={i} className="flex justify-between items-center text-sm">
                                <span className="text-white">{p.character.name}</span>
                                <span style={{ color: '#666' }}>
                                    {p.character.class.label} · Level {p.level || 1}
                                </span>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Statistiken */}
                <div className="border p-5 mb-8 transition-opacity duration-1000 delay-1000"
                    style={{ background: '#0d0d0d', borderColor: '#2a2a2a', opacity: visible ? 1 : 0 }}>
                    <div className="text-xs tracking-widest mb-3" style={{ color: setting.colors.primary }}>
                        // STATISTIKEN
                    </div>
                    <div className="grid grid-cols-3 gap-3">
                        <div>
                            <div className="text-2xl font-black text-white">{stats.combatsWon}</div>
                            <div className="text-xs" style={{ color: '#666' }}>Kämpfe gewonnen</div>
                        </div>
                        <div>
                            <div className="text-2xl font-black text-white">{stats.totalXpEarned}</div>
                            <div className="text-xs" style={{ color: '#666' }}>XP gesamt</div>
                        </div>
                        <div>
                            <div className="text-2xl font-black text-white">{stats.totalCapsEarned}</div>
                            <div className="text-xs" style={{ color: '#666' }}>Beute gesamt</div>
                        </div>
                    </div>
                </div>

                <button onClick={onNewGame}
                    className="w-full py-4 font-black tracking-[0.3em] text-sm uppercase transition-all duration-1000 delay-1000"
                    style={{
                        background: setting.colors.primary,
                        color: '#000',
                        opacity: visible ? 1 : 0,
                    }}>
                    Neues Spiel starten
                </button>
            </div>
        </div>
    )
}