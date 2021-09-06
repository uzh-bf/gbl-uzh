import Image from 'next/image'
import Link from 'next/link'
import SwissUniLogo from '../../public/images/logo_swissuniversities.png'
import UZHLogo from '../../public/images/logo_uzh.jpeg'
import customLoader from '../lib/loader'
function Footer() {
  return (
    <footer className="z-10 mt-8 text-sm text-gray-600 border-t-2 bg-uzh-gray-20 border-uzh-red-100 border-top md:text-base">
      <div className="flex flex-col justify-between flex-initial max-w-6xl px-4 py-16 m-auto md:px-8 md:flex-row">
        <div className="flex flex-col items-center order-1 mb-4 md:order-2 md:flex-row md:mb-0">
          <div className="relative w-40 h-20 p-4 mb-3 bg-white border md:mb-0 md:mr-8">
            <Image
              placeholder="blur"
              loader={customLoader}
              layout="responsive"
              src={UZHLogo}
              alt="UZH Logo"
            />
          </div>
          <div className="flex items-center w-40 h-20 p-4 bg-white border">
            <div className="relative w-full">
              <Image
                placeholder="blur"
                loader={customLoader}
                layout="responsive"
                src={SwissUniLogo}
                alt="Swissuniversities Logo"
              />
            </div>
          </div>
        </div>

        <p className="order-2 text-center text-gray-600 md:order-1 md:text-left">
          <span className="font-bold">GBL @ DBF</span>
          <br />
          &copy; {new Date().getFullYear()} Department of Banking and Finance,
          University of Zurich
          <br />
          <Link href="/about" passHref>
            <div className="no-underline text-uzh-red-100">Contact Us</div>
          </Link>
        </p>
      </div>
    </footer>
  )
}

export default Footer
