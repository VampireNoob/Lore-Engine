import { useLocalStorage } from './useLocalStorage'

const initialState = {
    screen: 'settingSelect',
    setting: null,
    playerCount: 1,
    players: [],          // [{ character, hp, maxHp, shield, currency, inventory, xp, level }]
    activePlayerIndex: 0, // wer ist gerade am Zug (Story-Wahl / Kampf)
    creatingIndex: 0,     // während charCreate: welcher Spieler wird gerade erstellt
    location: '',
    history: [],
    turn: 0,
}

export function useGameState() {
    const [gameState, setGameState, resetGameState] = useLocalStorage('lore-engine-save', initialState)

    const safeState = (gameState && typeof gameState === 'object') ? gameState : initialState

    const updateState = (updates) => {
        setGameState({ ...safeState, ...updates })
    }

    const goToScreen = (screen) => updateState({ screen })

    return {
        gameState: safeState,
        updateState,
        resetGameState,
        goToScreen,
    }
}