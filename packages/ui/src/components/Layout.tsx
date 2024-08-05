import StorageOverview from './StorageOverview'
import PlayerDisplay from './PlayerDisplay'
import NavBar from './NavBar'

interface Props {
  children: React.ReactNode
}

function Layout({ children }: Props) {
  return (
    <>
      <NavBar
        tabs={[
          { name: 'Cockpit', href: '/play/cockpit' },
          { name: 'Cockpit', href: '/play/cockpit' },
        ]}
        playerName={'Team1'}
        playerLevel={2}
      />
      <div className="flex w-full justify-between gap-x-4 p-4">
        {children}
        <div id="sidebar" className="flex w-60 flex-col">
          <PlayerDisplay
            name="playerName"
            imgPathAvatar="/avatars/avatar_placeholder.png"
            color="Red"
            achievements={[]}
            imgPathLocation="/locations/ZH.svg"
            location="ZH"
            xp={20}
            xpMax={50}
            level={1}
            onClick={() => {}}
          />
          <StorageOverview
            storageTotal={3}
            storageUsed={1}
            imgPathEmpty="/avatars/cocoa_0.png"
            imgPathFull="/avatars/cocoa_3.png"
          />
        </div>
      </div>
    </>
  )
}

export default Layout
