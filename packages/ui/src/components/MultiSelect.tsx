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
  placeholderCmdSearch: string
}

export function MultiSelect({
  options,
  value,
  onChange,
  placeholderCmdSearch,
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
        className="relative h-fit min-w-full justify-between"
        onClick={() => setOpen(!open)}
      >
        <div className="flex flex-wrap justify-start gap-2">
          {value?.length
            ? value.map((val) => (
                <div
                  key={val}
                  className="rounded-xl border bg-slate-200 px-2 py-1 text-xs font-medium"
                >
                  {options.find((option) => option.value === val)?.label}
                </div>
              ))
            : 'Select options...'}
        </div>
        <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
      </Button>
      {open && (
        <Command className="absolute z-10 mt-1 h-fit border bg-white">
          <CommandInput placeholder={placeholderCmdSearch} />
          <CommandList>
            <CommandEmpty>No results found.</CommandEmpty>
            <CommandGroup>
              {options.map((option) => (
                <CommandItem
                  key={option.value}
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
