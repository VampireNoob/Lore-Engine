export const scifi = {
    id: 'scifi',
    label: 'Sci-Fi',
    emoji: '🚀',
    colors: {
        primary: '#00d4ff',
        secondary: '#0066ff',
        bg: '#050510',
        surface: '#0a0a1a',
        border: '#1a1a3a',
        danger: '#e74c3c',
    },
    classes: [
        { id: 'pilot', label: 'Pilot', desc: 'Herr über Raumschiffe. Schnell im Kopf und im Cockpit.' },
        { id: 'hacker', label: 'Hacker', desc: 'Knackt Systeme statt Schädel. Wissen ist Macht.' },
        { id: 'soldier', label: 'Söldner', desc: 'Kampferprobt und gut bezahlt. Fragt nicht viel.' },
        { id: 'scientist', label: 'Wissenschaftler', desc: 'Versteht die Technologie besser als alle anderen.' },
    ],
    systemPrompt: `Du bist Spielleiter eines Sci-Fi RPGs in einer fernen Zukunft mit interstellarer Raumfahrt.
    Setting: Raumstationen, fremde Planeten, KI-Konflikte, Konzernkriege und unbekannte Galaxien.
    Währung: Credits. Ton: futuristisch, spannend, mit philosophischen Untertönen.`,
}