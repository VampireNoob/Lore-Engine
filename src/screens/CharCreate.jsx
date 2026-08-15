import { useState } from 'react'
import { getSettingById } from '../settings'

const initialAttrs = { str: 2, agi: 2, int: 2, end: 2, lck: 2, cha: 2 }
const ATTR_LABELS = { str: 'Stärke', agi: 'Agilität', int: 'Intelligenz', end: 'Ausdauer', lck: 'Glück', cha: 'Charisma' }
const POINTS_TOTAL = 5

export function CharCreate({ settingId, onStart, onBack, playerNumber, totalPlayers }) {
    const setting = getSettingById(settingId)
    const [name, setName] = useState('')
    const [selectedClass, setSelectedClass] = useState(null)
    const [attrs, setAttrs] = useState(initialAttrs)
    const [ptsLeft, setPtsLeft] = useState(POINTS_TOTAL)
    const [error, setError] = useState('')

    const boostAttr = (attr) => {
        if (ptsLeft <= 0) return
        setAttrs(prev => ({ ...prev, [attr]: prev[attr] + 1 }))
        setPtsLeft(prev => prev - 1)
    }

    const resetAttr = (attr) => {
        const diff = attrs[attr] - initialAttrs[attr]
        if (diff <= 0) return
        setAttrs(prev => ({ ...prev, [attr]: prev[attr] - 1 }))
        setPtsLeft(prev => prev + 1)
    }

    const handleStart = () => {
        if (!name.trim()) { setError('Gib deinem Charakter einen Namen!'); return }
        if (!selectedClass) { setError('Wähle eine Klasse!'); return }
        setError('')
        onStart({ name: name.trim(), class: selectedClass, attrs, settingId })
    }

    return (
        <div className="min-h-screen p-8" style={{ background: setting.colors.bg }}>
            <div className="max-w-2xl mx-auto">

                {/* Header */}
                <div className="mb-8">
                <button onClick={onBack} className="text-xs tracking-widest mb-4 block"
                    style={{ color: setting.colors.primary }}>
                    ← ZURÜCK
                </button>
                <div className="text-xs tracking-[0.3em] mb-1" style={{ color: setting.colors.primary }}>
                    {setting.emoji} {setting.label.toUpperCase()}
                </div>
                <h1 className="text-3xl font-black tracking-widest text-white uppercase">
                    Charakter erstellen
                </h1>
                {totalPlayers > 1 && (
                    <div className="text-sm tracking-widest mt-2" style={{ color: setting.colors.secondary }}>
                        👤 SPIELER {playerNumber} VON {totalPlayers} — {playerNumber < totalPlayers ? 'übergib das Gerät!' : 'letzter Charakter!'}
                    </div>
                )}
                </div>

                {/* Name */}
                <div className="mb-6">
                <label className="block text-xs tracking-[0.2em] mb-2" style={{ color: setting.colors.primary }}>
                    // RUFNAME
                </label>
                <input
                    type="text"
                    maxLength={20}
                    value={name}
                    onChange={e => setName(e.target.value)}
                    placeholder="Wie heißt du im Ödland?"
                    className="w-full bg-transparent border px-4 py-3 text-white text-lg tracking-wider outline-none"
                    style={{ borderColor: setting.colors.border }}
                    onFocus={e => e.target.style.borderColor = setting.colors.primary}
                    onBlur={e => e.target.style.borderColor = setting.colors.border}
                />
                </div>

                {/* Klasse */}
                <div className="mb-6">
                <label className="block text-xs tracking-[0.2em] mb-2" style={{ color: setting.colors.primary }}>
                    // KLASSE WÄHLEN
                </label>
                <div className="grid grid-cols-2 gap-3">
                    {setting.classes.map(cls => (
                    <button key={cls.id} onClick={() => setSelectedClass(cls)}
                        className="p-4 border text-left transition-all duration-200"
                        style={{
                        background: selectedClass?.id === cls.id ? `${setting.colors.primary}15` : setting.colors.surface,
                        borderColor: selectedClass?.id === cls.id ? setting.colors.primary : setting.colors.border,
                        }}>
                        <div className="font-bold tracking-widest text-white text-sm uppercase mb-1">
                        {cls.label}
                        </div>
                        <div className="text-xs" style={{ color: '#666' }}>{cls.desc}</div>
                    </button>
                    ))}
                </div>
                </div>

                {/* Attribute */}
                <div className="mb-6">
                <div className="flex justify-between items-center mb-2">
                    <label className="text-xs tracking-[0.2em]" style={{ color: setting.colors.primary }}>
                    // ATTRIBUTE
                    </label>
                    <span className="text-xs tracking-widest" style={{ color: ptsLeft > 0 ? setting.colors.secondary : '#444' }}>
                    {ptsLeft} Punkte übrig
                    </span>
                </div>
                <div className="grid grid-cols-3 gap-2">
                    {Object.entries(attrs).map(([attr, val]) => (
                    <div key={attr} className="border p-3 text-center"
                        style={{ background: setting.colors.surface, borderColor: setting.colors.border }}>
                        <div className="text-xs tracking-widest mb-2" style={{ color: '#666' }}>
                        {ATTR_LABELS[attr]}
                        </div>
                        <div className="text-2xl font-black mb-2"
                        style={{ color: val > initialAttrs[attr] ? setting.colors.primary : 'white' }}>
                        {val}
                        </div>
                        <div className="flex gap-1 justify-center">
                        <button onClick={() => resetAttr(attr)}
                            className="w-6 h-6 text-xs border transition-colors"
                            style={{ borderColor: setting.colors.border, color: '#666' }}>−</button>
                        <button onClick={() => boostAttr(attr)}
                            disabled={ptsLeft <= 0}
                            className="w-6 h-6 text-xs border transition-colors disabled:opacity-30"
                            style={{ borderColor: ptsLeft > 0 ? setting.colors.primary : setting.colors.border, color: ptsLeft > 0 ? setting.colors.primary : '#666' }}>+</button>
                        </div>
                    </div>
                    ))}
                </div>
                </div>

                {/* Error */}
                {error && (
                <div className="mb-4 px-4 py-2 text-sm tracking-wider" style={{ background: '#1a0d0d', color: setting.colors.danger }}>
                    ⚠ {error}
                </div>
                )}

                {/* Start Button */}
                <button onClick={handleStart}
                className="w-full py-4 font-black tracking-[0.3em] text-sm uppercase transition-all duration-200"
                style={{ background: setting.colors.primary, color: '#000' }}
                onMouseEnter={e => e.currentTarget.style.opacity = '0.85'}
                onMouseLeave={e => e.currentTarget.style.opacity = '1'}>
                {totalPlayers > 1 && playerNumber < totalPlayers ? `Weiter zu Spieler ${playerNumber + 1} →` : 'Ins Abenteuer →'}
                </button>

            </div>
        </div>
    )
}