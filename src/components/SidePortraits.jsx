import { ClassPortrait } from './ClassPortrait'

// Breite der mittleren Textspalte in px (max-w-2xl = 672 px plus etwas Luft)
const CONTENT_WIDTH_PX = 700
const MAX_PORTRAIT_WIDTH_PX = 400
// Anteil, um den sich zwei Figuren auf derselben Seite überlappen
const OVERLAP = 0.4
// Rechte Figuren spiegeln, damit sie zur Mitte schauen (zum Ausprobieren auf false stellen)
const MIRROR_RIGHT_SIDE = true

// Breite einer Figur: füllt den freien Platz neben der Textspalte, aber höchstens MAX_PORTRAIT_WIDTH_PX
function getPortraitWidth(countOnSide) {
    const rowFactor = 1 + (countOnSide - 1) * (1 - OVERLAP)
    return `min(${MAX_PORTRAIT_WIDTH_PX}px, calc((100vw - ${CONTENT_WIDTH_PX}px) / 2 / ${rowFactor + 0.1}))`
}

function PortraitSide({ side, entries, activeIndex, glowColor }) {
    if (entries.length === 0) return null

    const width = getPortraitWidth(entries.length)
    const mirrored = side === 'right' && MIRROR_RIGHT_SIDE

    return (
        <div
            className="pointer-events-none fixed bottom-0 hidden items-end xl:flex"
            style={{ [side]: '1vw', zIndex: -5 }}
        >
            {entries.map(({ player, index }, position) => {
                const isActive = index === activeIndex
                const isLast = position === entries.length - 1
                return (
                    <ClassPortrait
                        key={index}
                        classId={player.character.class.id}
                        width={width}
                        glowColor={glowColor}
                        active={isActive}
                        dead={player.isDead}
                        dim={!isActive}
                        style={{
                            position: 'relative',
                            zIndex: isActive ? 2 : 1,
                            marginRight: isLast ? 0 : `calc(${width} * -${OVERLAP})`,
                            transform: `${mirrored ? 'scaleX(-1) ' : ''}scale(${isActive ? 1.04 : 1})`,
                            transformOrigin: 'bottom center',
                        }}
                    />
                )
            })}
        </div>
    )
}

export function SidePortraits({ players, activeIndex, glowColor }) {
    const entries = players.map((player, index) => ({ player, index }))
    const left = entries.filter(({ index }) => index % 2 === 0)
    const right = entries.filter(({ index }) => index % 2 === 1)

    return (
        <>
            <PortraitSide side="left" entries={left} activeIndex={activeIndex} glowColor={glowColor} />
            <PortraitSide side="right" entries={right} activeIndex={activeIndex} glowColor={glowColor} />
        </>
    )
}