function VideoWithSummary({ title, videoSrc, children }) {
  return (
    <div className="flex flex-col justify-between md:flex-row">
      <div className="flex-initial w-full border rounded shadow h-80 md:flex-1">
        <iframe
          title={title}
          width="100%"
          height="100%"
          src={videoSrc}
          frameBorder="0"
          allow="fullscreen"
          allowFullScreen
        />
      </div>
      <div className="flex-1 mt-4 md:mt-0 md:pl-8">
        <p className="prose-lg text-justify max-w-none">{children}</p>
      </div>
    </div>
  )
}

export default VideoWithSummary
