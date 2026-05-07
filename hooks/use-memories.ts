'use client'

import { useState, useEffect, useCallback } from 'react'
import type { Memory } from '@/lib/types'

const STORAGE_KEY = 'travel-memories'

function loadMemories(): Memory[] {
  if (typeof window === 'undefined') {
    return []
  }

  const stored = localStorage.getItem(STORAGE_KEY)
  if (!stored) {
    return []
  }

  try {
    const parsed = JSON.parse(stored)
    return Array.isArray(parsed) ? parsed : []
  } catch {
    return []
  }
}

export function useMemories() {
  const [memories, setMemories] = useState<Memory[]>([])
  const [isLoaded, setIsLoaded] = useState(false)

  useEffect(() => {
    setMemories(loadMemories())
    setIsLoaded(true)
  }, [])

  useEffect(() => {
    if (isLoaded) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(memories))
    }
  }, [memories, isLoaded])

  const addMemory = useCallback((memory: Omit<Memory, 'id' | 'createdAt' | 'updatedAt'>) => {
    const newMemory: Memory = {
      ...memory,
      id: crypto.randomUUID(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }

    setMemories(prev => [...prev, newMemory])
    return newMemory
  }, [])

  const updateMemory = useCallback((id: string, updates: Partial<Omit<Memory, 'id' | 'createdAt'>>) => {
    setMemories(prev => prev.map(m =>
      m.id === id
        ? { ...m, ...updates, updatedAt: new Date().toISOString() }
        : m
    ))
  }, [])

  const deleteMemory = useCallback((id: string) => {
    setMemories(prev => prev.filter(m => m.id !== id))
  }, [])

  const getMemoryByCountry = useCallback((countryCode: string) => {
    return memories.find(m => m.countryCode === countryCode)
  }, [memories])

  const getMemoriesByCountry = useCallback((countryCode: string) => {
    return memories.filter(m => m.countryCode === countryCode)
  }, [memories])

  const getVisitedCountries = useCallback(() => {
    return [...new Set(memories.map(m => m.countryCode))]
  }, [memories])

  return {
    memories,
    isLoaded,
    addMemory,
    updateMemory,
    deleteMemory,
    getMemoryByCountry,
    getMemoriesByCountry,
    getVisitedCountries,
  }
}
