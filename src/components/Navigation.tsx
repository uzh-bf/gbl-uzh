function NavigationItem({ children }): ReactElement {
  return (
    <div className="flex-1 p-1 mb-1 text-center shadow md:flex-initial md:mb-0 md:mr-2 md:p-2 md:last:mr-0 last:mb-0">
      {children}
    </div>
  )
}

function Navigation() {
  return (
    <div className="flex flex-col md:flex-row">
      <NavigationItem>Knowledge Base</NavigationItem>
      <NavigationItem>GBL @ IBF</NavigationItem>
      <NavigationItem>Development Workflow</NavigationItem>
      <NavigationItem>Roadmap</NavigationItem>
      <NavigationItem>Resources</NavigationItem>
      <NavigationItem>About Us</NavigationItem>
    </div>
  )
}

export default Navigation
