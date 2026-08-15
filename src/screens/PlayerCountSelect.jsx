import { getSettingById } from '../settings'

export function PlayerCountSelect({ settingId, onSelect, onBack }) {
    const setting = getSettingById(settingId)
    const options = [1, 2, 3, 4]

    return (
        <div className="min-h-screen p-8 flex items-center justify-center" style={{ background: setting.colors.bg }}>
            <div className="max-w-md w-full">
                <button onClick={onBack} className="text-xs tracking-widest mb-4 block"
                    style={{ color: setting.colors.primary }}>
                    ← ZURÜCK
                </button>
                <div className="text-xs tracking-[0.3em] mb-1" style={{ color: setting.colors.primary }}>
                    {setting.emoji} {setting.label.toUpperCase()}
                </div>
                <h1 className="text-3xl font-black tracking-widest text-white uppercase mb-8">
                    Wie viele Spieler?
                </h1>
                <div className="grid grid-cols-2 gap-3">
                    {options.map(n => (
                        <button key={n} onClick={() => onSelect(n)}
                            className="p-6 border text-center transition-all duration-200"
                            style={{ background: setting.colors.surface, borderColor: setting.colors.border, color: 'white' }}
                            onMouseEnter={e => e.currentTarget.style.borderColor = setting.colors.primary}
                            onMouseLeave={e => e.currentTarget.style.borderColor = setting.colors.border}>
                            <div className="text-3xl font-black mb-1">{n}</div>
                            <div className="text-xs tracking-widest" style={{ color: '#666' }}>
                                {n === 1 ? 'SPIELER' : 'SPIELER'}
                            </div>
                        </button>
                    ))}
                </div>
            </div>
        </div>
    )
}