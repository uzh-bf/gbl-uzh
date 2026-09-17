import { cn } from '@gbl-uzh/ui'
import * as Dialog from '@radix-ui/react-dialog'
import { Check } from 'lucide-react'
import Image from 'next/image'
import { useState, type ReactElement } from 'react'
import {
  WelcomeActionButton,
  WelcomeTextButton,
  WelcomeTextInput,
} from './WelcomeControls'

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
        <Dialog.Overlay className="fixed inset-0 z-40 bg-black/[0.6667]" />
        <Dialog.Content className="font-player text-player-text fixed bottom-0 left-1/2 z-50 flex max-h-[90dvh] w-full max-w-[720px] -translate-x-1/2 flex-col gap-[16px] rounded-t-[16px] bg-white px-[16px] pt-[16px] pb-[max(16px,env(safe-area-inset-bottom))] text-[16px] leading-[1.5] shadow-[0_-8px_40px_#0002] min-[721px]:px-[24px]">
          <div className="flex shrink-0 items-center justify-between gap-[12px]">
            <Dialog.Title className="m-0 text-[20px] font-bold">
              {title}
            </Dialog.Title>
            <Dialog.Close asChild>
              <WelcomeTextButton>Cancel</WelcomeTextButton>
            </Dialog.Close>
          </div>
          <Dialog.Description className="sr-only">
            Choose an option, then confirm your selection below.
          </Dialog.Description>
          {searchable && (
            <WelcomeTextInput
              className="shrink-0"
              aria-label="Search canton"
              placeholder="Search canton"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
            />
          )}
          <div
            className={
              searchable
                ? 'min-h-0 overflow-y-auto p-[2px]'
                : 'grid grid-cols-4 gap-[10px] overflow-y-auto p-[2px] [@media(max-width:359px)]:grid-cols-3'
            }
            aria-label={title}
          >
            {filtered.map((option) => (
              <button
                key={option.value}
                type="button"
                className={cn(
                  'focus-visible:outline-player-primary aria-pressed:border-player-primary aria-pressed:text-player-primary cursor-pointer bg-white focus-visible:outline-2 focus-visible:outline-offset-[3px] aria-pressed:shadow-[inset_0_0_0_1px_var(--color-player-primary)]',
                  searchable
                    ? 'border-b-player-border flex min-h-[56px] w-full items-center justify-between gap-[12px] border border-transparent p-[14px] text-left [font:inherit] aria-pressed:rounded-[12px] aria-pressed:font-bold'
                    : 'border-player-input text-player-muted flex min-w-0 flex-col items-center gap-[6px] rounded-[12px] border px-[3px] py-[10px] text-[12px] font-bold [overflow-wrap:anywhere]'
                )}
                aria-pressed={pending === option.value}
                onClick={() => setPending(option.value)}
              >
                {!searchable && (
                  <Image
                    src={option.value}
                    alt=""
                    width={44}
                    height={44}
                    className="size-[44px] rounded-full object-cover"
                  />
                )}
                <span>{option.label}</span>
                {searchable && pending === option.value && (
                  <Check size={20} aria-hidden="true" />
                )}
              </button>
            ))}
            {filtered.length === 0 && (
              <p role="status" className="text-player-muted">
                No cantons found. Try a name or abbreviation.
              </p>
            )}
          </div>
          <WelcomeActionButton
            type="button"
            disabled={!selected}
            className="shrink-0 self-start"
            onClick={() => {
              if (selected) {
                onChange(selected.value)
                setOpen(false)
              }
            }}
          >
            Use {selected?.label ?? (searchable ? 'canton' : 'avatar')}
          </WelcomeActionButton>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  )
}
