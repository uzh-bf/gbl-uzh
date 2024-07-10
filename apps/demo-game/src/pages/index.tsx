import { Button, Dice } from '@gbl-uzh/ui'

export default function Home() {
  return (
    <div className="font-source-sans p-4">
      hello world
      <Button />
      <Dice dice1={'dice1'} dice2={'dice2'} />
    </div>
  )
}
