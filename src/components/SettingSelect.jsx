import { settings } from '../settings'

export function SettingSelect({ onSelect }) {
    return (
        <div className="min-h-screen flex flex-col items-center justify-center p-8"
        style={{ background: '#0a0a0a' }}>

        {/* Header */}
        <div className="text-center mb-12">
            <div className="mb-4">
                <svg width="70" height="70" viewBox="0 0 100 100" className="mx-auto">
                    {/* Hintergrund */}
                    <rect width="100" height="100" rx="15" fill="#111" stroke="#39ff14" strokeWidth="3"/>
                    {/* D20 Kreis */}
                    <circle cx="50" cy="50" r="35" fill="none" stroke="#39ff14" strokeWidth="1.5" opacity="0.4"/>
                    {/* Schwert - Klinge */}
                    <line x1="50" y1="10" x2="50" y2="75" stroke="#39ff14" strokeWidth="3" strokeLinecap="round"/>
                    {/* Schwert - Spitze */}
                    <polygon points="50,8 45,22 55,22" fill="#39ff14"/>
                    {/* Schwert - Parierstange */}
                    <line x1="35" y1="65" x2="65" y2="65" stroke="#39ff14" strokeWidth="3" strokeLinecap="round"/>
                    {/* Schwert - Griff */}
                    <line x1="50" y1="65" x2="50" y2="82" stroke="#39ff14" strokeWidth="4" strokeLinecap="round"/>
                    {/* Schwert - Knauf */}
                    <circle cx="50" cy="85" r="4" fill="#39ff14"/>
                </svg>
            </div>
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