import Link from 'next/link'
import Logo from './Logo'

interface Props {
  tabs: { name: string; href: string }[]
  playerName: string
  playerLevel: number
}

function NavBar({ tabs, playerName, playerLevel }: Props) {
  return (
    <>
      <nav className="flex w-full items-center justify-between border-b px-2">
        <div className="flex">
          {tabs.map((tab) => (
            <Link href={tab.href} className="m-2">
              {tab.name}
            </Link>
          ))}
        </div>
        <div className="flex items-center">
          <div className="m-2 flex flex-col text-right text-sm">
            <div className="font-semibold">{playerName}</div>
            <div className="text-orange-700">Level {playerLevel}</div>
          </div>
          <div className="w-10">
            <Logo />
          </div>
        </div>
      </nav>
    </>
  )
}

export default NavBar
