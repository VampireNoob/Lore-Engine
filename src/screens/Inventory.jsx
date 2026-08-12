import { getSettingById } from '../settings'
import { getLevel, getXpForNextLevel, XP_PER_LEVEL } from '../hooks/useLevelUp'

export function Inventory({ gameState, onUpdateState, onBack }) {
    const setting = getSettingById(gameState.setting)
    const inventory = gameState.inventory || []
    const currency = gameState.currency || 0

    const removeItem = (index) => {
        const newInventory = inventory.filter((_, i) => i !== index)
        onUpdateState({ inventory: newInventory })
    }

    return (
        <div className="min-h-screen p-8" style={{ background: setting.colors.bg }}>
            <div className="max-w-2xl mx-auto">

                {/* Header */}
                <div className="flex justify-between items-center mb-8">
                    <div>
                        <div className="text-xs tracking-[0.3em] mb-1" style={{ color: setting.colors.primary }}>
                            // INVENTAR
                        </div>
                        <h1 className="text-3xl font-black tracking-widest text-white uppercase">
                            {gameState.character?.name}
                        </h1>
                    </div>
                    <button onClick={onBack} className="text-xs tracking-widest cursor-pointer"
                        style={{ color: setting.colors.primary }}>
                        ← ZURÜCK
                    </button>
                </div>

                {/* Währung */}
                <div className="border p-4 mb-6 flex justify-between items-center"
                    style={{ background: setting.colors.surface, borderColor: setting.colors.border }}>
                    <span className="text-xs tracking-widest" style={{ color: '#666' }}>WÄHRUNG</span>
                    <span className="text-2xl font-black" style={{ color: setting.colors.secondary }}>
                        {currency} {setting.id === 'postApoc' ? 'Caps' : setting.id === 'scifi' ? 'Credits' : setting.id === 'cyberpunk' ? 'Eddies' : 'Gold'}
                    </span>
                </div>

                {/* Level & XP */}
                <div className="border p-4 mb-6"
                    style={{ background: setting.colors.surface, borderColor: setting.colors.border }}>
                    <div className="flex justify-between items-center mb-2">
                        <span className="text-xs tracking-widest" style={{ color: setting.colors.primary }}>
                            // LEVEL {gameState.level || 1}
                        </span>
                        <span className="text-xs tracking-widest" style={{ color: '#666' }}>
                            {gameState.xp || 0} XP
                        </span>
                    </div>
                    <div className="h-1.5 rounded-full" style={{ background: '#1a1a1a' }}>
                        <div className="h-1.5 rounded-full transition-all duration-500"
                            style={{
                                width: `${Math.min(100, ((gameState.xp || 0) / (XP_PER_LEVEL[(gameState.level || 1)] || 100)) * 100)}%`,
                                background: setting.colors.primary
                            }} />
                    </div>
                    <div className="text-xs mt-1" style={{ color: '#444' }}>
                        {getXpForNextLevel(gameState.xp || 0) !== null
                            ? `Noch ${getXpForNextLevel(gameState.xp || 0)} XP bis Level ${(gameState.level || 1) + 1}`
                            : 'MAX LEVEL erreicht! 🏆'}
                    </div>
                </div>

                {/* Attribute */}
                <div className="border p-4 mb-6"
                    style={{ background: setting.colors.surface, borderColor: setting.colors.border }}>
                    <div className="text-xs tracking-widest mb-3" style={{ color: setting.colors.primary }}>
                        // ATTRIBUTE
                    </div>
                    <div className="grid grid-cols-3 gap-3">
                        {Object.entries(gameState.character?.attrs || {}).map(([attr, val]) => (
                            <div key={attr} className="text-center">
                                <div className="text-xs tracking-widest mb-1" style={{ color: '#555' }}>
                                    {attr.toUpperCase()}
                                </div>
                                <div className="text-xl font-black" style={{ color: setting.colors.primary }}>
                                    {val}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Inventar */}
                <div className="border p-4"
                    style={{ background: setting.colors.surface, borderColor: setting.colors.border }}>
                    <div className="text-xs tracking-widest mb-3" style={{ color: setting.colors.primary }}>
                        // GEGENSTÄNDE ({inventory.length})
                    </div>
                    {inventory.length === 0 ? (
                        <div className="text-center py-8 text-xs tracking-widest" style={{ color: '#333' }}>
                            KEINE GEGENSTÄNDE
                        </div>
                    ) : (
                        <div className="flex flex-col gap-2">
                            {inventory.map((item, index) => {
                                const isHealItem = item.name.toLowerCase().includes('essen') ||
                                    item.name.toLowerCase().includes('fleisch') ||
                                    item.name.toLowerCase().includes('brot') ||
                                    item.name.toLowerCase().includes('dose') ||
                                    item.name.toLowerCase().includes('wasser') ||
                                    item.name.toLowerCase().includes('trank') ||
                                    item.name.toLowerCase().includes('med') ||
                                    item.name.toLowerCase().includes('verband')
                                const isShieldItem = item.name.toLowerCase().includes('rüstung') ||
                                    item.name.toLowerCase().includes('schild') ||
                                    item.name.toLowerCase().includes('panzer') ||
                                    item.name.toLowerCase().includes('schutz')

                                const useItem = () => {
                                    if (isHealItem) {
                                        const healAmount = 5
                                        const newHp = Math.min(gameState.maxHp, (gameState.hp || 0) + healAmount)
                                        onUpdateState({ hp: newHp, inventory: inventory.filter((_, i) => i !== index) })
                                    } else if (isShieldItem) {
                                        const newShield = (gameState.shield || 0) + 2
                                        onUpdateState({ shield: newShield, inventory: inventory.filter((_, i) => i !== index) })
                                    } else {
                                        removeItem(index)
                                    }
                                }

                                return (
                                    <div key={index} className="flex justify-between items-center border p-3"
                                        style={{ borderColor: setting.colors.border }}>
                                        <div>
                                            <div className="text-sm font-bold text-white">{item.name}</div>
                                            {item.desc && <div className="text-xs mt-1" style={{ color: '#555' }}>{item.desc}</div>}
                                            {isHealItem && <div className="text-xs mt-1" style={{ color: setting.colors.primary }}>+5 HP</div>}
                                            {isShieldItem && <div className="text-xs mt-1" style={{ color: setting.colors.secondary }}>+2 Schild</div>}
                                        </div>
                                        <div className="flex gap-2 ml-4">
                                            {(isHealItem || isShieldItem) && (
                                                <button onClick={useItem}
                                                    className="text-xs tracking-widest cursor-pointer px-2 py-1 border"
                                                    style={{ color: setting.colors.primary, borderColor: setting.colors.primary }}>
                                                    BENUTZEN
                                                </button>
                                            )}
                                            <button onClick={() => removeItem(index)}
                                                className="text-xs tracking-widest cursor-pointer"
                                                style={{ color: setting.colors.danger }}>
                                                ✕
                                            </button>
                                        </div>
                                    </div>
                                )
                            })}
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}