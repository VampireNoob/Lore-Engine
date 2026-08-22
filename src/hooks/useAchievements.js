import { useLocalStorage } from './useLocalStorage'

export const ACHIEVEMENTS = [
    { id: 'first_victory', title: 'Erster Sieg', desc: 'Gewinne deinen ersten Kampf', emoji: '🗡️', condition: (gs) => (gs.stats?.combatsWon || 0) >= 1 },
    { id: 'war_veteran', title: 'Kriegsveteran', desc: 'Gewinne 10 Kämpfe', emoji: '⚔️', condition: (gs) => (gs.stats?.combatsWon || 0) >= 10 },
    { id: 'level_5', title: 'Aufsteiger', desc: 'Erreiche Level 5 mit einem Charakter', emoji: '⭐', condition: (gs) => (gs.players || []).some(p => (p.level || 1) >= 5) },
    { id: 'level_max', title: 'Meister', desc: 'Erreiche das Maximallevel', emoji: '🏆', condition: (gs) => (gs.players || []).some(p => (p.level || 1) >= 6) },
    { id: 'wealthy', title: 'Wohlhabend', desc: 'Verdiene insgesamt 100 Währung', emoji: '💰', condition: (gs) => (gs.stats?.totalCapsEarned || 0) >= 100 },
    { id: 'rich', title: 'Reichtum', desc: 'Verdiene insgesamt 500 Währung', emoji: '💎', condition: (gs) => (gs.stats?.totalCapsEarned || 0) >= 500 },
    { id: 'experienced', title: 'Erfahren', desc: 'Verdiene insgesamt 500 XP', emoji: '🧠', condition: (gs) => (gs.stats?.totalXpEarned || 0) >= 500 },
    { id: 'full_squad', title: 'Volle Besetzung', desc: 'Starte ein Spiel mit 4 Spielern', emoji: '👥', condition: (gs) => (gs.playerCount || 1) >= 4 },
    { id: 'first_loss', title: 'Erster Verlust', desc: 'Ein Charakter fällt zum ersten Mal', emoji: '💀', condition: (gs) => (gs.players || []).some(p => p.isDead) },
    { id: 'game_over', title: 'Am Ende', desc: 'Erreiche ein Game Over', emoji: '☠️', condition: (gs) => gs.screen === 'gameOver' },
]

export function useAchievements() {
    const [unlocked, setUnlocked] = useLocalStorage('lore-engine-achievements', [])

    const checkAchievements = (gameState) => {
        const newlyUnlocked = []
        ACHIEVEMENTS.forEach(a => {
            if (!unlocked.includes(a.id) && a.condition(gameState)) {
                newlyUnlocked.push(a)
            }
        })
        if (newlyUnlocked.length > 0) {
            setUnlocked([...unlocked, ...newlyUnlocked.map(a => a.id)])
        }
        return newlyUnlocked
    }

    return { unlocked, checkAchievements }
}