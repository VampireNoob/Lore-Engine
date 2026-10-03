import { useEffect, useMemo, useRef, useState } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import * as THREE from 'three'

const diceDots = {
    1: [[50, 50]],
    2: [[25, 25], [75, 75]],
    3: [[25, 25], [50, 50], [75, 75]],
    4: [[25, 25], [75, 25], [25, 75], [75, 75]],
    5: [[25, 25], [75, 25], [50, 50], [25, 75], [75, 75]],
    6: [[25, 25], [75, 25], [25, 50], [75, 50], [25, 75], [75, 75]],
}

// Reihenfolge der BoxGeometry-Flächen: +x, -x, +y, -y, +z, -z (gegenüberliegende Seiten ergeben 7)
const D6_FACE_VALUES = [3, 4, 1, 6, 2, 5]

// Drehung (Euler x, y, z), die die jeweilige Zahl zur Kamera (+z) dreht
const D6_FACE_ROTATIONS = {
    1: [Math.PI / 2, 0, 0],
    2: [0, 0, 0],
    3: [0, -Math.PI / 2, 0],
    4: [0, Math.PI / 2, 0],
    5: [0, Math.PI, 0],
    6: [-Math.PI / 2, 0, 0],
}

// Leichte Schräglage im Ruhezustand, damit man die 3D-Form erkennt
const REST_TILT = new THREE.Quaternion().setFromEuler(new THREE.Euler(-0.4, 0.4, 0))

const D6_TARGETS = Object.fromEntries(
    Object.entries(D6_FACE_ROTATIONS).map(([value, [x, y, z]]) => [
        value,
        REST_TILT.clone().multiply(new THREE.Quaternion().setFromEuler(new THREE.Euler(x, y, z))),
    ])
)

const ROLL_SPIN_SPEED = 16
const SETTLE_SPEED = 10

function createFaceTexture(value, color, bg) {
    const size = 256
    const canvas = document.createElement('canvas')
    canvas.width = size
    canvas.height = size
    const ctx = canvas.getContext('2d')

    ctx.fillStyle = bg
    ctx.fillRect(0, 0, size, size)
    ctx.strokeStyle = color
    ctx.lineWidth = 14
    ctx.strokeRect(7, 7, size - 14, size - 14)

    ctx.fillStyle = color
    const scale = size / 100
    diceDots[value].forEach(([x, y]) => {
        ctx.beginPath()
        ctx.arc(x * scale, y * scale, 8 * scale, 0, Math.PI * 2)
        ctx.fill()
    })

    const texture = new THREE.CanvasTexture(canvas)
    texture.colorSpace = THREE.SRGBColorSpace
    return texture
}

function D6Mesh({ rolling, result, color, bg }) {
    const meshRef = useRef(null)
    const rollingRef = useRef(rolling)
    const resultRef = useRef(result)
    const spinAxis = useRef(new THREE.Vector3(1, 1, 0).normalize())
    const rollTime = useRef(0)

    const textures = useMemo(
        () => D6_FACE_VALUES.map(value => createFaceTexture(value, color, bg)),
        [color, bg]
    )

    useEffect(() => {
        return () => textures.forEach(texture => texture.dispose())
    }, [textures])

    useEffect(() => {
        rollingRef.current = rolling
        if (rolling) {
            spinAxis.current.set(Math.random() - 0.5, Math.random() - 0.5, Math.random() - 0.5).normalize()
            rollTime.current = 0
        }
    }, [rolling])

    useEffect(() => {
        resultRef.current = result
    }, [result])

    useFrame((_, delta) => {
        const mesh = meshRef.current
        if (!mesh) return

        if (rollingRef.current) {
            rollTime.current += delta
            mesh.rotateOnWorldAxis(spinAxis.current, delta * ROLL_SPIN_SPEED)
            mesh.position.y = Math.abs(Math.sin(rollTime.current * 9)) * 0.35
        } else {
            const target = D6_TARGETS[resultRef.current] || D6_TARGETS[1]
            const blend = 1 - Math.exp(-delta * SETTLE_SPEED)
            mesh.quaternion.slerp(target, blend)
            mesh.position.y = THREE.MathUtils.lerp(mesh.position.y, 0, blend)
        }
    })

    return (
        <mesh ref={meshRef}>
            <boxGeometry args={[1.6, 1.6, 1.6]} />
            {textures.map((texture, i) => (
                <meshStandardMaterial
                    key={i}
                    attach={`material-${i}`}
                    map={texture}
                    emissiveMap={texture}
                    emissive="#ffffff"
                    emissiveIntensity={0.5}
                    roughness={0.5}
                />
            ))}
        </mesh>
    )
}

function D6Dice({ rolling, result, color, bg }) {
    return (
        <div className="flex flex-col items-center gap-2">
            <Canvas
                camera={{ position: [0, 0, 4.5], fov: 35 }}
                style={{ width: 120, height: 120 }}
            >
                <ambientLight intensity={0.6} />
                <directionalLight position={[3, 4, 5]} intensity={1.5} />
                <D6Mesh rolling={rolling} result={result} color={color} bg={bg} />
            </Canvas>
            <DiceLabel rolling={rolling} diceType={6} value={result} />
        </div>
    )
}

// --- Flache Darstellung (aktuell noch für den D20) ---

function DiceFace({ value, color, bg }) {
    const dots = diceDots[value] || []
    return (
        <svg width="80" height="80" viewBox="0 0 100 100">
            <rect width="100" height="100" rx="15" fill={bg} stroke={color} strokeWidth="3" />
            {dots.map((pos, i) => (
                <circle key={i} cx={pos[0]} cy={pos[1]} r="8" fill={color} />
            ))}
        </svg>
    )
}

function FlatDice({ rolling, result, diceType, color, bg }) {
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
                <svg width="80" height="80" viewBox="0 0 100 100">
                    <polygon points="50,5 95,35 85,85 15,85 5,35"
                        fill={bg} stroke={color} strokeWidth="3" />
                    <text x="50" y="62" textAnchor="middle" fontSize="28"
                        fontWeight="900" fontFamily="monospace" fill={color}>
                        {displayValue}
                    </text>
                </svg>
            </div>
            <DiceLabel rolling={spinning} diceType={diceType} value={displayValue} />
        </div>
    )
}

function DiceLabel({ rolling, diceType, value }) {
    return (
        <div className="text-xs tracking-widest" style={{ color: '#555' }}>
            {rolling ? 'WÜRFELT...' : `D${diceType || 6} — ${value}`}
        </div>
    )
}

export function Dice3D({ rolling, result, diceType, color, bg }) {
    if (diceType === 6) {
        return <D6Dice rolling={rolling} result={result} color={color} bg={bg} />
    }
    return <FlatDice rolling={rolling} result={result} diceType={diceType} color={color} bg={bg} />
}