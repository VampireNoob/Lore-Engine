import { useGameState } from './hooks/useGameState'
import { SettingSelect } from './components/SettingSelect'
import { CharCreate } from './screens/CharCreate'
import { Story } from './screens/Story'
import { Combat } from './screens/Combat'
import { Inventory } from './screens/Inventory'
import { calculateXpReward, getLevel, getLevelUpBonus } from './hooks/useLevelUp'

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
      shield: character.class.id === 'bunker' ? 4 :
              character.class.id === 'raider' ? 2 :
              character.class.id === 'medic' ? 1 : 0,
      currency: 50 + character.attrs.cha * 5,
      inventory: [],
      xp: 0,
      level: 1,
    })
  }

  const handleBack = () => {
    updateState({ screen: 'settingSelect', history: [], location: '' })
  }

  const handleVictory = (enemy, currentHp, currentShield) => {
    const reward = Math.floor(Math.random() * 30) + 20
    const xpReward = calculateXpReward(enemy)
    const currentXp = gameState.xp || 0
    const newXp = currentXp + xpReward
    const oldLevel = getLevel(currentXp)
    const newLevel = getLevel(newXp)
    const leveledUp = newLevel > oldLevel

    const victoryMessage = leveledUp
      ? `Ich habe ${enemy.name} besiegt, ${reward} Caps und ${xpReward} XP erbeutet. LEVEL UP! Ich bin jetzt Level ${newLevel}!`
      : `Ich habe ${enemy.name} besiegt, ${reward} Caps und ${xpReward} XP erbeutet.`

    const bonus = leveledUp ? getLevelUpBonus(newLevel) : null

    updateState({
      screen: 'story',
      currency: (gameState.currency || 0) + reward,
      hp: leveledUp ? currentHp + bonus.maxHpBonus : currentHp,
      maxHp: leveledUp ? (gameState.maxHp || 22) + bonus.maxHpBonus : gameState.maxHp,
      shield: currentShield,
      xp: newXp,
      level: newLevel,
      lastCombatResult: victoryMessage,
    })
  }

  const handleDefeat = (reason) => {
    const message = reason === 'flee' ? 'Ich bin geflohen.' : 'Ich wurde besiegt, lebe aber noch.'
    updateState({
      screen: 'story',
      hp: reason === 'death' ? 1 : gameState.hp,
      lastCombatResult: message,
    })
  }

  const handleOpenInventory = () => {
    updateState({ screen: 'inventory' })
  }

  const handleBackFromInventory = () => {
    updateState({ screen: 'story' })
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
          onOpenInventory={handleOpenInventory}
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
      {gameState.screen === 'inventory' && (
        <Inventory
          gameState={gameState}
          onUpdateState={updateState}
          onBack={handleBackFromInventory}
        />
      )}
    </div>
  )
}

export default App