'use client'

import { useState } from 'react'
import { Settings, User, Crown, Globe, Map, Building2 } from 'lucide-react'
import type { TabType } from '@/lib/types'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { FieldGroup, Field, FieldLabel } from '@/components/ui/field'
import { Input } from '@/components/ui/input'

interface HeaderProps {
  activeTab: TabType
  onTabChange: (tab: TabType) => void
}

export function Header({ activeTab, onTabChange }: HeaderProps) {
  const [upgradeOpen, setUpgradeOpen] = useState(false)
  const [settingsOpen, setSettingsOpen] = useState(false)
  const [accountOpen, setAccountOpen] = useState(false)

  const tabs: { id: TabType; label: string; icon: React.ReactNode }[] = [
    { id: 'countries', label: 'Countries', icon: <Globe className="h-4 w-4" /> },
    { id: 'regions', label: 'Regions', icon: <Map className="h-4 w-4" /> },
    { id: 'cities', label: 'Cities', icon: <Building2 className="h-4 w-4" /> },
  ]

  return (
    <>
      <header className="flex items-center justify-between border-b border-border bg-card px-6 py-3">
        {/* Logo */}
        <div className="flex items-center gap-2">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary">
            <Globe className="h-5 w-5 text-primary-foreground" />
          </div>
          <span className="text-lg font-semibold text-foreground">TravelMap</span>
        </div>

        {/* Tabs */}
        <nav className="flex items-center">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              className={`
                relative flex items-center gap-2 px-5 py-2 text-sm font-medium transition-all
                ${activeTab === tab.id
                  ? 'rounded-t-lg bg-background text-foreground shadow-sm'
                  : 'text-muted-foreground hover:text-foreground'
                }
              `}
              style={{
                marginBottom: activeTab === tab.id ? '-1px' : '0',
                borderBottom: activeTab === tab.id ? '1px solid var(--background)' : 'none',
              }}
            >
              {tab.icon}
              {tab.label}
            </button>
          ))}
        </nav>

        {/* Right icons */}
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setUpgradeOpen(true)}
            className="gap-2 text-primary hover:text-primary"
          >
            <Crown className="h-4 w-4" />
            <span className="hidden sm:inline">Upgrade</span>
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setSettingsOpen(true)}
            className="text-muted-foreground hover:text-foreground"
          >
            <Settings className="h-5 w-5" />
            <span className="sr-only">Settings</span>
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setAccountOpen(true)}
            className="text-muted-foreground hover:text-foreground"
          >
            <User className="h-5 w-5" />
            <span className="sr-only">Account</span>
          </Button>
        </div>
      </header>

      {/* Upgrade Dialog */}
      <Dialog open={upgradeOpen} onOpenChange={setUpgradeOpen}>
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

      {/* Settings Dialog */}
      <Dialog open={settingsOpen} onOpenChange={setSettingsOpen}>
        <DialogContent className="bg-card text-card-foreground">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Settings className="h-5 w-5" />
              Settings
            </DialogTitle>
            <DialogDescription className="text-muted-foreground">
              Manage your application preferences
            </DialogDescription>
          </DialogHeader>
          <FieldGroup>
            <Field>
              <FieldLabel>Theme</FieldLabel>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" disabled>Dark</Button>
                <Button variant="ghost" size="sm" disabled>Light</Button>
              </div>
            </Field>
            <Field>
              <FieldLabel>Language</FieldLabel>
              <Button variant="outline" size="sm" disabled>English</Button>
            </Field>
          </FieldGroup>
          <p className="mt-4 text-xs text-muted-foreground">
            More settings coming in the full version.
          </p>
        </DialogContent>
      </Dialog>

      {/* Account Dialog */}
      <Dialog open={accountOpen} onOpenChange={setAccountOpen}>
        <DialogContent className="bg-card text-card-foreground">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <User className="h-5 w-5" />
              Account
            </DialogTitle>
            <DialogDescription className="text-muted-foreground">
              Sign in to sync your memories across devices
            </DialogDescription>
          </DialogHeader>
          <FieldGroup className="py-4">
            <Field>
              <FieldLabel>Email</FieldLabel>
              <Input type="email" placeholder="your@email.com" disabled />
            </Field>
            <Field>
              <FieldLabel>Password</FieldLabel>
              <Input type="password" placeholder="Password" disabled />
            </Field>
          </FieldGroup>
          <Button className="w-full" disabled>
            Sign In (Coming Soon)
          </Button>
          <p className="mt-2 text-center text-xs text-muted-foreground">
            Account features coming in the full version.
          </p>
        </DialogContent>
      </Dialog>
    </>
  )
}
