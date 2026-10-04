import { useState } from 'react'

const PORTRAIT_EXTENSION = 'webp'
const DEAD_FILTER = 'grayscale(1) brightness(0.45)'

function getFilter({ dead, active, glowColor }) {
    if (dead) return DEAD_FILTER
    if (active && glowColor) return `drop-shadow(0 0 6px ${glowColor}) drop-shadow(0 0 14px ${glowColor}88)`
    return 'none'
}

export function ClassPortrait({ classId, width = 64, crop = false, glowColor, active = false, dead = false }) {
    const [failedId, setFailedId] = useState(null)

    // Fehlt das Bild, wird nichts angezeigt und das Layout bleibt wie vorher
    if (!classId || failedId === classId) return null

    const height = crop ? width : Math.round((width * 4) / 3)

    return (
        <img
            src={`/images/classes/${classId}.${PORTRAIT_EXTENSION}`}
            alt=""
            draggable={false}
            onError={() => setFailedId(classId)}
            style={{
                width,
                height,
                flexShrink: 0,
                objectFit: crop ? 'cover' : 'contain',
                objectPosition: crop ? 'top' : 'center',
                filter: getFilter({ dead, active, glowColor }),
                opacity: dead ? 0.6 : 1,
                transition: 'filter 300ms, opacity 300ms',
            }}
        />
    )
}