import { useEffect, useState } from 'react'

export function AchievementToast({ achievement, onDone }) {
    const [visible, setVisible] = useState(false)

    useEffect(() => {
        const showTimer = setTimeout(() => setVisible(true), 50)
        const hideTimer = setTimeout(() => setVisible(false), 3500)
        const doneTimer = setTimeout(() => onDone(), 4000)
        return () => {
            clearTimeout(showTimer)
            clearTimeout(hideTimer)
            clearTimeout(doneTimer)
        }
    }, [achievement])

    return (
        <div
            className="fixed top-6 right-6 z-50 border p-4 flex items-center gap-3 transition-all duration-500"
            style={{
                background: '#111',
                borderColor: '#39ff14',
                boxShadow: '0 0 20px #39ff1455',
                transform: visible ? 'translateX(0)' : 'translateX(120%)',
                opacity: visible ? 1 : 0,
            }}
        >
            <div className="text-3xl">{achievement.emoji}</div>
            <div>
                <div className="text-xs tracking-widest" style={{ color: '#39ff14' }}>
                    ACHIEVEMENT FREIGESCHALTET
                </div>
                <div className="text-sm font-bold text-white">{achievement.title}</div>
                <div className="text-xs" style={{ color: '#888' }}>{achievement.desc}</div>
            </div>
        </div>
    )
}