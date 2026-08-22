import { getSettingById } from '../settings'
import { ACHIEVEMENTS } from '../hooks/useAchievements'

export function Statistics({ gameState, unlockedAchievements, onBack }) {
    const setting = getSettingById(gameState.setting)
    const players = gameState.players || []
    const stats = gameState.stats || { combatsWon: 0, totalXpEarned: 0, totalCapsEarned: 0 }

    const currencyLabel = setting.id === 'postApoc' ? 'Caps'
        : setting.id === 'scifi' ? 'Credits'
        : setting.id === 'cyberpunk' ? 'Eddies'
        : 'Gold'

    return (
        <div className="min-h-screen p-8" style={{ background: setting.colors.bg }}>
            <div className="max-w-2xl mx-auto">

                {/* Header */}
                <div className="flex justify-between items-center mb-8">
                    <div>
                        <div className="text-xs tracking-[0.3em] mb-1" style={{ color: setting.colors.primary }}>
                            // STATISTIKEN
                        </div>
                        <h1 className="text-3xl font-black tracking-widest text-white uppercase">
                            Eure Reise
                        </h1>
                    </div>
                    <button onClick={onBack} className="text-xs tracking-widest cursor-pointer"
                        style={{ color: setting.colors.primary }}>
                        ← ZURÜCK
                    </button>
                </div>

                {/* Zahlen-Übersicht */}
                <div className="border p-5 mb-6"
                    style={{ background: setting.colors.surface, borderColor: setting.colors.border }}>
                    <div className="text-xs tracking-widest mb-4" style={{ color: setting.colors.primary }}>
                        // GESAMTWERTE
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
                            <div className="text-xs" style={{ color: '#666' }}>{currencyLabel} verdient</div>
                        </div>
                    </div>
                </div>

                {/* Gruppe */}
                <div className="border p-5"
                    style={{ background: setting.colors.surface, borderColor: setting.colors.border }}>
                    <div className="text-xs tracking-widest mb-4" style={{ color: setting.colors.primary }}>
                        // GRUPPE
                    </div>
                    <div className="flex flex-col gap-3">
                        {players.map((p, i) => (
                            <div key={i} className="flex justify-between items-center border-b pb-3 last:border-b-0 last:pb-0"
                                style={{ borderColor: setting.colors.border }}>
                                <div>
                                    <div className="text-sm font-bold" style={{ color: p.isDead ? '#555' : 'white' }}>
                                        {p.character.name} {p.isDead && '💀'}
                                    </div>
                                    <div className="text-xs" style={{ color: '#666' }}>
                                        {p.character.class.label}
                                    </div>
                                </div>
                                <div className="text-right">
                                    <div className="text-sm font-bold" style={{ color: setting.colors.secondary }}>
                                        Level {p.level || 1}
                                    </div>
                                    <div className="text-xs" style={{ color: '#666' }}>
                                        {p.xp || 0} XP
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
                {/* Achievements */}
                <div className="border p-5 mt-6"
                    style={{ background: setting.colors.surface, borderColor: setting.colors.border }}>
                    <div className="text-xs tracking-widest mb-4" style={{ color: setting.colors.primary }}>
                        // ACHIEVEMENTS ({unlockedAchievements.length}/{ACHIEVEMENTS.length})
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                        {ACHIEVEMENTS.map(a => {
                            const isUnlocked = unlockedAchievements.includes(a.id)
                            return (
                                <div key={a.id} className="flex items-center gap-2 p-2 border"
                                    style={{
                                        borderColor: isUnlocked ? setting.colors.primary : '#2a2a2a',
                                        opacity: isUnlocked ? 1 : 0.35,
                                    }}>
                                    <div className="text-xl">{isUnlocked ? a.emoji : '🔒'}</div>
                                    <div>
                                        <div className="text-xs font-bold" style={{ color: isUnlocked ? 'white' : '#666' }}>
                                            {a.title}
                                        </div>
                                        <div className="text-xs" style={{ color: '#555' }}>
                                            {a.desc}
                                        </div>
                                    </div>
                                </div>
                            )
                        })}
                    </div>
                </div>
            </div>
        </div>
    )
}