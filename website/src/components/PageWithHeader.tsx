import Head from 'next/head'
import Footer from './Footer'
import PageHead from './PageHead'

interface Props {
  title: string
  children: React.ReactNode
}

function PageWithHeader({ title, children }: Props) {
  return (
    <div className="flex flex-col h-full ">
      <Head>
        <title>GBL@DBF - {title}</title>
      </Head>
      <div className="flex-1 w-full">
        <PageHead />
        <div className="h-full md:border-t-2 border-uzh-red-100">
          {children}
        </div>
        {/* <div className="h-full">{children}</div> */}
      </div>
      <Footer />
    </div>
  )
}

export default PageWithHeader
