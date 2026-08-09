// XP die man pro Level braucht
export const XP_PER_LEVEL = [0, 100, 250, 450, 700, 1000]

export function getLevel(xp) {
    let level = 1
    for (let i = 1; i < XP_PER_LEVEL.length; i++) {
        if (xp >= XP_PER_LEVEL[i]) level = i + 1
        else break
    }
    return Math.min(level, XP_PER_LEVEL.length)
}

export function getXpForNextLevel(xp) {
    const level = getLevel(xp)
    if (level >= XP_PER_LEVEL.length) return null
    return XP_PER_LEVEL[level] - xp
}

export function getLevelUpBonus(level) {
    return {
        maxHpBonus: level * 2,
        strBonus: level % 2 === 0 ? 1 : 0,
        agiBonus: level % 3 === 0 ? 1 : 0,
    }
}

export function calculateXpReward(enemy) {
    const baseXp = 30
    const hpBonus = Math.floor((enemy?.hp || 15) / 5) * 10
    return baseXp + hpBonus
}