import { useEffect, useRef, useState } from 'react'

const musicRecipes = {
    postApoc: (ctx, masterGain) => {
        const osc1 = ctx.createOscillator()
        const osc2 = ctx.createOscillator()
        osc1.type = 'sawtooth'
        osc2.type = 'sawtooth'
        osc1.frequency.value = 55
        osc2.frequency.value = 58

        const filter = ctx.createBiquadFilter()
        filter.type = 'lowpass'
        filter.frequency.value = 300

        // Langsames, unheilvolles "Atmen" des Filters
        const filterLfo = ctx.createOscillator()
        const filterLfoGain = ctx.createGain()
        filterLfo.frequency.value = 0.06
        filterLfoGain.gain.value = 120
        filterLfo.connect(filterLfoGain)
        filterLfoGain.connect(filter.frequency)

        const gain = ctx.createGain()
        gain.gain.value = 0.06

        osc1.connect(filter)
        osc2.connect(filter)
        filter.connect(gain)
        gain.connect(masterGain)

        osc1.start()
        osc2.start()
        filterLfo.start()

        return () => { osc1.stop(); osc2.stop(); filterLfo.stop() }
    },
    fantasy: (ctx, masterGain) => {
        const osc1 = ctx.createOscillator()
        const osc2 = ctx.createOscillator()
        osc1.type = 'sine'
        osc2.type = 'sine'
        osc1.frequency.value = 110
        osc2.frequency.value = 165 // Quinte — mystischer Klang

        const lfo = ctx.createOscillator()
        const lfoGain = ctx.createGain()
        lfo.frequency.value = 0.15
        lfoGain.gain.value = 4
        lfo.connect(lfoGain)
        lfoGain.connect(osc1.frequency)

        const gain = ctx.createGain()
        gain.gain.value = 0.05

        osc1.connect(gain)
        osc2.connect(gain)
        gain.connect(masterGain)

        osc1.start()
        osc2.start()
        lfo.start()

        return () => { osc1.stop(); osc2.stop(); lfo.stop() }
    },
    scifi: (ctx, masterGain) => {
        const osc1 = ctx.createOscillator()
        const osc2 = ctx.createOscillator()
        osc1.type = 'sine'
        osc2.type = 'sine'
        osc1.frequency.value = 220
        osc2.frequency.value = 221.5 // feine Schwebung, kühl

        const filter = ctx.createBiquadFilter()
        filter.type = 'lowpass'
        filter.frequency.value = 800

        const filterLfo = ctx.createOscillator()
        const filterLfoGain = ctx.createGain()
        filterLfo.frequency.value = 0.08
        filterLfoGain.gain.value = 300
        filterLfo.connect(filterLfoGain)
        filterLfoGain.connect(filter.frequency)

        const gain = ctx.createGain()
        gain.gain.value = 0.045

        osc1.connect(filter)
        osc2.connect(filter)
        filter.connect(gain)
        gain.connect(masterGain)

        osc1.start()
        osc2.start()
        filterLfo.start()

        return () => { osc1.stop(); osc2.stop(); filterLfo.stop() }
    },
    cyberpunk: (ctx, masterGain) => {
        const bass = ctx.createOscillator()
        bass.type = 'sawtooth'
        bass.frequency.value = 65

        const pulseLfo = ctx.createOscillator()
        const pulseLfoGain = ctx.createGain()
        pulseLfo.frequency.value = 2
        pulseLfoGain.gain.value = 0.03

        const bassGain = ctx.createGain()
        bassGain.gain.value = 0.05

        pulseLfo.connect(pulseLfoGain)
        pulseLfoGain.connect(bassGain.gain)

        bass.connect(bassGain)
        bassGain.connect(masterGain)

        const high = ctx.createOscillator()
        high.type = 'square'
        high.frequency.value = 440
        const highGain = ctx.createGain()
        highGain.gain.value = 0.008
        high.connect(highGain)
        highGain.connect(masterGain)

        bass.start()
        pulseLfo.start()
        high.start()

        return () => { bass.stop(); pulseLfo.stop(); high.stop() }
    },
}

export function useAmbientMusic(settingId) {
    const ctxRef = useRef(null)
    const masterGainRef = useRef(null)
    const stopFnRef = useRef(null)
    const [enabled, setEnabled] = useState(false)

    useEffect(() => {
        return () => {
            if (stopFnRef.current) stopFnRef.current()
            if (ctxRef.current) ctxRef.current.close()
        }
    }, [])

    useEffect(() => {
        if (!enabled || !settingId) return
        if (!ctxRef.current) {
            ctxRef.current = new (window.AudioContext || window.webkitAudioContext)()
            masterGainRef.current = ctxRef.current.createGain()
            masterGainRef.current.gain.value = 1
            masterGainRef.current.connect(ctxRef.current.destination)
        }
        if (stopFnRef.current) {
            stopFnRef.current()
            stopFnRef.current = null
        }
        const recipe = musicRecipes[settingId]
        if (recipe) {
            stopFnRef.current = recipe(ctxRef.current, masterGainRef.current)
        }
    }, [enabled, settingId])

    const toggle = () => {
        if (!enabled) {
            setEnabled(true)
        } else {
            if (stopFnRef.current) {
                stopFnRef.current()
                stopFnRef.current = null
            }
            setEnabled(false)
        }
    }

    const [volume, setVolume] = useState(0.5)

    const changeVolume = (value) => {
        setVolume(value)
        if (masterGainRef.current) {
            masterGainRef.current.gain.value = value
        }
    }

    return { enabled, toggle, volume, changeVolume }
}