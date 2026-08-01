import { useState } from 'react'

export function useLocalStorage(key, initialValue) {
    const [storedValue, setStoredValue] = useState(() => {
        try {
        const item = localStorage.getItem(key)
        return item ? JSON.parse(item) : initialValue
        } catch (error) {
        console.error('localStorage read error:', error)
        return initialValue
        }
    })

    const setValue = (value) => {
        try {
        setStoredValue(value)
        localStorage.setItem(key, JSON.stringify(value))
        } catch (error) {
        console.error('localStorage write error:', error)
        }
    }

    const removeValue = () => {
        try {
        setStoredValue(initialValue)
        localStorage.removeItem(key)
        } catch (error) {
        console.error('localStorage remove error:', error)
        }
    }

    return [storedValue, setValue, removeValue]
}