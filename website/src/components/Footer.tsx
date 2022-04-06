import { CodeIcon, LibraryIcon, MailIcon } from '@heroicons/react/solid'
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
          <a href="https://www.uzh.ch" target="_blank" rel="noreferrer">
            <div className="relative w-40 h-20 p-4 mb-3 bg-white border md:mb-0 md:mr-8">
              <Image
                placeholder="blur"
                loader={customLoader}
                layout="intrinsic"
                src={UZHLogo}
                alt="UZH Logo"
              />
            </div>
          </a>
          <a
            href="https://www.swissuniversities.ch"
            target="_blank"
            rel="noreferrer"
          >
            <div className="flex items-center w-40 h-20 p-4 bg-white border">
              <div className="relative w-full">
                <Image
                  placeholder="blur"
                  loader={customLoader}
                  layout="intrinsic"
                  src={SwissUniLogo}
                  alt="Swissuniversities Logo"
                />
              </div>
            </div>
          </a>
        </div>

        <p className="order-2 prose-sm prose text-center text-gray-600 md:order-1 md:text-left">
          <div className="flex flex-row items-center">
            <LibraryIcon className="w-6 text-gray-500" />
            <div className="ml-4">
              <div className="font-bold">GBL @ UZH</div>
              <div>
                <a
                  href="https://www.bf.uzh.ch"
                  target="_blank"
                  rel="noreferrer"
                >
                  Department of Banking and Finance
                </a>
                , University of Zurich
              </div>
            </div>
          </div>

          <div className="flex flex-row items-center mt-4">
            <CodeIcon className="w-6 text-gray-500" />
            <div className="ml-4">
              The GBL Website and Knowledge Base are being developed in public.
              <br />
              Have a look at our source code on{' '}
              <Link href="https://github.com/uzh-bf/gbl-uzh" passHref>
                <a target="_blank">Github</a>
              </Link>
              .
            </div>
          </div>

          <div className="flex flex-row items-center mt-4">
            <MailIcon className="w-6 text-gray-500" />
            <div className="ml-4">
              <Link href="/about" passHref>
                Contact Us
              </Link>{' '}
              or provide feedback on our{' '}
              <Link href="https://gbl-uzh.feedbear.com/roadmap" passHref>
                <a target="_blank">Public Roadmap</a>
              </Link>
              .
            </div>
          </div>
        </p>
      </div>
    </footer>
  )
}

export default Footer
