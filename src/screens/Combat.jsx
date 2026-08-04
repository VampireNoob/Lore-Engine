import { useState, useEffect } from 'react'
import { getSettingById } from '../settings'

export function Combat({ gameState, onUpdateState, onVictory, onDefeat }) {
    const setting = getSettingById(gameState.setting)
    const { character, combatEnemy } = gameState

    const [playerHp, setPlayerHp] = useState(gameState.hp)
    const [enemyHp, setEnemyHp] = useState(combatEnemy?.hp || 20)
    const [enemyMaxHp] = useState(combatEnemy?.hp || 20)
    const [playerMaxHp] = useState(gameState.maxHp || 20)
    const [log, setLog] = useState([])
    const [rolling, setRolling] = useState(false)
    const [diceResult, setDiceResult] = useState(null)
    const [diceType, setDiceType] = useState(null)
    const [phase, setPhase] = useState('player') // player | enemy | end
    const [dodging, setDodging] = useState(false)

    const rollDie = (sides) => Math.floor(Math.random() * sides) + 1

    const addLog = (text, type = 'normal') => {
        setLog(prev => [{ text, type }, ...prev].slice(0, 8))
    }

    const animateDie = (sides, callback) => {
        setRolling(true)
        setDiceType(sides)
        let ticks = 0
        const interval = setInterval(() => {
        setDiceResult(Math.floor(Math.random() * sides) + 1)
        ticks++
        if (ticks >= 10) {
            clearInterval(interval)
            const final = rollDie(sides)
            setDiceResult(final)
            setRolling(false)
            callback(final)
        }
        }, 80)
    }

    const handleAttack = () => {
        if (phase !== 'player' || rolling) return
        setPhase('animating')

        animateDie(20, (atkRoll) => {
        setTimeout(() => {
            animateDie(6, (dmgRoll) => {
            const strBonus = Math.floor(gameState.character.attrs.str / 2)
            const isCrit = atkRoll >= 19
            const isHit = atkRoll >= 6
            let dmg = 0

            if (isCrit) {
                dmg = (dmgRoll + strBonus) * 2
                addLog(`💥 KRITISCH! Du triffst für ${dmg} Schaden!`, 'crit')
            } else if (isHit) {
                dmg = dmgRoll + strBonus
                addLog(`⚔️ Treffer! Du triffst für ${dmg} Schaden.`, 'hit')
            } else {
                addLog(`💨 Verfehlt! Der Angriff geht daneben.`, 'miss')
            }

            const newEnemyHp = Math.max(0, enemyHp - dmg)
            setEnemyHp(newEnemyHp)

            if (newEnemyHp <= 0) {
                addLog(`🏆 ${combatEnemy.name} wurde besiegt!`, 'victory')
                setPhase('end')
                setTimeout(() => onVictory(combatEnemy), 1500)
                return
            }

            setTimeout(() => enemyTurn(newEnemyHp), 800)
            })
        }, 400)
        })
    }

    const handleDodge = () => {
        if (phase !== 'player' || rolling) return
        setDodging(true)
        addLog('🛡️ Du bereitest eine Ausweichbewegung vor...', 'info')
        setPhase('animating')
        setTimeout(() => enemyTurn(enemyHp, true), 600)
    }

    const handleFlee = () => {
        if (phase !== 'player' || rolling) return
        setPhase('animating')
        animateDie(6, (roll) => {
        const agiBonus = gameState.character.attrs.agi
        if (roll + agiBonus >= 7) {
            addLog('🏃 Entkommen! Du flüchtest ins Dunkel.', 'info')
            setPhase('end')
            setTimeout(() => onDefeat('flee'), 1200)
        } else {
            addLog('❌ Flucht fehlgeschlagen!', 'miss')
            setTimeout(() => enemyTurn(enemyHp), 600)
        }
        })
    }

    const enemyTurn = (currentEnemyHp, isDodging = false) => {
        setPhase('enemy')
        setTimeout(() => {
        animateDie(20, (atkRoll) => {
            setTimeout(() => {
            animateDie(6, (dmgRoll) => {
                const isHit = atkRoll >= 7
                let dmg = 0

                if (isDodging) {
                animateDie(6, (dodgeRoll) => {
                    const agiBonus = gameState.character.attrs.agi
                    if (dodgeRoll + agiBonus >= 6) {
                    addLog('✨ Ausgewichen! Kein Schaden!', 'info')
                    setDodging(false)
                    setPhase('player')
                    return
                    }
                })
                }

                if (isHit && !isDodging) {
                dmg = Math.max(1, dmgRoll - 1)
                const newPlayerHp = Math.max(0, playerHp - dmg)
                setPlayerHp(newPlayerHp)
                addLog(`👹 ${combatEnemy.name} trifft dich für ${dmg} Schaden!`, 'enemy')

                if (newPlayerHp <= 0) {
                    addLog('💀 Du wurdest besiegt...', 'miss')
                    setPhase('end')
                    setTimeout(() => onDefeat('death'), 1500)
                    return
                }
                } else if (!isDodging) {
                addLog(`💨 ${combatEnemy.name} verfehlt!`, 'info')
                }

                setDodging(false)
                setPhase('player')
            })
            }, 400)
        })
        }, 400)
    }

    const pHpPct = Math.round((playerHp / playerMaxHp) * 100)
    const eHpPct = Math.round((enemyHp / enemyMaxHp) * 100)

    return (
        <div className="min-h-screen p-6" style={{ background: setting.colors.bg }}>
        <div className="max-w-xl mx-auto">

            {/* Title */}
            <div className="text-center mb-6">
            <div className="text-xs tracking-[0.3em] mb-1" style={{ color: setting.colors.danger }}>
                // KAMPF
            </div>
            <h2 className="text-2xl font-black tracking-widest text-white uppercase">
                {character.name} vs {combatEnemy?.name}
            </h2>
            </div>

            {/* HP Bars */}
            <div className="grid grid-cols-2 gap-4 mb-6">
            {/* Player */}
            <div className="border p-4" style={{ background: setting.colors.surface, borderColor: setting.colors.border }}>
                <div className="text-xs tracking-widest mb-1" style={{ color: setting.colors.primary }}>
                {character.name.toUpperCase()}
                </div>
                <div className="text-3xl font-black text-white mb-2">{playerHp}<span className="text-sm text-gray-600">/{playerMaxHp}</span></div>
                <div className="h-1.5 rounded-full" style={{ background: '#1a1a1a' }}>
                <div className="h-1.5 rounded-full transition-all duration-500"
                    style={{ width: `${pHpPct}%`, background: pHpPct > 30 ? setting.colors.primary : setting.colors.danger }} />
                </div>
            </div>

            {/* Enemy */}
            <div className="border p-4" style={{ background: setting.colors.surface, borderColor: setting.colors.border }}>
                <div className="text-xs tracking-widest mb-1" style={{ color: setting.colors.danger }}>
                {combatEnemy?.name?.toUpperCase()}
                </div>
                <div className="text-3xl font-black text-white mb-2">{enemyHp}<span className="text-sm text-gray-600">/{enemyMaxHp}</span></div>
                <div className="h-1.5 rounded-full" style={{ background: '#1a1a1a' }}>
                <div className="h-1.5 rounded-full transition-all duration-500"
                    style={{ width: `${eHpPct}%`, background: eHpPct > 30 ? setting.colors.danger : '#ff6b6b' }} />
                </div>
            </div>
            </div>

            {/* Dice Animation */}
            <div className="border p-6 mb-4 text-center min-h-28 flex flex-col items-center justify-center"
            style={{ background: setting.colors.surface, borderColor: setting.colors.border }}>
            {diceResult ? (
                <>
                <div className={`text-7xl font-black transition-all duration-100 ${rolling ? 'scale-110 opacity-60' : 'scale-100 opacity-100'}`}
                    style={{ color: rolling ? '#555' : setting.colors.primary, fontFamily: 'monospace' }}>
                    {diceResult}
                </div>
                <div className="text-xs tracking-widest mt-2" style={{ color: '#555' }}>
                    {rolling ? 'WÜRFELT...' : `D${diceType}`}
                </div>
                </>
            ) : (
                <div className="text-xs tracking-widest" style={{ color: '#333' }}>
                WÄHLE EINE AKTION
                </div>
            )}
            </div>

            {/* Combat Log */}
            <div className="border p-4 mb-4 min-h-24"
            style={{ background: '#0a0a0a', borderColor: setting.colors.border }}>
            {log.map((entry, i) => (
                <div key={i} className="text-xs mb-1 font-mono"
                style={{
                    color: entry.type === 'crit' ? setting.colors.secondary :
                    entry.type === 'hit' ? 'white' :
                    entry.type === 'miss' ? '#444' :
                    entry.type === 'enemy' ? setting.colors.danger :
                    entry.type === 'victory' ? setting.colors.primary :
                    '#666',
                    opacity: 1 - i * 0.1
                }}>
                {entry.text}
                </div>
            ))}
            </div>

            {/* Actions */}
            <div className="grid grid-cols-3 gap-3">
            <button onClick={handleAttack}
                disabled={phase !== 'player'}
                className="py-3 text-sm font-bold tracking-widest uppercase transition-all disabled:opacity-30"
                style={{ background: setting.colors.danger, color: 'white' }}>
                ⚔️ Angriff
            </button>
            <button onClick={handleDodge}
                disabled={phase !== 'player'}
                className="py-3 text-sm font-bold tracking-widest uppercase border transition-all disabled:opacity-30"
                style={{ borderColor: setting.colors.primary, color: setting.colors.primary }}>
                🛡️ Ausweichen
            </button>
            <button onClick={handleFlee}
                disabled={phase !== 'player'}
                className="py-3 text-sm font-bold tracking-widest uppercase border transition-all disabled:opacity-30"
                style={{ borderColor: '#555', color: '#555' }}>
                🏃 Fliehen
            </button>
            </div>

        </div>
        </div>
    )
}