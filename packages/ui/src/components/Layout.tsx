import { NavBar } from './NavBar'
import React from 'react'

interface LayoutPlayerInfo {
  name: string
  color: string
  level: number
  imgPathAvatar?: string
}

interface Props {
  tabs: { name: string; href: string }[]
  playerInfo: LayoutPlayerInfo
  children?: React.ReactNode
  sidebar?: React.ReactNode
}

function Layout({ children, tabs, playerInfo, sidebar }: Props) {
  return (
    <>
      <NavBar
        tabs={tabs}
        playerName={playerInfo.name}
        playerLevel={playerInfo.level}
        playerImgPathAvatar={playerInfo.imgPathAvatar}
        playerColor={playerInfo.color}
      />
      <div className="flex w-full justify-between gap-x-4 p-4">
        {children}
        <div>{sidebar}</div>
      </div>
    </>
  )
}

export { Layout }
