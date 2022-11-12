import { twMerge } from 'tailwind-merge'
import { StaticImageData } from 'next/image'
import Link from 'next/link'
import { Button } from '@uzh-bf/design-system'
import Card from './Card'
import Header from './Header'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faArrowRight } from '@fortawesome/free-solid-svg-icons'

interface Props {
  className?: string
  imgSrc: StaticImageData
  title: string
  description: string
  roadmapHref?: string
}

function FocusArea({
  className,
  imgSrc,
  title,
  description,
  roadmapHref,
}: Props) {
  return (
    <div
      className={twMerge(
        'flex flex-col md:flex-row items-center md:items-center',
        className
      )}
    >
      <div className="flex-1 md:flex-initial md:w-36">
        <Card
          colored
          className="p-4 w-36"
          imgSrc={imgSrc}
          minHeight="min-h-[100px]"
        />
      </div>

      <div className="mt-4 mb-0 md:mt-0 md:pl-4">
        <Header.H3>{title}</Header.H3>
        <p className="flex-1 prose max-w-none">{description}</p>
        {roadmapHref && (
          <div className="mt-2">
            <Link href={roadmapHref} passHref>
              <a target="_blank">
                <Button className="text-xs">
                  <Button.Icon>
                    <FontAwesomeIcon icon={faArrowRight} />
                  </Button.Icon>
                  <div className="ml-2">Detailed Roadmap</div>
                </Button>
              </a>
            </Link>
          </div>
        )}
      </div>
    </div>
  )
}

FocusArea.defaultProps = {
  className: undefined,
  roadmapHref: undefined,
}

export default FocusArea
