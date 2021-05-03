import clsx from 'clsx'
import Link from 'next/link'
import { useRouter } from 'next/router'

const NAVIGATION_ITEMS = [
  { href: '/', label: 'Home' },
  { href: '/kb', label: 'Knowledge Base' },
  { href: '/dbf', label: 'GBL @ DBF' },
  { href: '/dev', label: 'Development Workflow' },
  { href: '/roadmap', label: 'Roadmap' },
  { href: '/resources', label: 'Resources' },
  { href: '/about', label: 'About Us' },
]

interface NavigationItemProps {
  isActive?: boolean
  href: string
  children: React.ReactNode
}

function NavigationItem({ isActive, children, href }: NavigationItemProps) {
  return (
    <div
      className={clsx(
        'flex-1 p-1 mb-1 text-center text-sm text-gray-500 hover:text-uzh-blue-80 md:flex-initial md:mb-0 md:mr-2 md:p-2 md:last:mr-0 last:mb-0 border-b-2 md:border-b-0 md:border-t-4',
        isActive && 'border-uzh-red-100'
      )}
    >
      <Link href={href}>{children}</Link>
    </div>
  )
}

NavigationItem.defaultProps = {
  isActive: false,
}

function Navigation() {
  const router = useRouter()

  return (
    <nav className="flex flex-col order-1 md:order-2 md:flex-row">
      {NAVIGATION_ITEMS.map(({ href, label }) => (
        <NavigationItem isActive={router.pathname === href} href={href}>
          {label}
        </NavigationItem>
      ))}
    </nav>
  )
}

function Breadcrumbs() {
  const router = useRouter()

  return (
    <div className="flex-initial order-2 mt-4 text-sm text-gray-500 md:mt-0 md:order-1">
      Location: {router.pathname}
    </div>
  )
}

function Logo() {
  return (
    <div className="flex-1 mb-4 md:flex-initial md:mb-0">
      <Link href="/">
        <img
          className="m-auto cursor-pointer md:m-0"
          width="150"
          height="75"
          src="https://place-hold.it/150x75/D3D3D3?text=GBL @ DBF"
          alt=""
        />
      </Link>
    </div>
  )
}

function PageHead() {
  return (
    <header className="flex flex-col justify-between max-w-6xl pt-4 m-auto md:flex-row">
      <Logo />
      <div className="flex flex-col justify-between flex-initial md:items-end md:border-none">
        <Breadcrumbs />
        <Navigation />
      </div>
    </header>
  )
}

export default PageHead
