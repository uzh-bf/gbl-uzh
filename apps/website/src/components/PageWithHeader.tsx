import Head from 'next/head'
import Footer from './Footer'
import PageHead from './PageHead'

interface Props {
  title: string
  withFooter?: boolean
  children: React.ReactNode
}

const defaultProps = {
  withFooter: true,
}

function PageWithHeader({ title, children, withFooter }: Props) {
  return (
    <div className="flex flex-col h-full">
      <Head>
        <title>GBL@UZH - {title}</title>
      </Head>
      <div className="flex-1 w-full">
        <PageHead />
        <div className="h-full md:border-t-2 border-uzh-red-100">
          {children}
        </div>
        {/* <div className="h-full">{children}</div> */}
      </div>
      {withFooter && <Footer />}
    </div>
  )
}

PageWithHeader.defaultProps = defaultProps

export default PageWithHeader
