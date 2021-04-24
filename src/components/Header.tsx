import clsx from 'clsx'
import Link from 'next/link'
import { useRouter } from 'next/router'

interface NavigationItemProps {
  isActive?: boolean
  href: string
  children: React.ReactNode
}

function NavigationItem({ isActive, children, href }: NavigationItemProps) {
  return (
    <div
      className={clsx(
        'flex-1 p-1 mb-1 text-center md:shadow text-gray-700 md:flex-initial md:mb-0 md:mr-2 md:p-2 md:last:mr-0 last:mb-0 border-b-2 md:border-b-0 md:border-t-2',
        isActive && 'border-blue-900 '
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

  const items = [
    { href: '/', label: 'Home' },
    { href: '/kb', label: 'Knowledge Base' },
    { href: '/dbf', label: 'GBL @ DBF' },
    { href: '/dev', label: 'Development Workflow' },
    { href: '/roadmap', label: 'Roadmap' },
    { href: '/resources', label: 'Resources' },
    { href: '/about', label: 'About Us' },
  ]

  return (
    <nav className="flex flex-col md:flex-row">
      {items.map(({ href, label }) => (
        <NavigationItem isActive={router.pathname === href} href={href}>
          {label}
        </NavigationItem>
      ))}
    </nav>
  )
}

function Header() {
  return (
    <header className="flex flex-col justify-between border-blue-900 md:border-b-8 md:items-end md:flex-row">
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
      <div className="flex-initial border-l-4 border-blue-900 md:border-none">
        <Navigation />
      </div>
    </header>
  )
}

export default Header
