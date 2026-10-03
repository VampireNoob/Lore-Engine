import { useEffect, useMemo, useRef } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import * as THREE from 'three'

const CANVAS_SIZE = 120
const ROLL_SPIN_SPEED = 16
const SETTLE_SPEED = 10

const createTilt = (x, y) => new THREE.Quaternion().setFromEuler(new THREE.Euler(x, y, 0))

// ---------- D6 ----------

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

const D6_TILT = createTilt(-0.4, 0.4)

const D6_TARGETS = Object.fromEntries(
    Object.entries(D6_FACE_ROTATIONS).map(([value, [x, y, z]]) => [
        value,
        D6_TILT.clone().multiply(new THREE.Quaternion().setFromEuler(new THREE.Euler(x, y, z))),
    ])
)

function createD6FaceTexture(value, color, bg) {
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

// ---------- D20 ----------

const D20_RADIUS = 1.15
const D20_TILT = createTilt(-0.25, 0.25)

// Textur-Atlas: jede der 20 Flächen bekommt eine eigene Zelle mit Dreieck und Zahl
const CELL_SIZE = 256
const ATLAS_COLS = 8
const ATLAS_ROWS = 4
const TRIANGLE_RADIUS = 118 // Umkreisradius des gleichseitigen Dreiecks in einer Zelle

// Pixelpositionen des Dreiecks in der Zelle (Spitze oben, Ursprung oben links)
function getCellTriangle(index) {
    const originX = (index % ATLAS_COLS) * CELL_SIZE
    const originY = Math.floor(index / ATLAS_COLS) * CELL_SIZE
    const halfWidth = (TRIANGLE_RADIUS * Math.sqrt(3)) / 2
    const top = (CELL_SIZE - TRIANGLE_RADIUS * 1.5) / 2
    const centerX = originX + CELL_SIZE / 2
    const centerY = originY + top + TRIANGLE_RADIUS

    return {
        center: { x: centerX, y: centerY },
        apex: { x: centerX, y: centerY - TRIANGLE_RADIUS },
        bottomLeft: { x: centerX - halfWidth, y: centerY + TRIANGLE_RADIUS / 2 },
        bottomRight: { x: centerX + halfWidth, y: centerY + TRIANGLE_RADIUS / 2 },
    }
}

function createD20Atlas(numbers, color, bg) {
    const canvas = document.createElement('canvas')
    canvas.width = ATLAS_COLS * CELL_SIZE
    canvas.height = ATLAS_ROWS * CELL_SIZE
    const ctx = canvas.getContext('2d')

    ctx.fillStyle = bg
    ctx.fillRect(0, 0, canvas.width, canvas.height)
    ctx.strokeStyle = color
    ctx.fillStyle = color
    ctx.lineWidth = 12
    ctx.lineJoin = 'round'
    ctx.textAlign = 'center'
    ctx.textBaseline = 'middle'

    numbers.forEach((value, i) => {
        const { center, apex, bottomLeft, bottomRight } = getCellTriangle(i)

        ctx.beginPath()
        ctx.moveTo(apex.x, apex.y)
        ctx.lineTo(bottomLeft.x, bottomLeft.y)
        ctx.lineTo(bottomRight.x, bottomRight.y)
        ctx.closePath()
        ctx.stroke()

        ctx.font = `bold ${value >= 10 ? 76 : 96}px monospace`
        ctx.fillText(String(value), center.x, center.y - 4)

        // 6 und 9 unterstreichen, damit man sie nicht verwechselt
        if (value === 6 || value === 9) {
            ctx.fillRect(center.x - 20, center.y + 38, 40, 6)
        }
    })

    const texture = new THREE.CanvasTexture(canvas)
    texture.colorSpace = THREE.SRGBColorSpace
    texture.anisotropy = 4
    return texture
}

function buildD20() {
    const geometry = new THREE.IcosahedronGeometry(D20_RADIUS, 0)
    const position = geometry.getAttribute('position')
    const faceCount = position.count / 3

    const faces = Array.from({ length: faceCount }, (_, i) => {
        const a = new THREE.Vector3().fromBufferAttribute(position, i * 3)
        const b = new THREE.Vector3().fromBufferAttribute(position, i * 3 + 1)
        const c = new THREE.Vector3().fromBufferAttribute(position, i * 3 + 2)
        const center = new THREE.Vector3().add(a).add(b).add(c).divideScalar(3)
        const normal = new THREE.Vector3().subVectors(b, a).cross(new THREE.Vector3().subVectors(c, a)).normalize()
        return { a, center, normal }
    })

    // Gegenüberliegende Flächen ergeben zusammen 21, wie bei einem echten D20
    const numbers = new Array(faceCount).fill(0)
    let nextNumber = 1
    faces.forEach((face, i) => {
        if (numbers[i]) return
        const opposite = faces.findIndex(other => other.normal.dot(face.normal) < -0.99)
        numbers[i] = nextNumber
        numbers[opposite] = faceCount + 1 - nextNumber
        nextNumber++
    })

    // Jede Dreiecksfläche zeigt auf ihre Atlas-Zelle: Eckpunkt 0 = Spitze, 1 = links unten, 2 = rechts unten
    const uv = new Float32Array(faceCount * 6)
    for (let i = 0; i < faceCount; i++) {
        const { apex, bottomLeft, bottomRight } = getCellTriangle(i)
        const corners = [apex, bottomLeft, bottomRight]
        corners.forEach((point, k) => {
            uv[i * 6 + k * 2] = point.x / (ATLAS_COLS * CELL_SIZE)
            uv[i * 6 + k * 2 + 1] = 1 - point.y / (ATLAS_ROWS * CELL_SIZE)
        })
    }
    geometry.setAttribute('uv', new THREE.BufferAttribute(uv, 2))

    // Zielausrichtung pro Zahl: Fläche zeigt zur Kamera, Zahl steht aufrecht
    const targets = {}
    faces.forEach((face, i) => {
        const up = new THREE.Vector3().subVectors(face.a, face.center).normalize()
        const right = new THREE.Vector3().crossVectors(up, face.normal)
        const faceBasis = new THREE.Matrix4().makeBasis(right, up, face.normal)
        const faceToCamera = new THREE.Quaternion().setFromRotationMatrix(faceBasis).invert()
        targets[numbers[i]] = D20_TILT.clone().multiply(faceToCamera)
    })

    return { geometry, numbers, targets }
}

const D20 = buildD20()

// ---------- Gemeinsame Wurf-Animation ----------

function RollingDie({ rolling, result, targets, children }) {
    const meshRef = useRef(null)
    const rollingRef = useRef(rolling)
    const resultRef = useRef(result)
    const spinAxis = useRef(new THREE.Vector3(1, 1, 0).normalize())
    const rollTime = useRef(0)

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
            const target = targets[resultRef.current] || Object.values(targets)[0]
            const blend = 1 - Math.exp(-delta * SETTLE_SPEED)
            mesh.quaternion.slerp(target, blend)
            mesh.position.y = THREE.MathUtils.lerp(mesh.position.y, 0, blend)
        }
    })

    return <mesh ref={meshRef}>{children}</mesh>
}

