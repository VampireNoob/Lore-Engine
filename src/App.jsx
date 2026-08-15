import { useGameState } from './hooks/useGameState'
import { SettingSelect } from './components/SettingSelect'
import { PlayerCountSelect } from './screens/PlayerCountSelect'
import { CharCreate } from './screens/CharCreate'
import { Story } from './screens/Story'
import { Combat } from './screens/Combat'
import { Inventory } from './screens/Inventory'
import { calculateXpReward, getLevel, getLevelUpBonus } from './hooks/useLevelUp'

const shieldByClass = {
    bunker: 4, raider: 2, medic: 1, warrior: 3, mage: 1, rogue: 1,
    ranger: 2, soldier: 3, netrunner: 1, streetsamurai: 4, pilot: 1,
}

function App() {
  const { gameState, updateState } = useGameState()

  const handleSettingSelect = (setting) => {
    updateState({ setting: setting.id, screen: 'playerCount' })
  }

  const handlePlayerCountSelect = (count) => {
    updateState({ playerCount: count, players: [], creatingIndex: 0, screen: 'charCreate' })
  }

  const handleCharStart = (character) => {
    const newPlayer = {
      character,
      hp: character.attrs.end * 4 + 10,
      maxHp: character.attrs.end * 4 + 10,
      shield: shieldByClass[character.class.id] || 0,
      currency: 50 + character.attrs.cha * 5,
      inventory: [],
      xp: 0,
      level: 1,
    }

    const updatedPlayers = [...gameState.players, newPlayer]
    const nextIndex = gameState.creatingIndex + 1

    if (nextIndex < gameState.playerCount) {
      // nächster Spieler ist dran mit Erstellen
      updateState({ players: updatedPlayers, creatingIndex: nextIndex })
    } else {
      // alle Spieler erstellt -> Story startet
      updateState({
        players: updatedPlayers,
        activePlayerIndex: 0,
        screen: 'story',
        history: [],
        location: 'Startpunkt',
      })
    }
  }

  const handleBack = () => {
    updateState({ screen: 'settingSelect', history: [], location: '' })
  }

  const handleVictory = (enemy, currentHp, currentShield) => {
    const reward = Math.floor(Math.random() * 30) + 20
    const xpReward = calculateXpReward(enemy)
    const idx = gameState.activePlayerIndex
    const activePlayer = gameState.players[idx]
    const currentXp = activePlayer.xp || 0
    const newXp = currentXp + xpReward
    const oldLevel = getLevel(currentXp)
    const newLevel = getLevel(newXp)
    const leveledUp = newLevel > oldLevel

    const victoryMessage = leveledUp
      ? `${activePlayer.character.name} hat ${enemy.name} besiegt, ${reward} Caps und ${xpReward} XP erbeutet. LEVEL UP! Jetzt Level ${newLevel}!`
      : `${activePlayer.character.name} hat ${enemy.name} besiegt, ${reward} Caps und ${xpReward} XP erbeutet.`

    const bonus = leveledUp ? getLevelUpBonus(newLevel) : null

    const updatedPlayers = [...gameState.players]
    updatedPlayers[idx] = {
      ...activePlayer,
      currency: (activePlayer.currency || 0) + reward,
      hp: leveledUp ? currentHp + bonus.maxHpBonus : currentHp,
      maxHp: leveledUp ? (activePlayer.maxHp || 22) + bonus.maxHpBonus : activePlayer.maxHp,
      shield: currentShield,
      xp: newXp,
      level: newLevel,
    }

    updateState({
      screen: 'story',
      players: updatedPlayers,
      lastCombatResult: victoryMessage,
    })
  }

  const handleDefeat = (reason, currentHp, currentShield) => {
    const idx = gameState.activePlayerIndex
    const activePlayer = gameState.players[idx]
    const message = reason === 'flee'
      ? `${activePlayer.character.name} ist geflohen.`
      : `${activePlayer.character.name} wurde besiegt, lebt aber noch.`

    const updatedPlayers = [...gameState.players]
    updatedPlayers[idx] = {
      ...activePlayer,
      hp: reason === 'death' ? 1 : currentHp,
      shield: currentShield,
    }

    updateState({
      screen: 'story',
      players: updatedPlayers,
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
      {gameState.screen === 'playerCount' && (
        <PlayerCountSelect
          settingId={gameState.setting}
          onSelect={handlePlayerCountSelect}
          onBack={() => updateState({ screen: 'settingSelect' })}
        />
      )}
      {gameState.screen === 'charCreate' && (
        <CharCreate
          settingId={gameState.setting}
          playerNumber={gameState.creatingIndex + 1}
          totalPlayers={gameState.playerCount}
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