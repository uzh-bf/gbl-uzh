import { faBook, faCode, faMailBulk } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import Image from 'next/image'
import Link from 'next/link'
import SwissUniLogo from '../../public/images/logo_swissuniversities.png'
import UZHLogo from '../../public/images/logo_uzh.jpeg'
function Footer() {
  return (
    <footer className="z-10 mt-8 text-sm text-gray-600 border-t-2 bg-uzh-grey-20 border-uzh-red-100 border-top md:text-base">
      <div className="flex flex-col justify-between flex-initial max-w-6xl px-4 py-8 m-auto md:py-16 md:px-8 md:flex-row">
        <div className="flex flex-row items-center self-center order-1 gap-2 mb-4 md:gap-4 md:order-2 md:mb-0">
          <a href="https://www.uzh.ch" target="_blank" rel="noreferrer">
            <div className="relative w-40 h-20 bg-white rounded hover:outline">
              <Image
                src={UZHLogo}
                alt="UZH Logo"
                fill
                className="object-contain p-4"
              />
            </div>
          </a>
          <a
            href="https://www.swissuniversities.ch"
            target="_blank"
            rel="noreferrer"
          >
            <div className="relative w-40 h-20 bg-white rounded hover:outline">
              <Image
                src={SwissUniLogo}
                alt="Swissuniversities Logo"
                fill
                className="object-contain p-4"
              />
            </div>
          </a>
        </div>

        <div className="order-2 space-y-2 prose-sm prose text-center text-gray-600 md:space-y-4 md:order-1 md:text-left">
          <div className="flex flex-row items-center gap-4">
            <FontAwesomeIcon
              icon={faBook}
              className="hidden w-6 text-gray-500 md:block"
            />
            <div className="flex-1 text-center md:text-left">
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

          <div className="flex flex-row items-center gap-4">
            <FontAwesomeIcon
              icon={faCode}
              className="hidden w-6 text-gray-500 md:block"
            />
            <div className="flex-1 text-center md:text-left">
              The GBL Website and Knowledge Base are being developed in public.
              Have a look at our source code on{' '}
              <Link href="https://github.com/uzh-bf/gbl-uzh" target="_blank">
                Github
              </Link>
              .
            </div>
          </div>

          <div className="flex flex-row items-center gap-4">
            <FontAwesomeIcon
              icon={faMailBulk}
              className="hidden w-6 text-gray-500 md:block"
            />
            <div className="flex-1 text-center md:text-left">
              <Link href="/about">Contact Us</Link> or provide feedback on our{' '}
              <Link href="https://gbl-uzh.feedbear.com/roadmap" target="_blank">
                Public Roadmap
              </Link>
              .
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}

export default Footer
