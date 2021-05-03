function Footer() {
  return (
    <footer className="z-10 flex flex-col justify-between flex-initial p-4 text-sm text-gray-600 bg-white border-t-2 border-uzh-red-100 md:flex-row border-top md:text-base">
      <div className="flex flex-col items-center order-1 mb-4 md:order-2 md:flex-row md:mb-0">
        <div className="w-40 mb-4 md:mb-0 md:mr-8">
          <img width="100%" src="images/logo_uzh.jpeg" alt="UZH Logo" />
        </div>
        <div className="w-40">
          <img
            width="100%"
            src="images/logo_swissuniversities.png"
            alt="Swissuniversities Logo"
          />
        </div>
      </div>

      <p className="order-2 prose-sm prose text-center text-gray-600 md:order-1 md:text-left">
        <span className="font-bold">GBL @ DBF</span>
        <br />
        &copy; {new Date().getFullYear()} Department of Banking and Finance,
        University of Zurich
        <br />
        Created with &#9825; in Bärn
      </p>
    </footer>
  )
}

export default Footer
