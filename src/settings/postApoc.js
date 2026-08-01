export const postApoc = {
    id: 'postApoc',
    label: 'Post-Apokalyptisch',
    emoji: '☢️',
    colors: {
        primary: '#39ff14',
        secondary: '#f5a623',
        bg: '#0a0a0a',
        surface: '#111111',
        border: '#2a2a2a',
        danger: '#e74c3c',
    },
    classes: [
        { id: 'bunker', label: 'Bunker-Kind', desc: 'Aufgewachsen unter der Erde. Clever, aber unerfahren.' },
        { id: 'raider', label: 'Ex-Raider', desc: 'Früher auf der falschen Seite. Kämpfer durch und durch.' },
        { id: 'medic', label: 'Sanitäter', desc: 'Heilt Wunden im Ödland. Weiß wie man tötet und rettet.' },
        { id: 'scav', label: 'Schrottsammler', desc: 'Findet Schätze im Müll. Überlebt durch Köpfchen.' },
    ],
    systemPrompt: `Du bist Spielleiter eines post-apokalyptischen RPGs in den Ruinen Deutschlands nach einem nuklearen Krieg. 
    Setting: verstrahlte Städte, rivalisierende Überlebenden-Fraktionen, dunkler Humor, Ressourcenknappheit.
    Währung: Caps. Ton: düster, cineastisch, gelegentlich schwarzer Humor.`,
}