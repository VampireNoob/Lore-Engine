import { useLocalStorage } from './useLocalStorage'

const initialState = {
    screen: 'settingSelect',
    setting: null,
    character: null,
    hp: 0,
    maxHp: 0,
    currency: 0,
    location: '',
    inventory: [],
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