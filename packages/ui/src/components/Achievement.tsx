interface AchievementProps {
  name: string
  xpReward: number
  image: string
  count: number
}
// TODO(JJ): replace img with react node instead of providing image path
function Achievement({ name, xpReward, image, count }: AchievementProps) {
  return (
    <div
      className="relative w-10 h-10 p-2 bg-white border rounded shadow md:w-12 md:h-12"
      title={name}
    >
      <img className="w-6 h-6 md:w-8 md:h-8" src={`/${image}`} />
      <div className="absolute bottom-0 right-0 p-[2px] text-xs text-red-700 bg-white bg-opacity-90 rounded">
        {xpReward}
      </div>
      {count > 1 && (
        <div className="absolute top-0 right-0 p-[2px] text-xs text-red-700 bg-white bg-opacity-90 rounded">
          {count}x
        </div>
      )}
    </div>
  )
}

export { Achievement }
