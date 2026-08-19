import { useState, useEffect, useRef } from 'react'
import { getSettingById } from '../settings'

function safeJsonParse(raw) {
    const clean = raw.replace(/```json|```/g, '').trim()

    // Versuch 1: normales Parsen
    try {
        return JSON.parse(clean)
    } catch (e) { /* weiter zu Versuch 2 */ }

    // Versuch 2: Steuerzeichen (rohe Zeilenumbrüche) bereinigen
    try {
        const repaired = clean.replace(/[\u0000-\u0019]+/g, ' ')
        return JSON.parse(repaired)
    } catch (e) { /* weiter zu Versuch 3 */ }

    // Versuch 3: Felder einzeln per Regex retten, wenn die Gesamtstruktur kaputt ist
    const scene = clean.match(/"scene"\s*:\s*"((?:[^"\\]|\\.)*)"/)
    const location = clean.match(/"location"\s*:\s*"((?:[^"\\]|\\.)*)"/)

    if (scene) {
        return {
            scene: scene[1].replace(/\\"/g, '"'),
            location: location ? location[1] : null,
            choices: [
                { id: 1, text: 'Weiter', type: 'story' },
                { id: 2, text: 'Umsehen', type: 'story' },
            ],
            combat: null,
            items: [],
        }
    }

    // Wenn selbst das scheitert, geben wir es weiter — Story.jsx zeigt dann den Verbindungsfehler-Screen
    throw new Error('JSON konnte nicht repariert werden')
}

function getNextAliveIndex(players, currentIndex) {
    const n = players.length
    for (let i = 1; i <= n; i++) {
        const idx = (currentIndex + i) % n
        if (!players[idx].isDead) return idx
    }
    return currentIndex // Fallback, sollte nie eintreten (App.jsx fängt "alle tot" vorher ab)
}

