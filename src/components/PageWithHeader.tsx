import Footer from './Footer'
import Header from './Header'

function PageWithHeader({ children }) {
  return (
    <div className="flex flex-col h-full">
      <div className="flex-1 p-4">
        <Header />
        <div className="py-4 md:py-8">{children}</div>
      </div>
      <Footer />
    </div>
  )
}

export default PageWithHeader
