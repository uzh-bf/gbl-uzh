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
    <div className="flex flex-col md:flex-row">
      <NavigationItem href="kb">Knowledge Base</NavigationItem>
      <NavigationItem href="dbf">GBL @ IBF</NavigationItem>
      <NavigationItem href="dev">Development Workflow</NavigationItem>
      <NavigationItem href="roadmap">Roadmap</NavigationItem>
      <NavigationItem href="resources">Resources</NavigationItem>
      <NavigationItem href="about">About Us</NavigationItem>
    </div>
  )
}

export default Navigation
