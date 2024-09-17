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
  const handleValueChange = (val) => {
    console.log('handleValueChange', val)
    if (value.includes(val)) {
      onChange(value.filter((v) => v !== val))
    } else {
      onChange([...value, val])
    }
  }

  return (
    <div>
      {/* <Popover open={open} onOpenChange={setOpen}> */}
      {/* <PopoverTrigger asChild> */}
      <Button
        variant="outline"
        role="combobox"
        aria-expanded={open}
        className="justify-between"
        onClick={() => setOpen(!open)}
      >
        <div className="flex justify-start gap-2">
          {value?.length
            ? value.map((val, i) => (
                <div
                  key={i}
                  className="rounded-xl border bg-slate-200 px-2 py-1 text-xs font-medium"
                >
                  {options.find((option) => option.value === val)?.label}
                </div>
              ))
            : 'Select option...'}
        </div>
        <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
      </Button>
      {/* </PopoverTrigger> */}
      {/* <PopoverContent className="p-0"> */}
      {open && (
        <Command className="border">
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
