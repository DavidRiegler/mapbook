'use client'

import { Lock, Crown } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface LockedPageProps {
  title: string
  onUpgradeClick: () => void
}

export function LockedPage({ title, onUpgradeClick }: LockedPageProps) {
  return (
    <div className="relative flex h-full w-full flex-col items-center justify-center overflow-hidden">
      {/* Blurred background map placeholder */}
      <div 
        className="absolute inset-0 blur-lg opacity-30"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 1200 600'%3E%3Crect fill='%23374151' width='1200' height='600'/%3E%3Ccircle cx='200' cy='300' r='80' fill='%23505a6b'/%3E%3Ccircle cx='400' cy='200' r='120' fill='%23505a6b'/%3E%3Ccircle cx='700' cy='350' r='150' fill='%23505a6b'/%3E%3Ccircle cx='950' cy='250' r='100' fill='%23505a6b'/%3E%3Ccircle cx='1100' cy='400' r='70' fill='%23505a6b'/%3E%3C/svg%3E")`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
      />

      {/* Lock overlay */}
      <div className="relative z-10 flex flex-col items-center gap-6 text-center">
        <div className="rounded-full bg-muted p-6">
          <Lock className="h-16 w-16 text-muted-foreground" />
        </div>
        
        <div className="space-y-2">
          <h2 className="text-2xl font-semibold text-foreground">
            {title}
          </h2>
          <p className="max-w-md text-muted-foreground">
            This feature is available in the full version. Upgrade to unlock 
            region and city-level tracking for your travels.
          </p>
        </div>

        <Button 
          onClick={onUpgradeClick}
          className="gap-2"
          size="lg"
        >
          <Crown className="h-5 w-5" />
          Upgrade to Full Version
        </Button>
      </div>
    </div>
  )
}
