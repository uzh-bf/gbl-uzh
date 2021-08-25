import type { ImageLoaderProps } from 'next/image'

function loader(props: ImageLoaderProps): string {
  // console.log(props)
  return props.src
}

export default loader