function D6Mesh({ rolling, result, color, bg }) {
    const textures = useMemo(
        () => D6_FACE_VALUES.map(value => createD6FaceTexture(value, color, bg)),
        [color, bg]
    )

    useEffect(() => {
        return () => textures.forEach(texture => texture.dispose())
    }, [textures])

    return (
        <RollingDie rolling={rolling} result={result} targets={D6_TARGETS}>
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
        </RollingDie>
    )
}

function D20Mesh({ rolling, result, color, bg }) {
    const atlas = useMemo(() => createD20Atlas(D20.numbers, color, bg), [color, bg])

    useEffect(() => {
        return () => atlas.dispose()
    }, [atlas])

    return (
        <RollingDie rolling={rolling} result={result} targets={D20.targets}>
            <primitive object={D20.geometry} attach="geometry" dispose={null} />
            <meshStandardMaterial
                map={atlas}
                emissiveMap={atlas}
                emissive="#ffffff"
                emissiveIntensity={0.5}
                roughness={0.5}
            />
        </RollingDie>
    )
}

export function Dice3D({ rolling, result, diceType, color, bg }) {
    return (
        <div className="flex flex-col items-center gap-2">
            <Canvas
                camera={{ position: [0, 0, 4.5], fov: 35 }}
                style={{ width: CANVAS_SIZE, height: CANVAS_SIZE }}
            >
                <ambientLight intensity={0.6} />
                <directionalLight position={[3, 4, 5]} intensity={1.5} />
                {diceType === 20
                    ? <D20Mesh rolling={rolling} result={result} color={color} bg={bg} />
                    : <D6Mesh rolling={rolling} result={result} color={color} bg={bg} />}
            </Canvas>
            <div className="text-xs tracking-widest" style={{ color: '#555' }}>
                {rolling ? 'WÜRFELT...' : `D${diceType || 6} — ${result}`}
            </div>
        </div>
    )
}