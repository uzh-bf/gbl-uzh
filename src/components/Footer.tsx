function Footer() {
  return (
    <footer className="flex-initial p-4 text-sm text-gray-600 bg-gray-100 border-top md:text-base">
      <div className="mb-1 font-bold">GBL @ DBF</div>
      <div className="mb-1">
        &copy; {new Date().getFullYear()} Department of Banking and Finance,
        University of Zurich
      </div>
      <div>Created with &#9825; in Bärn</div>
    </footer>
  )
}

export default Footer
