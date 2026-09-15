import * as Dialog from '@radix-ui/react-dialog'
import { Button } from '@uzh-bf/design-system'
import { Check } from 'lucide-react'
import Image from 'next/image'
import { useState, type ReactElement } from 'react'
import styles from './WelcomeSetup.module.css'

export type Option = { value: string; label: string }

export default function OptionPicker({
  title,
  value,
  options,
  onChange,
  children,
  searchable = false,
}: {
  title: string
  value: string
  options: Option[]
  onChange: (value: string) => void
  children: ReactElement
  searchable?: boolean
}) {
  const [open, setOpen] = useState(false)
  const [pending, setPending] = useState(value)
  const [search, setSearch] = useState('')
  const selected = options.find((option) => option.value === pending)
  const query = search.trim().toLocaleLowerCase()
  const filtered = options.filter((option) =>
    option.label.toLocaleLowerCase().includes(query)
  )

  return (
    <Dialog.Root
      open={open}
      onOpenChange={(next) => {
        if (next) {
          setPending(value)
          setSearch('')
        }
        setOpen(next)
      }}
    >
      <Dialog.Trigger asChild>{children}</Dialog.Trigger>
      <Dialog.Portal>
        <Dialog.Overlay className={styles.overlay} />
        <Dialog.Content className={styles.sheet}>
          <div className={styles.sheetHeader}>
            <Dialog.Title>{title}</Dialog.Title>
            <Dialog.Close className={styles.textButton}>Cancel</Dialog.Close>
          </div>
          <Dialog.Description className={styles.srOnly}>
            Choose an option, then confirm your selection below.
          </Dialog.Description>
          {searchable && (
            <input
              className={styles.input}
              aria-label="Search canton"
              placeholder="Search canton"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
            />
          )}
          <div
            className={searchable ? styles.cantonList : styles.avatarGrid}
            aria-label={title}
          >
            {filtered.map((option) => (
              <button
                key={option.value}
                type="button"
                className={
                  searchable ? styles.cantonOption : styles.avatarOption
                }
                aria-pressed={pending === option.value}
                onClick={() => setPending(option.value)}
              >
                {!searchable && (
                  <Image src={option.value} alt="" width={44} height={44} />
                )}
                <span>{option.label}</span>
                {searchable && pending === option.value && (
                  <Check size={20} aria-hidden="true" />
                )}
              </button>
            ))}
            {filtered.length === 0 && (
              <p role="status" className={styles.muted}>
                No cantons found. Try a name or abbreviation.
              </p>
            )}
          </div>
          <Button
            type="button"
            primary
            disabled={!selected}
            className={{ root: styles.primaryButton }}
            onClick={() => {
              if (selected) {
                onChange(selected.value)
                setOpen(false)
              }
            }}
          >
            Use {selected?.label ?? (searchable ? 'canton' : 'avatar')}
          </Button>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  )
}
