import clsx from 'clsx'

interface Props {
  label: string
  className?: string
}

function Tag({ label, className }: Props) {
  return (
    <div
      className={clsx('px-2 mr-1 text-sm bg-white border rounded', className)}
    >
      {label}
    </div>
  )
}

Tag.defaultProps = {
  className: undefined,
}

export default Tag
