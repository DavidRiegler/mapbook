'use client'

import { MapPin, Edit2, Trash2 } from 'lucide-react'
import { getCountryByCode } from '@/lib/countries'
import type { Memory } from '@/lib/types'
import { Button } from '@/components/ui/button'
import { ScrollArea } from '@/components/ui/scroll-area'

interface VisitedCountriesListProps {
  memories: Memory[]
  onEditMemory: (memory: Memory) => void
  onDeleteMemory: (id: string) => void
}

export function VisitedCountriesList({ 
  memories, 
  onEditMemory, 
  onDeleteMemory 
}: VisitedCountriesListProps) {
  const visitedCountries = memories.map(m => ({
    ...m,
    country: getCountryByCode(m.countryCode),
  }))

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
          Visited Countries
        </h2>
        <span className="rounded-full bg-primary/20 px-2 py-0.5 text-xs font-medium text-primary">
          {memories.length}
        </span>
      </div>

      {memories.length === 0 ? (
        <div className="flex flex-col items-center gap-3 rounded-lg border border-dashed border-border py-8 text-center">
          <MapPin className="h-8 w-8 text-muted-foreground" />
          <div>
            <p className="text-sm font-medium text-foreground">No countries visited yet</p>
            <p className="text-xs text-muted-foreground">
              Search for a country and add your first memory
            </p>
          </div>
        </div>
      ) : (
        <ScrollArea className="h-[calc(100vh-320px)]">
          <div className="flex flex-col gap-2 pr-4">
            {visitedCountries.map((item) => (
              <div
                key={item.id}
                className="group flex items-start gap-3 rounded-lg border border-border bg-secondary/50 p-3 transition-colors hover:bg-secondary"
              >
                <span className="text-2xl">{item.country?.flag}</span>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-foreground">{item.country?.name || item.countryName}</p>
                  {item.description && (
                    <p className="mt-1 line-clamp-2 text-xs text-muted-foreground">
                      {item.description}
                    </p>
                  )}
                  {item.images.length > 0 && (
                    <div className="mt-2 flex gap-1">
                      {item.images.slice(0, 3).map((img, i) => (
                        <img
                          key={i}
                          src={img}
                          alt=""
                          className="h-8 w-8 rounded-sm object-cover"
                        />
                      ))}
                      {item.images.length > 3 && (
                        <div className="flex h-8 w-8 items-center justify-center rounded-sm bg-muted text-xs text-muted-foreground">
                          +{item.images.length - 3}
                        </div>
                      )}
                    </div>
                  )}
                </div>
                <div className="flex gap-1 opacity-0 transition-opacity group-hover:opacity-100">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7 text-muted-foreground hover:text-foreground"
                    onClick={() => onEditMemory(item)}
                  >
                    <Edit2 className="h-3.5 w-3.5" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7 text-muted-foreground hover:text-destructive"
                    onClick={() => onDeleteMemory(item.id)}
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </ScrollArea>
      )}
    </div>
  )
}
