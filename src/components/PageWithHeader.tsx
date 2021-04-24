import Header from './Header'

function PageWithHeader({ children }) {
  return (
    <div className="p-4">
      <Header />
      <div className="pt-4 md:pt-8">{children}</div>
    </div>
  )
}

export default PageWithHeader
