import { Progress } from '@uzh-bf/design-system'

interface XpBarProps {
  value: number
  max: number
}

function XpBar({ value, max }: XpBarProps) {
  return (
    <div>
      <Progress value={value ?? 0} max={max} formatter={(val) => `${val}XP`} />
    </div>
  )
}

export default XpBar
