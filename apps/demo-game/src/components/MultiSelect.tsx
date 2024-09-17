import { Button } from '@uzh-bf/design-system/dist/future'
import * as React from 'react'
import { twMerge } from 'tailwind-merge'
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '~/components/ui/command'

import { Check, ChevronsUpDown } from 'lucide-react'

export function MultiSelect({
  options,
  value,
  onChange,
  placeholderCmdSearch,
}) {
  const [open, setOpen] = React.useState(false)
  const containerRef = React.useRef(null)

  const handleValueChange = (val) => {
    if (value.includes(val)) {
      onChange(value.filter((v) => v !== val))
    } else {
      onChange([...value, val])
    }
  }

  React.useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target)
      ) {
        setOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [])

  return (
    <div ref={containerRef} className="relative w-full">
      {/* <Popover open={open} onOpenChange={setOpen}> */}
      {/* <PopoverTrigger asChild> */}
      <Button
        variant="outline"
        role="combobox"
        aria-expanded={open}
        className="relative h-fit min-w-full justify-between"
        onClick={() => setOpen(!open)}
      >
        <div className="flex flex-wrap justify-start gap-2">
          {value?.length
            ? value.map((val, i) => (
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
      {/* </PopoverTrigger> */}
      {/* <PopoverContent className="p-0"> */}
      {open && (
        <Command className="absolute mt-1 h-fit border">
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
                    className={twMerge(
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
      {/* </PopoverContent> */}
      {/* </Popover> */}
    </div>
  )
}
