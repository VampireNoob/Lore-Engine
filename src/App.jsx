import { useGameState } from './hooks/useGameState'
import { SettingSelect } from './components/SettingSelect'
import { CharCreate } from './screens/CharCreate'
import { Story } from './screens/Story'

function App() {
  const { gameState, updateState } = useGameState()

  const handleSettingSelect = (setting) => {
    updateState({ setting: setting.id, screen: 'charCreate' })
  }

  const handleCharStart = (character) => {
    updateState({ character, screen: 'story', history: [], location: 'Startpunkt' })
  }

  const handleBack = () => {
    updateState({ screen: 'settingSelect', history: [], location: '' })
  }

  return (
    <div>
      {gameState.screen === 'settingSelect' && (
        <SettingSelect onSelect={handleSettingSelect} />
      )}
      {gameState.screen === 'charCreate' && (
        <CharCreate
          settingId={gameState.setting}
          onStart={handleCharStart}
          onBack={handleBack}
        />
      )}
      {gameState.screen === 'story' && (
        <Story
          gameState={gameState}
          onUpdateState={updateState}
          onBack={handleBack}
        />
      )}
    </div>
  )
}

export default App