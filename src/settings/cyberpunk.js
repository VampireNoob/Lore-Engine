export const cyberpunk = {
    id: 'cyberpunk',
    label: 'Cyberpunk',
    emoji: '🤖',
    colors: {
        primary: '#ff2d78',
        secondary: '#bf00ff',
        bg: '#060608',
        surface: '#0e0e14',
        border: '#1e1e2e',
        danger: '#e74c3c',
    },
    classes: [
        { id: 'netrunner', label: 'Netrunner', desc: 'Taucht ins Datennetz ein. Gefährlich hinter dem Bildschirm.' },
        { id: 'streetsamurai', label: 'Straßensamurai', desc: 'Cyborg-Krieger. Implantate statt Muskeln.' },
        { id: 'fixer', label: 'Fixer', desc: 'Kennt jeden und jeden Preis. Löst Probleme diskret.' },
        { id: 'techie', label: 'Techniker', desc: 'Baut und modifiziert alles. MacGyver mit Lötkolben.' },
    ],
    systemPrompt: `Du bist Spielleiter eines Cyberpunk-RPGs in einer dystopischen Megastadt der nahen Zukunft.
    Setting: Neonlichter, Megakonzerne, Straßengangs, Cyborg-Implantate und digitale Unterwelt.
    Währung: Eddies. Ton: dunkel, gnadenlos, neon-noir.`,
}