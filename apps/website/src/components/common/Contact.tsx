import { H3,Prose } from '@uzh-bf/design-system'
import Image from 'next/image'

function Contact({ name, institution, role, link, imgSrc, tags }: any) {
  return (
    <div className="flex flex-row">
      <div className="relative m-auto h-48 w-40 flex-initial sm:m-0">
        <Image
          className="rounded border object-cover shadow"
          placeholder="blur"
          fill
          src={imgSrc}
          alt="Profile Picture"
        />
      </div>
      <div className="flex flex-1 flex-col justify-between px-4 text-left">
        <div className="flex flex-col">
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
        <div className="flex flex-col justify-end">
          {tags.map((tag) => (
            <div className="text-xs text-slate-700">{tag}</div>
          ))}
        </div>
      </div>
    </div>
  )
}

export default Contact
