'use client'

import { useState, useEffect, useRef } from 'react'
import Image from 'next/image'
import { ImagePlus, X, Crown, Check } from 'lucide-react'
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
  existingMemory?: Memory | null
  onSave: (data: { description: string; images: string[] }) => void
  onDelete?: () => void
}

const MAX_IMAGES = 5

export function MemoryDialog({
  open,
  onOpenChange,
  country,
  existingMemory,
  onSave,
  onDelete,
}: MemoryDialogProps) {
  const [description, setDescription] = useState('')
  const [images, setImages] = useState<string[]>([])
  const [showUpgradeHint, setShowUpgradeHint] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  /* eslint-disable react-hooks/set-state-in-effect */
  useEffect(() => {
    if (existingMemory) {
      setDescription(existingMemory.description)
      setImages(existingMemory.images)
    } else {
      setDescription('')
      setImages([])
    }
    setShowUpgradeHint(false)
  }, [existingMemory, open])
  /* eslint-enable react-hooks/set-state-in-effect */

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

  if (!country) return null

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md bg-card text-card-foreground">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-3">
            <Image
              src={`https://flagcdn.com/w40/${country.code.toLowerCase()}.png`}
              alt={country.name}
              className="h-6 w-8 object-cover rounded-sm"
              width={40}
              height={30}
            />
            {country.name}
          </DialogTitle>
          <DialogDescription className="text-muted-foreground">
            {existingMemory ? 'Edit your memory' : 'Add a new memory for this country'}
          </DialogDescription>
        </DialogHeader>

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

        <DialogFooter className="flex gap-2 sm:justify-between">
          {existingMemory && onDelete && (
            <Button
              type="button"
              variant="destructive"
              onClick={() => {
                onDelete()
                onOpenChange(false)
              }}
            >
              Delete Memory
            </Button>
          )}
          <div className="flex gap-2 ml-auto">
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button onClick={handleSave}>
              {existingMemory ? 'Save Changes' : 'Add Memory'}
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
