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
      style={{ transition: 'border-bottom 200ms ease-in-out' }}
      className={twMerge(
        'flex-1 border-l-4 border-transparent px-4 py-2 text-left text-sm font-semibold hover:cursor-pointer hover:border-black md:mx-4 md:flex-initial md:border-b-4 md:border-l-0 md:px-0 md:py-5',
        isActive && 'border-primary'
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
    <Link
      href="/"
      className="flex flex-col items-center justify-center md:flex-row"
    >
      <div className="relative h-20 w-56">
        <Image
          src={LogoImage}
          alt="Logo"
          fill
          priority
          className="object-contain pl-4"
        />
      </div>
      <div className="flex h-16 flex-col justify-center md:ml-6 md:border-l-[1px] md:border-neutral-900/10">
        <h1 className="text-lg font-semibold hover:text-neutral-500 md:pl-8">
          Game-Based Learning
        </h1>
      </div>
    </Link>
  )
}

function PageHead() {
  const [isOpen, setOpen] = useState(false)

  return (
    <header className="m-auto flex max-w-6xl flex-col justify-between pt-4">
      <div className="flex flex-row justify-between md:items-stretch">
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
