import { settings } from '../settings'

export function SettingSelect({ onSelect }) {
    return (
        <div className="min-h-screen flex flex-col items-center justify-center p-8"
        style={{ background: '#0a0a0a' }}>

        {/* Header */}
        <div className="text-center mb-12">
            <h1 className="text-5xl font-black tracking-[0.3em] text-white mb-3">
            LORE ENGINE
            </h1>
            <p className="text-sm tracking-[0.2em] text-gray-500 uppercase">
            Wähle dein Abenteuer
            </p>
        </div>

        {/* Setting Cards */}
        <div className="grid grid-cols-2 gap-4 w-full max-w-2xl">
            {settings.map((setting) => (
            <button
                key={setting.id}
                onClick={() => onSelect(setting)}
                className="group relative p-6 border text-left transition-all duration-300 hover:scale-105"
                style={{
                background: '#111111',
                borderColor: '#2a2a2a',
                }}
                onMouseEnter={e => {
                e.currentTarget.style.borderColor = setting.colors.primary
                e.currentTarget.style.boxShadow = `0 0 20px ${setting.colors.primary}33`
                }}
                onMouseLeave={e => {
                e.currentTarget.style.borderColor = '#2a2a2a'
                e.currentTarget.style.boxShadow = 'none'
                }}
            >
                <div className="text-4xl mb-3">{setting.emoji}</div>
                <div className="text-lg font-bold tracking-widest text-white uppercase mb-1">
                {setting.label}
                </div>
                <div className="text-xs text-gray-500 tracking-wider">
                {setting.classes.map(c => c.label).join(' · ')}
                </div>
                <div
                className="absolute bottom-0 left-0 h-0.5 w-0 group-hover:w-full transition-all duration-300"
                style={{ background: setting.colors.primary }}
                />
            </button>
            ))}
        </div>
        </div>
    )
}