import Image from 'next/legacy/image'
import customLoader from '../../lib/loader'
import Header from './Header'

function Contact({ name, institution, role, link, imgSrc }: any) {
  return (
    <div className="flex flex-col sm:flex-row">
      <div className="relative flex-initial w-40 m-auto border sm:m-0 sm:h-48">
        <Image
          placeholder="blur"
          loader={customLoader}
          layout="responsive"
          src={imgSrc}
          alt="Profile Picture"
        />
      </div>
      <div className="flex-1 px-4 text-center sm:text-left">
        <div className="prose">
          <Header.H3>{name}</Header.H3>
        </div>
        <p className="prose-sm text-center sm:text-left sm:prose-lg ">{role}</p>
        <p className="prose-sm text-center sm:text-left sm:prose">
          {institution}
        </p>
        <a
          className="text-uzh-red-100 hover:underline"
          target="_blank"
          href={link}
          rel="noreferrer"
        >
          Profile
        </a>
      </div>
    </div>
  )
}

export default Contact