export function Story({ gameState, onUpdateState, onBack, onOpenInventory, onResetGame }) {
    const setting = getSettingById(gameState.setting)
    const hasRunRef = useRef(false)
    const [storyText, setStoryText] = useState(gameState.storyText || '')
    const [choices, setChoices] = useState(gameState.storyChoices || [])
    const [loading, setLoading] = useState(!gameState.storyText)
    const [error, setError] = useState(false)
    const [lastCombat, setLastCombat] = useState(null)

    const players = gameState.players
    const activeIndex = gameState.activePlayerIndex
    const activePlayer = players[activeIndex]

    useEffect(() => {
        if (hasRunRef.current) return
        hasRunRef.current = true

        const msg = gameState.lastCombatResult
        if (msg) {
            onUpdateState({ lastCombatResult: null })
            loadStory(msg, activeIndex)
            return
        }
        if (storyText) return // Story bereits geladen, kein Reload nötig
        loadStory(null, activeIndex)
    }, [])

    const buildPartyDescription = () => {
        return players.map((p, i) =>
            p.isDead
                ? `- ${p.character.name}: GEFALLEN, nicht mehr Teil der aktiven Handlung`
                : `- ${p.character.name} (${i === activeIndex ? 'AM ZUG' : 'wartet'}): Klasse ${p.character.class.label}, Stärke ${p.character.attrs.str}, Agilität ${p.character.attrs.agi}, Intelligenz ${p.character.attrs.int}, Ausdauer ${p.character.attrs.end}, Glück ${p.character.attrs.lck}, Charisma ${p.character.attrs.cha}`
        ).join('\n')
    }

    const loadStory = async (playerChoice, choosingIndex) => {
        setLoading(true)
        setError(false)
        setChoices([])

        const choosingPlayer = players[choosingIndex]
        const systemPrompt = `${setting.systemPrompt}

Gruppe (${players.length} Spieler):
${buildPartyDescription()}

Aktueller Standort: ${gameState.location || 'Unbekannt'}

Die Gruppe reist gemeinsam. Bei jeder Wahl ist immer nur EIN Mitglied "am Zug" (siehe oben) — beziehe dich in der Szene ruhig auf die ganze Gruppe, aber die Handlung/Entscheidung kommt vom Spieler, der gerade am Zug ist.

Bleib geografisch konsistent — wenn die Story in einer Stadt oder Region beginnt, bleib dort und den umliegenden Gebieten. Springe nicht zwischen verschiedenen Städten hin und her.

Antworte NUR mit validem JSON (kein Markdown, kein Text davor/dahinter).
WICHTIG: Verwende in String-Werten KEINE echten Zeilenumbrüche und escape alle Anführungszeichen innerhalb von Strings korrekt mit \". Halte "scene" möglichst kurz und ohne wörtliche Rede in Anführungszeichen.
Wenn der Spieler einen Gegenstand findet oder bekommt, füge ihn zu "items" hinzu: [{"name": "Gegenstandsname", "desc": "Kurze Beschreibung"}]. Ansonsten items: [].
Wenn eine Wahl zu Kampf führt, setze bei dieser choice type auf "combat" und füge dort direkt "enemy": {"name": "Gegner-Name", "hp": 15} hinzu. Wahlen ohne Kampf brauchen kein "enemy"-Feld.

{
    "scene": "Atmosphärische Szenen-Beschreibung (2-3 Sätze)",
    "location": "Ortsname (max 20 Zeichen)",
    "choices": [
        {"id": 1, "text": "Aktion (max 60 Zeichen)", "type": "story"},
        {"id": 2, "text": "Aktion (max 60 Zeichen)", "type": "story"},
        {"id": 3, "text": "Aktion (max 60 Zeichen)", "type": "combat", "enemy": {"name": "Gegner-Name", "hp": 15}}
    ],
    "items": []
}`

        const history = gameState.history || []
        const userMessage = playerChoice || 'Starte das Abenteuer!'
        const taggedMessage = playerChoice ? `[${choosingPlayer.character.name}]: ${userMessage}` : userMessage

        try {
            const resp = await fetch(
                'https://openrouter.ai/api/v1/chat/completions',
                {
                    method: 'POST',
                    headers: {
                        'Authorization': `Bearer ${import.meta.env.VITE_OPENROUTER_API_KEY}`,
                        'Content-Type': 'application/json',
                        'HTTP-Referer': 'http://localhost:5173',
                        'X-Title': 'Lore Engine',
                    },
                    body: JSON.stringify({
                        model: 'openrouter/auto',
                        messages: [
                            { role: 'system', content: systemPrompt },
                            ...history.map(h => ({
                                role: h.role === 'model' ? 'assistant' : h.role,
                                content: h.parts[0].text
                            })),
                            { role: 'user', content: taggedMessage }
                        ],
                    }),
                }
            )

            const data = await resp.json()

            if (data.error) {
                console.error('OpenRouter error:', data.error)
                setError(true)
                setLoading(false)
                return
            }

            const raw = data.choices?.[0]?.message?.content
            if (!raw) {
                console.error('Leere Antwort von OpenRouter erhalten')
                setError(true)
                setLoading(false)
                return
            }
            const parsed = safeJsonParse(raw)

            const newHistory = [
                ...history,
                { role: 'user', parts: [{ text: taggedMessage }] },
                { role: 'model', parts: [{ text: raw }] },
            ].slice(-12)

            // Items gehen an den Spieler, der die Wahl getroffen hat
            let updatedPlayers = players
            if (parsed.items && parsed.items.length > 0) {
                updatedPlayers = [...players]
                updatedPlayers[choosingIndex] = {
                    ...updatedPlayers[choosingIndex],
                    inventory: [...(updatedPlayers[choosingIndex].inventory || []), ...parsed.items],
                }
            }

            // Nächster Spieler ist dran (Rotation), außer beim allerersten Laden
            const nextIndex = playerChoice
                ? getNextAliveIndex(players, choosingIndex)
                : choosingIndex

            onUpdateState({
                location: parsed.location || gameState.location,
                history: newHistory,
                storyText: parsed.scene,
                storyChoices: parsed.choices,
                players: updatedPlayers,
                activePlayerIndex: nextIndex,
                lastCombatResult: null,
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
        if (choice.type === 'combat') {
            const enemy = choice.enemy || lastCombat // Fallback für alte/kaputte Antworten
            if (enemy) {
                onUpdateState({ combatEnemy: enemy, screen: 'combat' })
                return
            }
        }
        loadStory(choice.text, activeIndex)
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
                            {activePlayer.character.name}
                            <span className="text-xs font-normal ml-3 tracking-widest" style={{ color: '#555' }}>
                                {activePlayer.character.class.label}
                            </span>
                            <span className="text-xs font-normal ml-3 tracking-widest" style={{ color: setting.colors.secondary }}>
                                LVL {activePlayer.level || 1}
                            </span>
                        </div>
                        {players.length > 1 && (
                            <div className="text-xs tracking-widest mt-1" style={{ color: setting.colors.secondary }}>
                                🎯 AM ZUG: {activePlayer.character.name} ({activeIndex + 1}/{players.length})
                            </div>
                        )}
                    </div>
                        <div className="flex gap-4">
                            <button onClick={onOpenInventory}
                                className="text-xs tracking-widest cursor-pointer"
                                style={{ color: setting.colors.primary }}>
                                🎒 INVENTAR
                            </button>
                            <button onClick={onResetGame}
                                className="text-xs tracking-widest cursor-pointer"
                                style={{ color: setting.colors.danger }}>
                                🔄 NEUES SPIEL
                            </button>
                            <button onClick={onBack}
                                className="text-xs tracking-widest"
                                style={{ color: '#444' }}>
                                MENÜ
                            </button>
                        </div>
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
                            ⚠ Verbindungsfehler. <button onClick={() => loadStory(null, activeIndex)} className="underline">Erneut versuchen</button>
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