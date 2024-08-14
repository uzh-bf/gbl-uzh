import { PlayerDisplay } from './PlayerDisplay'
// import { NavBar } from './NavBar'
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
  navigationMenuTriggerStyle,
} from '@uzh-bf/design-system/dist/future'
import React from 'react'

interface Props {
  tabs: { name: string; href: string }[]
  playerInfo: {
    name: string
    color: string
    location: string
    level: number
    xp: number
    xpMax: number
    achievements: any[]
    imgPathAvatar?: string
    imgPathLocation?: string
    onClick: () => void
  }
  children?: React.ReactNode
  sidebar?: React.ReactNode
}

function Layout({ children, tabs, playerInfo, sidebar }: Props) {
  const components: { title: string; href: string; description: string }[] = [
    {
      title: 'Alert Dialog',
      href: '/docs/primitives/alert-dialog',
      description:
        'A modal dialog that interrupts the user with important content and expects a response.',
    },
    {
      title: 'Hover Card',
      href: '/docs/primitives/hover-card',
      description:
        'For sighted users to preview content available behind a link.',
    },
    {
      title: 'Progress',
      href: '/docs/primitives/progress',
      description:
        'Displays an indicator showing the completion progress of a task, typically displayed as a progress bar.',
    },
    {
      title: 'Scroll-area',
      href: '/docs/primitives/scroll-area',
      description: 'Visually or semantically separates content.',
    },
    {
      title: 'Tabs',
      href: '/docs/primitives/tabs',
      description:
        'A set of layered sections of content—known as tab panels—that are displayed one at a time.',
    },
    {
      title: 'Tooltip',
      href: '/docs/primitives/tooltip',
      description:
        'A popup that displays information related to an element when the element receives keyboard focus or the mouse hovers over it.',
    },
  ]

  return (
    <>
      {/* <NavBar
        tabs={tabs}
        playerName={playerInfo.name}
        playerLevel={playerInfo.level}
        playerImgPathAvatar={playerInfo.imgPathAvatar}
        playerColor={playerInfo.color}
      /> */}
      <NavigationMenu>
        <NavigationMenuList>
          <NavigationMenuItem>
            <NavigationMenuTrigger>Item One</NavigationMenuTrigger>
            <NavigationMenuContent>
              <NavigationMenuLink>Link</NavigationMenuLink>
            </NavigationMenuContent>
          </NavigationMenuItem>
        </NavigationMenuList>
      </NavigationMenu>

      <div className="flex w-full justify-between gap-x-4 p-4">
        {children}
        <div id="sidebar" className="flex w-60 flex-col">
          <PlayerDisplay {...playerInfo} />
          {sidebar}
        </div>
      </div>
    </>
  )
}

export { Layout }
