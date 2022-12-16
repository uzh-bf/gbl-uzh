import { faHamburger } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import Image from 'next/image'
import Link from 'next/link'
import { useRouter } from 'next/router'
import React, { useState } from 'react'
import { twMerge } from 'tailwind-merge'
import LogoImage from '../../public/images/GBLUZH.png'

const NAVIGATION_ITEMS = [
  { href: '/games', label: 'Games & Courses' },
  { href: '/use_cases', label: 'Use Cases' },
  { href: '/dev', label: 'Development' },
  { href: '/kb', label: 'Knowledge Base' },
  // { href: '/resources', label: 'Resources' },
  { href: '/roadmap', label: 'Roadmap' },
  { href: '/about', label: 'About' },
]

interface NavigationItemProps {
  isActive?: boolean
  href: string
  children: React.ReactNode
}

function NavigationItem({ isActive, children, href }: NavigationItemProps) {
  return (
    <Link
      href={href}
      className={twMerge(
        'flex-1 p-1 mb-1 ml-3 mr-3 text-left text-sm text-gray-500 hover:text-uzh-blue-80 hover:cursor-pointer md:flex-initial md:ml-0 md:mb-0 md:mr-2 md:p-2 md:last:mr-0 last:mb-0 border-b-2 md:border-b-0 md:border-t-4',
        isActive && 'border-uzh-red-100 text-gray-800 font-bold'
      )}
    >
      {children}
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

function Logo() {
  return (
    <Link href="/" passHref className="flex-1 md:pl-8">
      <div className="relative w-full h-20 md:w-56 md:h-full">
        <Image src={LogoImage} alt="Logo" fill priority />
      </div>
    </Link>
  )
}

function PageHead() {
  const [isOpen, setOpen] = useState(false)

  return (
    <header className="flex flex-col justify-between max-w-6xl pt-4 m-auto md:flex-row">
      <div className="relative flex items-center md:items-stretch">
        <Logo />
        <FontAwesomeIcon
          icon={faHamburger}
          className="absolute right-0 w-10 mr-4 hover:cursor-pointer md:hidden"
          onClick={() => setOpen(!isOpen)}
        />
      </div>
      <div className="flex flex-col justify-between flex-initial md:items-end md:border-none md:pr-8">
        <Navigation isOpen={isOpen} />
      </div>
    </header>
  )
}

export default PageHead
