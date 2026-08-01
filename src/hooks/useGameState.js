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

    const updateState = (updates) => {
        setGameState(prev => ({ ...prev, ...updates }))
    }

    const startNewGame = (setting, character) => {
        setGameState({
        ...initialState,
        screen: 'charCreate',
        setting: setting.id,
        character,
        currency: 50 + (character?.attrs?.cha ?? 0) * 5,
        location: 'Startpunkt',
        })
    }

    const goToScreen = (screen) => updateState({ screen })

    return {
        gameState,
        updateState,
        startNewGame,
        resetGameState,
        goToScreen,
    }
}