export const fantasy = {
    id: 'fantasy',
    label: 'Fantasy',
    emoji: '⚔️',
    colors: {
        primary: '#f0c040',
        secondary: '#a855f7',
        bg: '#0d0a0a',
        surface: '#130f0f',
        border: '#2a2018',
        danger: '#e74c3c',
    },
    classes: [
        { id: 'warrior', label: 'Krieger', desc: 'Stahl und Stärke. Hält aus was andere nicht können.' },
        { id: 'mage', label: 'Magier', desc: 'Meister der Arkanen Künste. Mächtig aber zerbrechlich.' },
        { id: 'rogue', label: 'Schurke', desc: 'Aus dem Schatten heraus. Schnell, leise, tödlich.' },
        { id: 'ranger', label: 'Waldläufer', desc: 'Eins mit der Natur. Bogenschütze und Spurenleser.' },
    ],
    systemPrompt: `Du bist Spielleiter eines klassischen Fantasy-RPGs in einer mittelalterlichen Welt voller Magie und Gefahr.
    Setting: Königreiche, dunkle Wälder, alte Ruinen, Drachen, Magie und politische Intrigen.
    Währung: Goldmünzen. Ton: episch, atmosphärisch, dramatisch.`,
}