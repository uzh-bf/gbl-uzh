import Head from 'next/head'
import Footer from './Footer'
import Header from './Header'

function PageWithHeader({ title, children }) {
  return (
    <div className="flex flex-col h-full ">
      <Head>
        <title>GBL@DBF - {title}</title>
      </Head>
      <div className="flex-1 w-full max-w-6xl p-4 m-auto">
        <Header />
        <div className="py-4 md:py-8">{children}</div>
      </div>
      <Footer />
    </div>
  )
}

export default PageWithHeader
