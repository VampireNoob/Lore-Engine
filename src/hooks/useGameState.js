import { useLocalStorage } from './useLocalStorage'

const initialState = {
    screen: 'settingSelect',
    setting: null,
    playerCount: 1,
    players: [],
    activePlayerIndex: 0,
    creatingIndex: 0,
    location: '',
    history: [],
    turn: 0,
    stats: {
        combatsWon: 0,
        totalXpEarned: 0,
        totalCapsEarned: 0,
    },
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