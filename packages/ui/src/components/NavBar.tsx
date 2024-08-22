import Link from 'next/link'
import { Logo } from './Logo'
import {
  NavigationMenu,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  navigationMenuTriggerStyle,
} from '@uzh-bf/design-system/dist/future'

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
      <nav className="flex w-full items-center justify-between border-b px-4">
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
            <div className="m-2 flex flex-col text-right text-sm">
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
