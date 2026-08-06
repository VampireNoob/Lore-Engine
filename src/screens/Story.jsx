import { useState, useEffect } from 'react'
import { getSettingById } from '../settings'

export function Story({ gameState, onUpdateState, onBack }) {
    const setting = getSettingById(gameState.setting)
    const [storyText, setStoryText] = useState('')
    const [choices, setChoices] = useState([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(false)
    const [lastCombat, setLastCombat] = useState(null)

    const { character } = gameState

    useEffect(() => {
    const msg = gameState.lastCombatResult
    if (msg) {
        onUpdateState({ lastCombatResult: null })
        loadStory(msg)
    } else {
        loadStory()
    }
    }, [])

    const loadStory = async (playerChoice) => {
        setLoading(true)
        setError(false)
        setChoices([])

        const systemPrompt = `${setting.systemPrompt}

Spieler-Charakter:
- Name: ${character.name}
- Klasse: ${character.class.label}
- Stärke: ${character.attrs.str}, Agilität: ${character.attrs.agi}, Intelligenz: ${character.attrs.int}
- Ausdauer: ${character.attrs.end}, Glück: ${character.attrs.lck}, Charisma: ${character.attrs.cha}
- Aktueller Standort: ${gameState.location || 'Unbekannt'}

Bleib geografisch konsistent — wenn die Story in einer Stadt oder Region beginnt, bleib dort und den umliegenden Gebieten. Springe nicht zwischen verschiedenen Städten hin und her.

Antworte NUR mit validem JSON (kein Markdown, kein Text davor/dahinter).
Wenn eine Wahl zu Kampf führt, setze type auf "combat" und combat auf {"name": "Gegner-Name", "hp": 15}.
Ansonsten setze combat auf null.

{
    "scene": "Atmosphärische Szenen-Beschreibung (2-3 Sätze)",
    "location": "Ortsname (max 20 Zeichen)",
    "choices": [
        {"id": 1, "text": "Aktion (max 60 Zeichen)", "type": "story"},
        {"id": 2, "text": "Aktion (max 60 Zeichen)", "type": "story"},
        {"id": 3, "text": "Aktion (max 60 Zeichen)", "type": "combat"}
    ],
    "combat": null
}`

        const history = gameState.history || []
        const userMessage = playerChoice || 'Starte das Abenteuer!'
        const contents = [
            ...history,
            { role: 'user', parts: [{ text: userMessage }] }
        ]

        try {
            const resp = await fetch(
                `https://generativelanguage.googleapis.com/v1beta/models/gemini-3.6-flash:generateContent?key=${import.meta.env.VITE_GEMINI_API_KEY}`,
                {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        system_instruction: { parts: [{ text: systemPrompt }] },
                        contents,
                    }),
                }
            )

            const data = await resp.json()

            if (data.error?.code === 429 || data.error?.code === 503) {
                setTimeout(() => loadStory(playerChoice), 10000)
                return
            }

            const raw = data.candidates[0].content.parts[0].text
            const clean = raw.replace(/```json|```/g, '').trim()
            const parsed = JSON.parse(clean)

            const newHistory = [
                ...history,
                { role: 'user', parts: [{ text: userMessage }] },
                { role: 'model', parts: [{ text: raw }] },
            ].slice(-12)

            onUpdateState({
                location: parsed.location || gameState.location,
                history: newHistory,
            })

            setStoryText(parsed.scene)
            setChoices(parsed.choices)
            if (parsed.combat) setLastCombat(parsed.combat)
        } catch (e) {
            console.error('Error:', e)
            setError(true)
        } finally {
            setLoading(false)
        }
    }

    const makeChoice = (choice) => {
        if (choice.type === 'combat' && lastCombat) {
            onUpdateState({
                combatEnemy: lastCombat,
                hp: character.attrs.end * 4 + 10,
                maxHp: character.attrs.end * 4 + 10,
                screen: 'combat'
            })
            return
        }
        loadStory(choice.text)
    }

    return (
        <div className="min-h-screen p-8" style={{ background: setting.colors.bg }}>
            <div className="max-w-2xl mx-auto">

                {/* Header */}
                <div className="flex justify-between items-center mb-6">
                    <div>
                        <div className="text-xs tracking-[0.3em] mb-1" style={{ color: setting.colors.primary }}>
                            {setting.emoji} {(gameState.location || 'Unbekannt').toUpperCase()}
                        </div>
                        <div className="text-lg font-black tracking-widest text-white uppercase">
                            {character.name}
                            <span className="text-xs font-normal ml-3 tracking-widest" style={{ color: '#555' }}>
                                {character.class.label}
                            </span>
                        </div>
                    </div>
                    <button onClick={onBack} className="text-xs tracking-widest" style={{ color: '#444' }}>
                        MENÜ
                    </button>
                </div>

                {/* Story Box */}
                <div className="border p-6 mb-4 min-h-32"
                    style={{ background: setting.colors.surface, borderColor: setting.colors.border, borderLeft: `3px solid ${setting.colors.primary}` }}>
                    {loading ? (
                        <div className="text-sm tracking-widest animate-pulse" style={{ color: '#444' }}>
                            Erzähler denkt nach...
                        </div>
                    ) : error ? (
                        <div className="text-sm" style={{ color: setting.colors.danger }}>
                            ⚠ Verbindungsfehler. <button onClick={() => loadStory()} className="underline">Erneut versuchen</button>
                        </div>
                    ) : (
                        <p className="text-base leading-relaxed" style={{ color: '#bbb' }}>{storyText}</p>
                    )}
                </div>

                {/* Choices */}
                {!loading && !error && (
                    <div className="flex flex-col gap-2">
                        {choices.map(choice => (
                            <button key={choice.id} onClick={() => makeChoice(choice)}
                                className="border p-4 text-left text-sm tracking-wide transition-all duration-200 flex items-center gap-3"
                                style={{ background: setting.colors.surface, borderColor: choice.type === 'combat' ? setting.colors.danger : setting.colors.border, color: '#aaa' }}
                                onMouseEnter={e => {
                                    e.currentTarget.style.borderColor = choice.type === 'combat' ? setting.colors.danger : setting.colors.primary
                                    e.currentTarget.style.color = 'white'
                                }}
                                onMouseLeave={e => {
                                    e.currentTarget.style.borderColor = choice.type === 'combat' ? setting.colors.danger : setting.colors.border
                                    e.currentTarget.style.color = '#aaa'
                                }}>
                                <span className="text-xs font-mono"
                                    style={{ color: choice.type === 'combat' ? setting.colors.danger : setting.colors.primary }}>
                                    [{choice.id}]
                                </span>
                                {choice.text}
                                {choice.type === 'combat' && <span className="ml-auto text-xs" style={{ color: setting.colors.danger }}>⚔</span>}
                            </button>
                        ))}
                    </div>
                )}
            </div>
        </div>
    )
}