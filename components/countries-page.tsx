'use client'

import { useState, useCallback } from 'react'
import { WorldMap } from '@/components/world-map'
import { CountrySearch } from '@/components/country-search'
import { VisitedCountriesList } from '@/components/visited-countries-list'
import { MemoryDialog } from '@/components/memory-dialog'
import { getCountryByCode } from '@/lib/countries'
import type { Country, Memory } from '@/lib/types'

interface CountriesPageProps {
  memories: Memory[]
  onAddMemory: (memory: Omit<Memory, 'id' | 'createdAt' | 'updatedAt'>) => void
  onUpdateMemory: (id: string, updates: Partial<Omit<Memory, 'id' | 'createdAt'>>) => void
  onDeleteMemory: (id: string) => void
}

export function CountriesPage({
  memories,
  onAddMemory,
  onUpdateMemory,
  onDeleteMemory,
}: CountriesPageProps) {
  const [selectedCountry, setSelectedCountry] = useState<Country | null>(null)
  const [editingMemory, setEditingMemory] = useState<Memory | null>(null)
  const [dialogOpen, setDialogOpen] = useState(false)

  const visitedCountries = memories.map((m) => m.countryCode)

  const handleCountrySelect = useCallback((country: Country) => {
    setSelectedCountry(country)
    const existing = memories.find((m) => m.countryCode === country.code)
    setEditingMemory(existing || null)
    setDialogOpen(true)
  }, [memories])

  const handleCountryClick = useCallback((countryCode: string) => {
    const country = getCountryByCode(countryCode)
    if (country) {
      handleCountrySelect(country)
    }
  }, [handleCountrySelect])

  const handleEditMemory = useCallback((memory: Memory) => {
    const country = getCountryByCode(memory.countryCode)
    setSelectedCountry(country || null)
    setEditingMemory(memory)
    setDialogOpen(true)
  }, [])

  const handleSave = useCallback((data: { description: string; images: string[] }) => {
    if (!selectedCountry) return

    if (editingMemory) {
      onUpdateMemory(editingMemory.id, {
        description: data.description,
        images: data.images,
      })
    } else {
      onAddMemory({
        countryCode: selectedCountry.code,
        countryName: selectedCountry.name,
        description: data.description,
        images: data.images,
      })
    }

    setDialogOpen(false)
    setSelectedCountry(null)
    setEditingMemory(null)
  }, [selectedCountry, editingMemory, onAddMemory, onUpdateMemory])

  const handleDelete = useCallback(() => {
    if (editingMemory) {
      onDeleteMemory(editingMemory.id)
      setDialogOpen(false)
      setSelectedCountry(null)
      setEditingMemory(null)
    }
  }, [editingMemory, onDeleteMemory])

  return (
    <div className="flex h-full gap-6 p-6">
      {/* Left sidebar - Search */}
      <div className="w-72 shrink-0">
        <CountrySearch
          onSelectCountry={handleCountrySelect}
          visitedCountries={visitedCountries}
        />
      </div>

      {/* Center - Map */}
      <div className="flex-1 min-h-0">
        <WorldMap
          visitedCountries={visitedCountries}
          onCountryClick={handleCountryClick}
        />
      </div>

      {/* Right sidebar - Visited list */}
      <div className="w-80 shrink-0">
        <VisitedCountriesList
          memories={memories}
          onEditMemory={handleEditMemory}
          onDeleteMemory={onDeleteMemory}
        />
      </div>

      {/* Memory Dialog */}
      <MemoryDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        country={selectedCountry}
        existingMemory={editingMemory}
        onSave={handleSave}
        onDelete={editingMemory ? handleDelete : undefined}
      />
    </div>
  )
}
