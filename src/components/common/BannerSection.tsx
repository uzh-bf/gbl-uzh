function BannerSection({ children }) {
  return (
    <div className="py-4 bg-red-uzh-20 md:py-8">
      <div className="relative">
        <img src="/images/hero3.jpg" className="opacity-20" />
        <div className="absolute left-0 right-0 p-4 bottom-5 rounded-xl md:px-0 bg-opacity-40">
          <p className="max-w-3xl m-auto prose prose-lg text-center">
            {children}
          </p>
        </div>
      </div>
    </div>
  )
}

export default BannerSection
