function Footer() {
  return (
    <footer className="flex flex-col justify-between flex-initial p-4 text-sm text-gray-600 border-t-2 border-uzh-red-100 md:flex-row border-top md:text-base">
      <div className="flex flex-row items-center">
        <div className="w-full md:w-40 md:mr-8">
          <img width="100%" src="images/logo_uzh.jpeg" />
        </div>
        <div className="w-full md:w-40">
          <img width="100%" src="images/logo_swissuniversities.png" />
        </div>
      </div>

      <div>
        <div className="mb-1 font-bold">GBL @ DBF</div>
        <div className="mb-1">
          &copy; {new Date().getFullYear()} Department of Banking and Finance,
          University of Zurich
        </div>
        <div>Created with &#9825; in Bärn</div>
      </div>
    </footer>
  )
}

export default Footer
