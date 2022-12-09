import { H3, Prose } from '@uzh-bf/design-system'
import Image from 'next/image'
import customLoader from '../../lib/loader'

function Contact({ name, institution, role, link, imgSrc }: any) {
  return (
    <div className="flex flex-row">
      <div className="relative flex-initial w-40 h-48 m-auto sm:m-0">
        <Image
          className="object-cover border rounded shadow"
          placeholder="blur"
          loader={customLoader}
          fill
          src={imgSrc}
          alt="Profile Picture"
        />
      </div>
      <div className="flex-1 px-4 text-left">
        <H3>{name}</H3>
        <Prose>{role}</Prose>
        <Prose>{institution}</Prose>
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
