import Head from 'next/head'
import { twMerge } from 'tailwind-merge'
import Footer from './Footer'
import PageHead from './PageHead'

interface Props {
  title: string
  withFooter?: boolean
  children: React.ReactNode
  className?: string
}

const defaultProps = {
  withFooter: true,
}

function PageWithHeader({ className, title, children, withFooter }: Props) {
  return (
    <div className={twMerge('flex flex-col h-full', className)}>
      <Head>
        <title>{`GBL@UZH - ${title}`}</title>
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
