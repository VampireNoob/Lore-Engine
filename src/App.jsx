import { useGameState } from './hooks/useGameState'
import { SettingSelect } from './components/SettingSelect'
import { CharCreate } from './screens/CharCreate'
import { Story } from './screens/Story'
import { Combat } from './screens/Combat'

function App() {
  const { gameState, updateState } = useGameState()

  const handleSettingSelect = (setting) => {
    updateState({ setting: setting.id, screen: 'charCreate' })
  }

  const handleCharStart = (character) => {
    updateState({
      character,
      screen: 'story',
      history: [],
      location: 'Startpunkt',
      hp: character.attrs.end * 4 + 10,
      maxHp: character.attrs.end * 4 + 10,
    })
  }

  const handleBack = () => {
    updateState({ screen: 'settingSelect', history: [], location: '' })
  }

  const handleVictory = (enemy) => {
    const reward = Math.floor(Math.random() * 30) + 20
    const victoryMessage = `Ich habe ${enemy.name} besiegt und ${reward} Caps erbeutet.`
    updateState({
      screen: 'story',
      currency: (gameState.currency || 0) + reward,
      lastCombatResult: victoryMessage,
    })
  }

  const handleDefeat = (reason) => {
    const message = reason === 'flee' ? 'Ich bin geflohen.' : 'Ich wurde besiegt, lebe aber noch.'
    updateState({
      screen: 'story',
      lastCombatResult: message,
    })
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
      {gameState.screen === 'combat' && (
        <Combat
          gameState={gameState}
          onUpdateState={updateState}
          onVictory={handleVictory}
          onDefeat={handleDefeat}
        />
      )}
    </div>
  )
}

export default App