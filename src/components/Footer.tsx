function Footer() {
  return (
    <footer className="flex flex-col justify-between flex-initial p-4 text-sm text-gray-600 bg-gray-100 md:flex-row border-top md:text-base">
      <div className="flex flex-row">
        <img
          className="mr-4"
          src="https://place-hold.it/200x150/D3D3D3?text=UZH LOGO"
        />
        <img src="https://place-hold.it/200x150/D3D3D3?text=SWISSUNI LOGO" />
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
