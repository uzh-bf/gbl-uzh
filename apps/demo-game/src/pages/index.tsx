import { Logo } from '@gbl-uzh/ui'
import { Progress } from '@uzh-bf/design-system'

export default function Home() {
  return (
    <div className="font-source-sans p-4">
      hello world
      {/* <Button /> */}
      {/* <Dice dice1={'dice1'} dice2={'dice2'} /> */}
      <Progress value={50} max={100} formatter={(val) => `${val}XP`} />
      <Logo name={'Logo'} />
    </div>
  )
}
