import { useGameState } from './hooks/useGameState'
import { SettingSelect } from './components/SettingSelect'

function App() {
  const { gameState, goToScreen, updateState } = useGameState()

  const handleSettingSelect = (setting) => {
    updateState({ setting: setting.id, screen: 'charCreate' })
  }

  return (
    <div>
      {gameState.screen === 'settingSelect' && (
        <SettingSelect onSelect={handleSettingSelect} />
      )}
      {gameState.screen === 'charCreate' && (
        <div className="min-h-screen bg-gray-950 text-white flex items-center justify-center">
          <div className="text-center">
            <p className="text-gray-500 tracking-widest uppercase text-sm mb-4">Setting gewählt</p>
            <h2 className="text-3xl font-bold text-white mb-6">Charakter-Erstellung</h2>
            <button
              onClick={() => updateState({ screen: 'settingSelect' })}
              className="text-xs tracking-widest text-gray-600 hover:text-gray-400 uppercase"
            >
              ← Zurück
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

export default App