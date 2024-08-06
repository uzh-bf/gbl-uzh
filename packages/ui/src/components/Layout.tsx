import StorageOverview from './StorageOverview'
import PlayerDisplay from './PlayerDisplay'
import NavBar from './NavBar'

interface Props {
  children: React.ReactNode
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
  storageInfo: {
    storageTotal: number
    storageUsed: number
    imgPathEmpty: string
    imgPathFull: string
  }
}

function Layout({ children, tabs, playerInfo, storageInfo }: Props) {
  return (
    <>
      <NavBar
        tabs={tabs}
        playerName={playerInfo.name}
        playerLevel={playerInfo.level}
      />
      <div className="flex w-full justify-between gap-x-4 p-4">
        {children}
        <div id="sidebar" className="flex w-60 flex-col">
          <PlayerDisplay {...playerInfo} />
          <StorageOverview {...storageInfo} />
        </div>
      </div>
    </>
  )
}

export default Layout
