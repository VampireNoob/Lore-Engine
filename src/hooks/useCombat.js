// Advantage-System: Wirf zwei Würfel, nimm den höheren Wert
export function rollWithAdvantage(sides) {
    const roll1 = Math.floor(Math.random() * sides) + 1
    const roll2 = Math.floor(Math.random() * sides) + 1
    return { result: Math.max(roll1, roll2), rolls: [roll1, roll2] }
}

export function rollNormal(sides) {
    const result = Math.floor(Math.random() * sides) + 1
    return { result, rolls: [result] }
}

// Welche Klasse hat Advantage bei welcher Aktion?
export const classAdvantage = {
    raider: 'attack',       // Ex-Raider → Advantage beim Angriff
    bunker: 'intelligence', // Bunker-Kind → Advantage bei Intelligenz
    medic: 'dodge',         // Sanitäter → Advantage beim Ausweichen
    scav: 'flee',           // Schrottsammler → Advantage beim Fliehen
}

export function hasAdvantage(classId, action) {
    return classAdvantage[classId] === action
}