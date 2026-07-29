import { Switch } from '@uzh-bf/design-system'
import React from 'react'
import { Card, CardContent } from '~/components/ui/card'
import { CycleCountdown } from './CycleCountDown'
import { PlayerDisplay, PlayerDisplayProps } from './PlayerDisplay'

export interface GameSidebarProps {
  playerInfo: PlayerDisplayProps
  readySwitch?: {
    checked: boolean
    label?: string
    disabled?: boolean
    onCheckedChange: (checked: boolean) => void
  }
  countdown?: {
    expiresAt: Date
    totalDuration: number // in seconds
    onUpdate?: (secondsLeft: number) => void
    onExpire?: () => void
  }
  children?: React.ReactNode
  className?: string
}

export const GameSidebar: React.FC<GameSidebarProps> = ({
  playerInfo,
  readySwitch,
  countdown,
  children,
  className,
}) => {
  return (
    <div className={className} id="sidebar">
      <Card className="mb-4 shadow-sm border-slate-200">
        <CardContent className="flex flex-col gap-4 p-4">
          <PlayerDisplay {...playerInfo} />
          {(readySwitch || countdown) && (
            <div className="flex items-center justify-between border-t border-slate-100 pt-3">
              {readySwitch && (
                <div data-cy="ready-switch">
                  <Switch
                    className={{
                      root: 'text-xs font-bold text-slate-600',
                    }}
                    disabled={readySwitch.disabled}
                    id="isReady"
                    checked={readySwitch.checked}
                    label={readySwitch.label ?? 'Ready?'}
                    onCheckedChange={readySwitch.onCheckedChange}
                  />
                </div>
              )}

              {countdown && (
                <CycleCountdown
                  expiresAt={countdown.expiresAt}
                  totalDuration={countdown.totalDuration}
                  onUpdate={countdown.onUpdate}
                  onExpire={countdown.onExpire}
                  className="text-xs font-bold text-slate-600"
                />
              )}
            </div>
          )}
          {children && <div className="border-t border-slate-100 pt-3">{children}</div>}
        </CardContent>
      </Card>
    </div>
  )
}
