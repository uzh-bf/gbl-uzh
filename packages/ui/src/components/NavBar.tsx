import Link from 'next/link'
import { Logo } from './Logo'
import {
  NavigationMenu,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  navigationMenuTriggerStyle,
} from '@uzh-bf/design-system/ui'

interface Props {
  tabs: { name: string; href: string }[]
  playerName: string
  playerLevel: number
  playerColor?: string
  playerImgPathAvatar?: string
  playerHref?: string
}

function NavBar({
  tabs,
  playerName,
  playerLevel,
  playerColor,
  playerImgPathAvatar,
  playerHref = '/play/cockpit',
}: Props) {
  return (
    <>
      <nav className="flex items-center justify-between w-full px-4 border-b">
        <NavigationMenu>
          <NavigationMenuList>
            {tabs.map((tab, ix) => (
              <NavigationMenuItem key={ix}>
                <Link href={tab.href} legacyBehavior passHref>
                  <NavigationMenuLink className={navigationMenuTriggerStyle()}>
                    {tab.name}
                  </NavigationMenuLink>
                </Link>
              </NavigationMenuItem>
            ))}
          </NavigationMenuList>
        </NavigationMenu>
        <Link href={playerHref} legacyBehavior passHref>
          <div className="flex items-center">
            <div className="flex flex-col m-2 text-sm text-right">
              <div className="font-semibold">{playerName}</div>
              <div className="text-orange-700">Level {playerLevel}</div>
            </div>
            <div className="w-10">
              <Logo imgPathAvatar={playerImgPathAvatar} color={playerColor} />
            </div>
          </div>
        </Link>
      </nav>
    </>
  )
}

export { NavBar }
