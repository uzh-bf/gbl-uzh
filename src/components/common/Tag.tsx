interface Props {
  label: string
}

function Tag({ label }: Props) {
  return (
    <div className="px-2 mb-1 mr-1 text-sm bg-white border rounded">
      {label}
    </div>
  )
}

export default Tag
