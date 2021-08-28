import type { ImageLoaderProps } from 'next/image'

function loader(props: ImageLoaderProps): string {
  const newWidths = ['100', '300', '600', '1000']
  const path = props.src.split('/')
  path.shift()
  path.shift()
  const slug = '/' + path.join('/')

  newWidths.forEach((width) => {
    if (props.width < parseInt(width)) {
      return '/images/newWidth' + width + slug
    }
  })
  return props.src
}

export default loader
