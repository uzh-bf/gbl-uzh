import * as React from 'react'
import { Button } from '~/components/ui/button'
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '~/components/ui/command'
import { cn } from '~/lib/utils'
import { Check, ChevronsUpDown } from 'lucide-react'

interface MultiSelectProps {
  options: { value: string; label: string }[]
  value: string[]
  onChange: (value: string[]) => void
  searchPlaceholder?: string
  placeholder?: string
  emptyText?: string
}

export function MultiSelect({
  options,
  value,
  onChange,
  searchPlaceholder = 'Search...',
  placeholder = 'Select options...',
  emptyText = 'No results found.',
}: MultiSelectProps) {
  const [open, setOpen] = React.useState(false)
  const containerRef = React.useRef<HTMLDivElement>(null)

  const handleValueChange = (val: string) => {
    if (value.includes(val)) {
      onChange(value.filter((v) => v !== val))
    } else {
      onChange([...value, val])
    }
  }

  React.useEffect(() => {
    const handleClickOutside = (event: PointerEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setOpen(false)
      }
    }

    document.addEventListener('pointerdown', handleClickOutside)
    return () => {
      document.removeEventListener('pointerdown', handleClickOutside)
    }
  }, [])

  return (
    <div ref={containerRef} className="relative w-full">
      <Button
        variant="outline"
        role="combobox"
        aria-expanded={open}
        className="relative h-fit min-h-[var(--gbl-control-height,0px)] min-w-full justify-between text-[length:var(--gbl-body-size,0.875rem)] leading-[var(--gbl-body-leading,1.25rem)]"
        onClick={() => setOpen(!open)}
      >
        <div className="flex flex-wrap justify-start gap-2">
          {value?.length
            ? value.map((val) => (
                <div
                  key={val}
                  className="rounded-xl border bg-slate-200 px-2 py-1 text-[length:var(--gbl-caption-size,0.75rem)] leading-[var(--gbl-caption-leading,1rem)] font-medium"
                >
                  {options.find((option) => option.value === val)?.label}
                </div>
              ))
            : placeholder}
        </div>
        <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
      </Button>
      {open && (
        <Command className="absolute z-10 mt-1 h-fit border bg-white">
          <CommandInput placeholder={searchPlaceholder} className="min-h-[var(--gbl-control-height,0px)] text-[length:var(--gbl-body-size,0.875rem)] leading-[var(--gbl-body-leading,1.25rem)]" />
          <CommandList>
            <CommandEmpty>{emptyText}</CommandEmpty>
            <CommandGroup>
              {options.map((option) => (
                <CommandItem
                  key={option.value}
                  className="min-h-[var(--gbl-control-height,0px)] text-[length:var(--gbl-body-size,0.875rem)] leading-[var(--gbl-body-leading,1.25rem)]"
                  value={option.value}
                  onSelect={() => {
                    handleValueChange(option.value)
                  }}
                >
                  <Check
                    className={cn(
                      'mr-2 h-4 w-4',
                      value.includes(option.value) ? 'opacity-100' : 'opacity-0'
                    )}
                  />
                  {option.label}
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      )}
    </div>
  )
}
