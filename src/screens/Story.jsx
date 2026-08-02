import { useState, useEffect } from 'react'
import { getSettingById } from '../settings'

export function Story({ gameState, onUpdateState, onBack }) {
    const setting = getSettingById(gameState.setting)
    const [storyText, setStoryText] = useState('')
    const [choices, setChoices] = useState([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(false)

    const { character } = gameState

    useEffect(() => {
        loadStory()
    }, [])

    const buildMessages = (playerChoice) => {
        const messages = [...(gameState.history || [])]
        if (playerChoice) messages.push({ role: 'user', content: playerChoice })
        else messages.push({ role: 'user', content: 'Starte das Abenteuer!' })
        return messages
    }

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

    Antworte NUR mit validem JSON (kein Markdown, kein Text davor/dahinter):
    {
    "scene": "Atmosphärische Szenen-Beschreibung (2-3 Sätze)",
    "location": "Ortsname (max 20 Zeichen)",
    "choices": [
        {"id": 1, "text": "Aktion (max 60 Zeichen)"},
        {"id": 2, "text": "Aktion (max 60 Zeichen)"},
        {"id": 3, "text": "Aktion (max 60 Zeichen)"}
    ]
    }`

        try {
        const resp = await fetch('https://api.anthropic.com/v1/messages', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
            model: 'claude-sonnet-4-20250514',
            max_tokens: 1000,
            system: systemPrompt,
            messages: buildMessages(playerChoice),
            }),
        })

        const data = await resp.json()
        const raw = data.content.map(b => b.type === 'text' ? b.text : '').join('')
        const clean = raw.replace(/```json|```/g, '').trim()
        const parsed = JSON.parse(clean)

        const newHistory = [
            ...(gameState.history || []),
            { role: 'user', content: playerChoice || 'Starte das Abenteuer!' },
            { role: 'assistant', content: raw },
        ].slice(-10)

        onUpdateState({
            location: parsed.location || gameState.location,
            history: newHistory,
        })

        setStoryText(parsed.scene)
        setChoices(parsed.choices)
        } catch (e) {
        setError(true)
        } finally {
        setLoading(false)
        }
    }

    const makeChoice = (choice) => {
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
                        <span className="text-xs font-normal ml-3 tracking-widest"
                            style={{ color: '#555' }}>
                            {character.class.label}
                        </span>
                        </div>
                    </div>
                    <button onClick={onBack}
                        className="text-xs tracking-widest"
                        style={{ color: '#444' }}>
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
                        style={{ background: setting.colors.surface, borderColor: setting.colors.border, color: '#aaa' }}
                        onMouseEnter={e => {
                        e.currentTarget.style.borderColor = setting.colors.primary
                        e.currentTarget.style.color = 'white'
                        }}
                        onMouseLeave={e => {
                        e.currentTarget.style.borderColor = setting.colors.border
                        e.currentTarget.style.color = '#aaa'
                        }}>
                        <span className="text-xs font-mono" style={{ color: setting.colors.primary }}>[{choice.id}]</span>
                        {choice.text}
                    </button>
                    ))}
                </div>
                )}

            </div>
        </div>
    )
}