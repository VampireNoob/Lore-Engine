import { useRef, useEffect, useCallback } from 'react'

export function useTextToSpeech() {
    const voicesRef = useRef([])

    useEffect(() => {
        if (!('speechSynthesis' in window)) return

        const loadVoices = () => {
            voicesRef.current = window.speechSynthesis.getVoices()
        }
        loadVoices()
        window.speechSynthesis.onvoiceschanged = loadVoices
    }, [])

    const voicePreferenceOrder = ['stefan', 'google deutsch', 'katja', 'hedda']

    const pickGermanVoice = () => {
        const germanVoices = voicesRef.current.filter(v => v.lang.startsWith('de'))
        for (const preferred of voicePreferenceOrder) {
            const match = germanVoices.find(v => v.name.toLowerCase().includes(preferred))
            if (match) return match
        }
        return germanVoices[0] || null
    }

    const speak = useCallback((text, { onEnd } = {}) => {
        if (!('speechSynthesis' in window)) return
        window.speechSynthesis.cancel()

        const utterance = new SpeechSynthesisUtterance(text)
        const voice = pickGermanVoice()
        console.log('🎙️ Gewählte Stimme:', voice?.name || 'KEINE — Browser-Standard wird genutzt')
        if (voice) utterance.voice = voice
        utterance.lang = 'de-DE'
        utterance.rate = 0.95
        utterance.pitch = 0.9
        if (onEnd) utterance.onend = onEnd

        window.speechSynthesis.speak(utterance)
    }, [])

    const stop = useCallback(() => {
        if ('speechSynthesis' in window) window.speechSynthesis.cancel()
    }, [])

    return { speak, stop }
}