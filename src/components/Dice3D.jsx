import { useState, useEffect } from 'react'

const diceDots = {
    1: [[50, 50]],
    2: [[25, 25], [75, 75]],
    3: [[25, 25], [50, 50], [75, 75]],
    4: [[25, 25], [75, 25], [25, 75], [75, 75]],
    5: [[25, 25], [75, 25], [50, 50], [25, 75], [75, 75]],
    6: [[25, 25], [75, 25], [25, 50], [75, 50], [25, 75], [75, 75]],
    }

    function DiceFace({ value, color, bg }) {
    const dots = diceDots[value] || []
    return (
        <svg width="80" height="80" viewBox="0 0 100 100">
        <rect width="100" height="100" rx="15" fill={bg} stroke={color} strokeWidth="3"/>
        {dots.map((pos, i) => (
            <circle key={i} cx={pos[0]} cy={pos[1]} r="8" fill={color}/>
        ))}
        </svg>
    )
    }

    export function Dice3D({ rolling, result, diceType, color, bg }) {
    const [displayValue, setDisplayValue] = useState(result || 1)
    const [spinning, setSpinning] = useState(false)

    useEffect(() => {
        if (rolling) {
        setSpinning(true)
        let ticks = 0
        const interval = setInterval(() => {
            setDisplayValue(Math.floor(Math.random() * (diceType || 6)) + 1)
            ticks++
            if (ticks >= 15) {
            clearInterval(interval)
            setDisplayValue(result)
            setSpinning(false)
            }
        }, 60)
        return () => clearInterval(interval)
        } else {
        setDisplayValue(result || 1)
        }
    }, [rolling, result])

    return (
        <div className="flex flex-col items-center gap-2">
        <div style={{
            transform: spinning ? 'rotateY(360deg)' : 'rotateY(0deg)',
            transition: spinning ? 'transform 0.6s ease-in-out' : 'none',
            filter: spinning ? `drop-shadow(0 0 12px ${color})` : `drop-shadow(0 0 4px ${color}44)`,
        }}>
            {diceType === 6 ? (
            <DiceFace value={displayValue} color={color} bg={bg} />
            ) : (
            <svg width="80" height="80" viewBox="0 0 100 100">
                <polygon points="50,5 95,35 85,85 15,85 5,35"
                    fill={bg} stroke={color} strokeWidth="3"/>
                <text x="50" y="62" textAnchor="middle" fontSize="28"
                    fontWeight="900" fontFamily="monospace" fill={color}>
                    {displayValue}
                </text>
            </svg>
            )}
        </div>
        <div className="text-xs tracking-widest" style={{ color: '#555' }}>
            {spinning ? 'WÜRFELT...' : `D${diceType || 6} — ${displayValue}`}
        </div>
        </div>
    )
}