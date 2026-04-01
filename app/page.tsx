'use client'

import { useState } from 'react'
import { Header } from '@/components/header'
import { CountriesPage } from '@/components/countries-page'
import { LockedPage } from '@/components/locked-page'
import { useMemories } from '@/hooks/use-memories'
import type { TabType } from '@/lib/types'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Crown } from 'lucide-react'

export default function Home() {
  const [activeTab, setActiveTab] = useState<TabType>('countries')
  const [upgradeDialogOpen, setUpgradeDialogOpen] = useState(false)
  
  const {
    memories,
    isLoaded,
    addMemory,
    updateMemory,
    deleteMemory,
  } = useMemories()

  const handleTabChange = (tab: TabType) => {
    setActiveTab(tab)
  }

  const handleUpgradeClick = () => {
    setUpgradeDialogOpen(true)
  }

  if (!isLoaded) {
    return (
      <div className="flex h-screen items-center justify-center bg-background">
        <div className="animate-pulse text-muted-foreground">Loading...</div>
      </div>
    )
  }

  return (
    <div className="flex h-screen flex-col bg-background">
      <Header activeTab={activeTab} onTabChange={handleTabChange} />
      
      <main className="flex-1 overflow-hidden">
        {activeTab === 'countries' && (
          <CountriesPage
            memories={memories}
            onAddMemory={addMemory}
            onUpdateMemory={updateMemory}
            onDeleteMemory={deleteMemory}
          />
        )}
        
        {activeTab === 'regions' && (
          <LockedPage 
            title="Regions Coming Soon" 
            onUpgradeClick={handleUpgradeClick}
          />
        )}
        
        {activeTab === 'cities' && (
          <LockedPage 
            title="Cities Coming Soon" 
            onUpgradeClick={handleUpgradeClick}
          />
        )}
      </main>

      {/* Upgrade Dialog */}
      <Dialog open={upgradeDialogOpen} onOpenChange={setUpgradeDialogOpen}>
        <DialogContent className="bg-card text-card-foreground">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Crown className="h-5 w-5 text-primary" />
              Upgrade to Full Version
            </DialogTitle>
            <DialogDescription className="text-muted-foreground">
              Future feature
            </DialogDescription>
          </DialogHeader>
          <div className="flex flex-col items-center gap-4 py-6">
            <div className="rounded-full bg-primary/20 p-4">
              <Crown className="h-12 w-12 text-primary" />
            </div>
            <p className="text-center text-muted-foreground">
              This feature is coming soon. Stay tuned for exciting upgrades!
            </p>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
