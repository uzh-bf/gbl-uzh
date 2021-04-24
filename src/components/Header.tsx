import Link from 'next/link'

function NavigationItem({ children, href }): ReactElement {
  return (
    <div className="flex-1 p-1 mb-1 text-center shadow md:flex-initial md:mb-0 md:mr-2 md:p-2 md:last:mr-0 last:mb-0">
      <Link href={href}>{children}</Link>
    </div>
  )
}

function Navigation() {
  return (
    <nav className="flex flex-col md:flex-row">
      <NavigationItem href="/">Home</NavigationItem>
      <NavigationItem href="kb">Knowledge Base</NavigationItem>
      <NavigationItem href="dbf">GBL @ IBF</NavigationItem>
      <NavigationItem href="dev">Development Workflow</NavigationItem>
      <NavigationItem href="roadmap">Roadmap</NavigationItem>
      <NavigationItem href="resources">Resources</NavigationItem>
      <NavigationItem href="about">About Us</NavigationItem>
    </nav>
  )
}

function Header() {
  return (
    <header className="flex flex-col justify-between border-blue-700 md:border-b-8 md:items-end md:flex-row">
      <div className="flex-1 mb-4 md:flex-initial md:mb-0">
        <Link href="/">
          <img
            className="m-auto cursor-pointer md:m-0"
            width="150"
            height="75"
            src="https://place-hold.it/150x75/D3D3D3?text=GBL @ UZH"
            alt=""
          />
        </Link>
      </div>
      <div className="flex-initial border-l-8 border-blue-700 md:border-none">
        <Navigation />
      </div>
    </header>
  )
}

export default Header
