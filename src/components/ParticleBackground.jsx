import { useEffect, useMemo, useRef } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import * as THREE from 'three'

// Wirkungsbereich der Partikel in Weltkoordinaten (die Kamera steht bei z = 6)
const BOUNDS = { x: 14, y: 8, zMin: -10, zMax: 3 }
const MAX_FRAME_DELTA = 0.05

// Pro Setting: Farbe (Schlüssel aus setting.colors), Anzahl, Größe,
// Grundgeschwindigkeit [x, y, z] und seitliches Schwanken
const PARTICLE_PRESETS = {
    postApoc: { color: '#ff5a1f', count: 180, size: 0.14, opacity: 0.8, velocity: [0, 0.22, 0], sway: 0.35 },
    fantasy: { colorKey: 'primary', count: 140, size: 0.18, opacity: 0.85, velocity: [0, 0.05, 0], sway: 0.6 },
    scifi: { colorKey: 'primary', count: 260, size: 0.1, opacity: 0.9, velocity: [0, 0, 0.5], sway: 0 },
    cyberpunk: { colorKey: 'primary', count: 240, size: 0.2, opacity: 0.95, velocity: [0, -1.1, 0], sway: 0 },
}

const randomBetween = (min, max) => min + Math.random() * (max - min)

function createParticleData(count) {
    const positions = new Float32Array(count * 3)
    const phases = new Float32Array(count)
    const speeds = new Float32Array(count)

    for (let i = 0; i < count; i++) {
        positions[i * 3] = randomBetween(-BOUNDS.x, BOUNDS.x)
        positions[i * 3 + 1] = randomBetween(-BOUNDS.y, BOUNDS.y)
        positions[i * 3 + 2] = randomBetween(BOUNDS.zMin, BOUNDS.zMax)
        phases[i] = Math.random() * Math.PI * 2
        speeds[i] = randomBetween(0.5, 1.5)
    }

    return { positions, phases, speeds }
}

// Verlässt ein Partikel den Bereich, taucht es auf der Gegenseite wieder auf
function wrap(value, min, max) {
    if (value > max) return min
    if (value < min) return max
    return value
}

// Weicher, runder Punkt statt eckigem Pixel (wird über die Material-Farbe eingefärbt)
function createGlowTexture() {
    const size = 64
    const canvas = document.createElement('canvas')
    canvas.width = size
    canvas.height = size
    const ctx = canvas.getContext('2d')

    const gradient = ctx.createRadialGradient(size / 2, size / 2, 0, size / 2, size / 2, size / 2)
    gradient.addColorStop(0, 'rgba(255, 255, 255, 1)')
    gradient.addColorStop(0.4, 'rgba(255, 255, 255, 0.4)')
    gradient.addColorStop(1, 'rgba(255, 255, 255, 0)')
    ctx.fillStyle = gradient
    ctx.fillRect(0, 0, size, size)

    return new THREE.CanvasTexture(canvas)
}

function Particles({ preset, color }) {
    const geometryRef = useRef(null)
    const timeRef = useRef(0)
    const { positions, phases, speeds } = useMemo(() => createParticleData(preset.count), [preset.count])
    const glowTexture = useMemo(() => createGlowTexture(), [])

    useEffect(() => {
        return () => glowTexture.dispose()
    }, [glowTexture])

    useFrame((_, delta) => {
        const attribute = geometryRef.current?.attributes.position
        if (!attribute) return

        const step = Math.min(delta, MAX_FRAME_DELTA)
        timeRef.current += step

        const array = attribute.array
        const [vx, vy, vz] = preset.velocity

        for (let i = 0; i < preset.count; i++) {
            const base = i * 3
            const sway = Math.sin(timeRef.current + phases[i]) * preset.sway
            array[base] = wrap(array[base] + (vx * speeds[i] + sway) * step, -BOUNDS.x, BOUNDS.x)
            array[base + 1] = wrap(array[base + 1] + vy * speeds[i] * step, -BOUNDS.y, BOUNDS.y)
            array[base + 2] = wrap(array[base + 2] + vz * speeds[i] * step, BOUNDS.zMin, BOUNDS.zMax)
        }
        attribute.needsUpdate = true
    })

    return (
        <points frustumCulled={false}>
            <bufferGeometry ref={geometryRef}>
                <bufferAttribute attach="attributes-position" args={[positions, 3]} />
            </bufferGeometry>
            <pointsMaterial
                map={glowTexture}
                color={color}
                size={preset.size}
                opacity={preset.opacity}
                transparent
                depthWrite={false}
                blending={THREE.AdditiveBlending}
                sizeAttenuation
            />
        </points>
    )
}

export function ParticleBackground({ settingId, colors }) {
    const preset = PARTICLE_PRESETS[settingId]
    if (!preset) return null

    return (
        <div className="pointer-events-none fixed inset-0 -z-10">
            <Canvas camera={{ position: [0, 0, 6], fov: 60 }} dpr={[1, 1.5]}>
                <color attach="background" args={[colors.bg]} />
                <Particles key={settingId} preset={preset} color={preset.color ?? colors[preset.colorKey]} />
            </Canvas>
        </div>
    )
}