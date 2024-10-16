import { faBook, faCode, faMailBulk } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import Image from 'next/image'
import Link from 'next/link'
import SwissUniLogo from '../../public/images/logo_swissuniversities.png'
import UZHLogo from '../../public/images/uzh_logo_d_pos.svg'
import GBLLogo from '../../public/images/GBLUZH.png'
function Footer() {
  return (
    <footer className="border-top mt-8 bg-slate-100 text-sm text-gray-600 md:text-base">
      <div className="m-auto flex max-w-6xl flex-initial flex-col justify-between px-4 py-8 md:flex-row md:px-8 md:py-16">
        <div className="order-1 mb-4 flex flex-wrap items-center justify-center gap-2 md:order-2 md:mb-0 md:w-1/3 md:justify-end md:gap-4">
          <a href="/" target="_blank" rel="noreferrer">
            <div className="relative h-20 w-40 rounded bg-white hover:outline">
              <Image
                src={GBLLogo}
                alt="UZH GBL Logo"
                fill
                className="object-contain p-4"
              />
            </div>
          </a>
          <a href="https://www.uzh.ch" target="_blank" rel="noreferrer">
            <div className="relative h-20 w-40 rounded bg-white hover:outline">
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
            <div className="relative h-20 w-40 rounded bg-white hover:outline">
              <Image
                src={SwissUniLogo}
                alt="Swissuniversities Logo"
                fill
                className="object-contain p-4"
              />
            </div>
          </a>
        </div>

        <div className="prose prose-sm order-2 space-y-4 text-gray-600 md:order-1">
          <div className="flex flex-row gap-4">
            <FontAwesomeIcon
              icon={faBook}
              className="hidden w-6 pt-[0.375rem] text-gray-500 md:block"
            />
            <div className="flex-1">
              <div className="font-bold">GBL @ UZH</div>
              <div>
                <a
                  href="https://www.bf.uzh.ch"
                  target="_blank"
                  rel="noreferrer"
                >
                  Department of Finance
                </a>
                , Universität Zürich
              </div>
            </div>
          </div>

          <div className="flex flex-row gap-4">
            <FontAwesomeIcon
              icon={faCode}
              className="hidden w-6 pt-[0.375rem] text-gray-500 md:block"
            />
            <div className="flex-1">
              The GBL Website and Knowledge Base are being developed in public.
              Have a look at our source code on{' '}
              <Link href="https://github.com/uzh-bf/gbl-uzh" target="_blank">
                Github
              </Link>
              .
            </div>
          </div>

          <div className="flex flex-row gap-4">
            <FontAwesomeIcon
              icon={faMailBulk}
              className="hidden w-6 pt-[0.375rem] text-gray-500 md:block"
            />
            <div className="flex-1">
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
