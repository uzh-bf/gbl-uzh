import { MenuIcon } from '@heroicons/react/solid'
import clsx from 'clsx'
import Image from 'next/image'
import Link from 'next/link'
import { useRouter } from 'next/router'
import React, { useState } from 'react'
import LogoImage from '../../public/images/logo_temp_beta.jpg'
import customLoader from '../lib/loader'

const NAVIGATION_ITEMS = [
  { href: '/games', label: 'GBL in Use' },
  { href: '/kb', label: 'Knowledge Base' },
  { href: '/dev', label: 'Development' },
  { href: '/roadmap', label: 'Roadmap' },
  // { href: '/resources', label: 'Resources' },
  { href: '/about', label: 'About Us' },
]

interface NavigationItemProps {
  isActive?: boolean
  href: string
  children: React.ReactNode
}

function NavigationItem({ isActive, children, href }: NavigationItemProps) {
  return (
    <Link href={href}>
      <div
        className={clsx(
          'flex-1 p-1 mb-1 ml-3 mr-3 text-left text-sm text-gray-500 hover:text-uzh-blue-80 hover:cursor-pointer md:flex-initial md:ml-0 md:mb-0 md:mr-2 md:p-2 md:last:mr-0 last:mb-0 border-b-2 md:border-b-0 md:border-t-4',
          isActive && 'border-uzh-red-100 text-gray-800 font-bold'
        )}
      >
        {children}
      </div>
    </Link>
  )
}

NavigationItem.defaultProps = {
  isActive: false,
}

interface NavigationProps {
  isOpen: boolean
}
function Navigation({ isOpen }: NavigationProps) {
  const router = useRouter()

  const mobileMenu = (
    <nav className="flex flex-col order-1 mt-8 md:hidden">
      <NavigationItem isActive={router.pathname === '/'} href="/">
        Home
      </NavigationItem>
      {NAVIGATION_ITEMS.map(({ href, label }) => (
        <NavigationItem
          key={href}
          isActive={router.pathname.includes(href)}
          href={href}
        >
          {label}
        </NavigationItem>
      ))}
    </nav>
  )

  const mobileMenuDrawer = (isOpen: boolean) => {
    if (isOpen) {
      return mobileMenu
    } else {
      return <></>
    }
  }

  return (
    <>
      {/* Menu for medium / large screens */}
      <nav className="flex-col order-1 hidden mt-8 md:order-2 md:flex-row md:flex">
        <NavigationItem isActive={router.pathname === '/'} href="/">
          Home
        </NavigationItem>
        {NAVIGATION_ITEMS.map(({ href, label }) => (
          <NavigationItem
            key={href}
            isActive={router.pathname.includes(href)}
            href={href}
          >
            {label}
          </NavigationItem>
        ))}
      </nav>

      {/* Menu for mobile device screens */}
      {mobileMenuDrawer(isOpen)}
    </>
  )
}

Navigation.defaultProps = {
  isOpen: false,
}

function Breadcrumbs() {
  const router = useRouter()

  return (
    <div className="flex-initial order-2 mt-4 mb-4 ml-8 text-sm text-gray-500 md:mb-0 md:mt-0 md:order-1">
      Location: {router.pathname}
    </div>
  )
}

function Logo() {
  return (
    <Link href="/" passHref>
      <a className="flex-1 md:pl-8">
        <div className="relative w-full h-16 md:w-40 md:h-full">
          <Image
            loader={customLoader}
            src={LogoImage}
            alt="Logo"
            layout="fill"
            objectFit="contain"
            priority
          />
        </div>
      </a>
    </Link>
  )
}

function PageHead() {
  const [isOpen, setOpen] = useState(false)

  return (
    <header className="flex flex-col justify-between max-w-6xl pt-4 m-auto md:flex-row">
      <div className="relative flex items-center md:items-stretch">
        <Logo />
        <MenuIcon
          className="absolute right-0 w-10 mr-4 hover:cursor-pointer md:hidden"
          onClick={() => setOpen(!isOpen)}
        />
      </div>
      <div className="flex flex-col justify-between flex-initial md:items-end md:border-none md:pr-8">
        <Breadcrumbs />
        <Navigation isOpen={isOpen} />
      </div>
    </header>
  )
}

export default PageHead
