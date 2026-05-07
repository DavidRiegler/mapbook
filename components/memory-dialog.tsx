'use client'

import { useState, useRef } from 'react'
import Image from 'next/image'
import { ImagePlus, X, Crown, Check, Edit2, Trash2, Calendar } from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { FieldGroup, Field, FieldLabel } from '@/components/ui/field'
import type { Country, Memory } from '@/lib/types'

interface MemoryDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  country: Country | null
  editingMemory?: Memory | null
  previousVisits?: Memory[]
  onSave: (data: { description: string; images: string[] }) => void
  onDelete?: () => void
  onEditVisit?: (memory: Memory) => void
  onDeleteVisit?: (id: string) => void
}

interface MemoryFormProps {
  country: Country
  editingMemory: Memory | null | undefined
  previousVisits: Memory[]
  onSave: (data: { description: string; images: string[] }) => void
  onDelete?: () => void
  onOpenChange: (open: boolean) => void
  onEditVisit?: (memory: Memory) => void
  onDeleteVisit?: (id: string) => void
}

const MAX_IMAGES = 5

function formatDate(isoString: string): string {
  return new Date(isoString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  })
}

function MemoryForm({
  country,
  editingMemory,
  previousVisits,
  onSave,
  onDelete,
  onOpenChange,
  onEditVisit,
  onDeleteVisit,
}: MemoryFormProps) {
  const [description, setDescription] = useState(editingMemory?.description ?? '')
  const [images, setImages] = useState<string[]>(editingMemory?.images ?? [])
  const [showUpgradeHint, setShowUpgradeHint] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (!files) return

    const remainingSlots = MAX_IMAGES - images.length
    const filesToProcess = Array.from(files).slice(0, remainingSlots)

    if (files.length > remainingSlots) {
      setShowUpgradeHint(true)
    }

    filesToProcess.forEach((file) => {
      const reader = new FileReader()
      reader.onload = (event) => {
        const result = event.target?.result as string
        setImages((prev) => {
          if (prev.length >= MAX_IMAGES) return prev
          return [...prev, result]
        })
      }
      reader.readAsDataURL(file)
    })

    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  const removeImage = (index: number) => {
    setImages((prev) => prev.filter((_, i) => i !== index))
    setShowUpgradeHint(false)
  }

  const handleSave = () => {
    onSave({ description, images })
    onOpenChange(false)
  }

  const previousVisitsSectionTitle = previousVisits.length > 0
    ? editingMemory
      ? `Other Visits (${previousVisits.length})`
      : `Previous Visits (${previousVisits.length})`
    : null

  return (
    <>
      <DialogHeader>
          <DialogTitle className="flex items-center gap-3">
            <Image
              src={`/country-flags/${country.code.toLowerCase()}.svg`}
              alt={country.name}
              className="h-6 w-8 object-cover rounded-sm"
              width={40}
              height={30}
            />
            {country.name}
          </DialogTitle>
          <DialogDescription className="text-muted-foreground">
            {editingMemory ? 'Edit this visit' : 'Add a new visit for this country'}
          </DialogDescription>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto min-h-0">
          <FieldGroup className="gap-4">
            <Field>
              <div className="flex items-center justify-between">
                <FieldLabel>Status</FieldLabel>
                <div className="flex items-center gap-2 rounded-full bg-primary/20 px-3 py-1 text-sm text-primary">
                  <Check className="h-4 w-4" />
                  Visited
                </div>
              </div>
            </Field>

            <Field>
              <FieldLabel>Description</FieldLabel>
              <Textarea
                placeholder="Write about your experience, what you did, what you liked..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="min-h-25 resize-none bg-secondary"
              />
            </Field>

            <Field>
              <div className="flex items-center justify-between">
                <FieldLabel>Photos ({images.length}/{MAX_IMAGES})</FieldLabel>
                {images.length < MAX_IMAGES && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => fileInputRef.current?.click()}
                    className="h-8 gap-1 text-xs"
                  >
                    <ImagePlus className="h-3.5 w-3.5" />
                    Add Photo
                  </Button>
                )}
              </div>

              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                multiple
                className="hidden"
                onChange={handleImageUpload}
                title="Upload photos"
                aria-label="Upload photos"
              />

              {images.length > 0 ? (
                <div className="grid grid-cols-3 gap-2">
                  {images.map((img, index) => (
                    <div key={index} className="group relative aspect-square overflow-hidden rounded-lg">
                      <Image
                        src={img}
                        alt={`Memory ${index + 1}`}
                        fill
                        className="object-cover"
                        unoptimized
                        sizes="100vw"
                      />
                      <Button
                        type="button"
                        variant="destructive"
                        size="icon"
                        className="absolute -right-2 -top-2 h-6 w-6 opacity-0 transition-opacity group-hover:opacity-100"
                        onClick={() => removeImage(index)}
                      >
                        <X className="h-3 w-3" />
                      </Button>
                    </div>
                  ))}
                  {images.length < MAX_IMAGES && (
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="flex aspect-square items-center justify-center rounded-lg border-2 border-dashed border-border text-muted-foreground transition-colors hover:border-primary hover:text-primary"
                      title="Add photo"
                      aria-label="Add photo"
                    >
                      <ImagePlus className="h-6 w-6" />
                    </button>
                  )}
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="flex h-24 w-full items-center justify-center gap-2 rounded-lg border-2 border-dashed border-border text-muted-foreground transition-colors hover:border-primary hover:text-primary"
                >
                  <ImagePlus className="h-5 w-5" />
                  <span className="text-sm">Click to add photos</span>
                </button>
              )}

              {showUpgradeHint && (
                <div className="mt-2 flex items-center gap-2 rounded-lg bg-primary/10 px-3 py-2 text-xs text-primary">
                  <Crown className="h-4 w-4" />
                  <span>Upgrade to full version for more than 5 photos</span>
                </div>
              )}
            </Field>
          </FieldGroup>

          {previousVisitsSectionTitle && (
            <div className="mt-4 border-t border-border pt-4">
              <p className="mb-3 text-sm font-medium text-muted-foreground">
                {previousVisitsSectionTitle}
              </p>
              <div className="flex flex-col gap-2">
                {previousVisits.map((visit) => (
                  <div
                    key={visit.id}
                    className="group rounded-lg border border-border bg-secondary/50 p-3"
                  >
                    <div className="flex items-start gap-2">
                      <div className="flex-1 min-w-0">
                        <div className="mb-1 flex items-center gap-1.5 text-xs text-muted-foreground">
                          <Calendar className="h-3 w-3" />
                          {formatDate(visit.createdAt)}
                        </div>
                        {visit.description && (
                          <p className="line-clamp-2 text-xs text-foreground">
                            {visit.description}
                          </p>
                        )}
                        {visit.images.length > 0 && (
                          <div className="mt-2 flex gap-1">
                            {visit.images.slice(0, 3).map((img, i) => (
                              <Image
                                key={i}
                                src={img}
                                alt=""
                                className="h-8 w-8 rounded-sm object-cover"
                                width={32}
                                height={32}
                                unoptimized
                              />
                            ))}
                            {visit.images.length > 3 && (
                              <div className="flex h-8 w-8 items-center justify-center rounded-sm bg-muted text-xs text-muted-foreground">
                                +{visit.images.length - 3}
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                      <div className="flex shrink-0 gap-1">
                        {onEditVisit && (
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            className="h-7 w-7 text-muted-foreground hover:text-foreground"
                            onClick={() => onEditVisit(visit)}
                          >
                            <Edit2 className="h-3.5 w-3.5" />
                          </Button>
                        )}
                        {onDeleteVisit && (
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            className="h-7 w-7 text-muted-foreground hover:text-destructive"
                            onClick={() => onDeleteVisit(visit.id)}
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        <DialogFooter className="flex gap-2 sm:justify-between">
          {editingMemory && onDelete && (
            <Button
              type="button"
              variant="destructive"
              onClick={() => {
                onDelete()
                onOpenChange(false)
              }}
            >
              Delete Visit
            </Button>
          )}
          <div className="ml-auto flex gap-2">
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button onClick={handleSave}>
              {editingMemory ? 'Save Changes' : 'Add Visit'}
            </Button>
          </div>
        </DialogFooter>
    </>
  )
}

export function MemoryDialog({
  open,
  onOpenChange,
  country,
  editingMemory,
  previousVisits = [],
  onSave,
  onDelete,
  onEditVisit,
  onDeleteVisit,
}: MemoryDialogProps) {
  if (!country) return null

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md bg-card text-card-foreground flex flex-col max-h-[85vh]">
        <MemoryForm
          key={editingMemory?.id ?? 'new'}
          country={country}
          editingMemory={editingMemory}
          previousVisits={previousVisits}
          onSave={onSave}
          onDelete={onDelete}
          onOpenChange={onOpenChange}
          onEditVisit={onEditVisit}
          onDeleteVisit={onDeleteVisit}
        />
      </DialogContent>
    </Dialog>
  )
}
