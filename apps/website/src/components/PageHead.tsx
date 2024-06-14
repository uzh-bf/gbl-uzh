import { faBars } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { Button } from '@uzh-bf/design-system'
import Image from 'next/image'
import Link from 'next/link'
import { useRouter } from 'next/router'
import React, { useState } from 'react'
import { twMerge } from 'tailwind-merge'
import LogoImage from '../../public/images/uzh_logo_d_pos.svg'

const NAVIGATION_ITEMS = [
  { href: '/games', label: 'Games & Courses' },
  { href: '/use-cases', label: 'Use Cases' },
  { href: '/escape', label: 'EscapeUZH' },
  { href: '/dev', label: 'Development' },
  { href: '/kb', label: 'Knowledge Base' },
  // { href: '/resources', label: 'Resources' },
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
        'mb-1 ml-3 mr-3 flex-1 border-b-2 p-1 text-left text-sm text-gray-500 last:mb-0 hover:cursor-pointer hover:border-uzh-blue-40 hover:text-uzh-blue-80 md:mb-0 md:ml-0 md:mr-2 md:flex-initial md:border-b-0 md:border-t-4 md:p-2 md:last:mr-0',
        isActive && 'border-uzh-red-100 text-gray-800'
      )}
    >
      {children as any}
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
    <nav className="order-1 flex flex-col pb-4 md:hidden">
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
      <nav className="order-1 mt-8 hidden flex-col md:order-2 md:flex md:flex-row">
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
    <Link href="/" className="flex items-center justify-center">
      <div className="relative h-20 w-56 ">
        <Image
          src={LogoImage}
          alt="Logo"
          fill
          priority
          className="object-contain p-2"
        />
      </div>
      <div className="flex h-16 flex-col justify-center border-l-[1px] border-neutral-900/10">
        <h1 className="pl-2 text-xl">Game-Based Learning</h1>
      </div>
    </Link>
  )
}

function PageHead() {
  const [isOpen, setOpen] = useState(false)

  return (
    <header className="m-auto flex max-w-6xl flex-col justify-between pt-1 md:flex-row md:items-end">
      <div className="flex flex-row items-end justify-between md:items-stretch">
        <div className="flex-initial">
          <Logo />
        </div>

        <div className="pb-4 pr-6">
          <Button
            basic
            className={{
              root: twMerge('text-xl md:hidden', isOpen && 'text-uzh-red-100'),
            }}
            onClick={() => setOpen(!isOpen)}
          >
            <Button.Icon>
              <FontAwesomeIcon icon={faBars} />
            </Button.Icon>
          </Button>
        </div>
      </div>
      <div className="">
        <Navigation isOpen={isOpen} />
      </div>
    </header>
  )
}

export default PageHead
