import { ImageLoaderProps } from "next/legacy/image";

function loader({ src, width }: ImageLoaderProps): string {
  return src

  // TODO: fix loader

  const sizes = [32, 64, 128, 256, 384, 640, 828, 1200, 1920, 3840].reverse()

  const pathSegments = src.split('/')
  const basePath = pathSegments.slice(0, -1).join('/')
  const fileName = pathSegments.slice(-1).join('')

  if (fileName.includes('.svg')) {
    return src
  }

  // check whether there is a compatible responsive version of the image
  // if so, return the responsive variant as a new source
  let matchingImagePath = src
  sizes.forEach((size) => {
    if (width <= size) {
      matchingImagePath = `${basePath}/responsive_${size}/${fileName}`
    }
  })

  // fallback to the original image source
  return matchingImagePath
}

export default loader
