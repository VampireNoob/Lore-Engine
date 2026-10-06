import { useState } from 'react'

const PORTRAIT_EXTENSION = 'webp'
const DEAD_FILTER = 'grayscale(1) brightness(0.6)'
const DIM_FILTER = 'brightness(0.55)'

function getFilter({ dead, active, dim, glowColor }) {
    if (dead) return DEAD_FILTER
    if (active && glowColor) return `drop-shadow(0 0 6px ${glowColor}) drop-shadow(0 0 14px ${glowColor}88)`
    if (dim) return DIM_FILTER
    return 'none'
}

export function ClassPortrait({ classId, width = 64, crop = false, glowColor, active = false, dead = false, dim = false, style }) {
    const [failedId, setFailedId] = useState(null)

    // Fehlt das Bild, wird nichts angezeigt und das Layout bleibt wie vorher
    if (!classId || failedId === classId) return null

    return (
        <img
            src={`/images/classes/${classId}.${PORTRAIT_EXTENSION}`}
            alt=""
            draggable={false}
            onError={() => setFailedId(classId)}
            style={{
                width,
                aspectRatio: crop ? '1 / 1' : '3 / 4',
                flexShrink: 0,
                objectFit: crop ? 'cover' : 'contain',
                objectPosition: crop ? 'top' : 'center',
                filter: getFilter({ dead, active, dim, glowColor }),
                opacity: dead ? 0.6 : 1,
                transition: 'filter 300ms, opacity 300ms, transform 300ms',
                ...style,
            }}
        />
    )
}