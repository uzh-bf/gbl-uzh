import { faArrowRight } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { Button, H3, Prose } from '@uzh-bf/design-system'
import { StaticImageData } from 'next/legacy/image'
import Link from 'next/link'
import { twMerge } from 'tailwind-merge'
import Card from './Card'

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
        'flex flex-col items-center md:flex-row md:items-center',
        className
      )}
    >
      <div className="flex-1 md:w-36 md:flex-initial">
        <Card
          colored
          className="w-36 p-4"
          imgSrc={imgSrc}
          minHeight="min-h-[100px]"
        />
      </div>

      <div className="mb-0 mt-4 md:mt-0 md:pl-4">
        <H3>{title}</H3>
        <Prose>{description}</Prose>
        {roadmapHref && (
          <div className="mt-2">
            <Link href={roadmapHref} passHref target="_blank">
              <Button className={{ root: 'text-xs' }}>
                <Button.Icon>
                  <FontAwesomeIcon icon={faArrowRight} />
                </Button.Icon>
                <Button.Label>Detailed Roadmap</Button.Label>
              </Button>
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
