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
    <div className={twMerge('flex h-full flex-col', className)}>
      <Head>
        <title>{`GBL@UZH - ${title}`}</title>
      </Head>
      <div className="w-full flex-1">
        <PageHead />
        <div className="h-full">{children}</div>
        {/* <div className="h-full">{children}</div> */}
      </div>
      {withFooter && <Footer />}
    </div>
  )
}

PageWithHeader.defaultProps = defaultProps

export default PageWithHeader
