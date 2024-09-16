'use client'

import {
  Button,
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@uzh-bf/design-system/dist/future'
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

export function MultiSelect({ options, value, onChange }) {
  const [open, setOpen] = React.useState(false)
  // const [value, setValue] = React.useState<string[]>([])
  // const handleSetValue = (val: string) => {
  //   if (value.includes(val)) {
  //     value.splice(value.indexOf(val), 1)
  //     setValue(value.filter((item) => item !== val))
  //   } else {
  //     setValue((prevValue) => [...prevValue, val])
  //   }
  // }

  const handleValueChange = (optionValue) => {
    const newValue = value.includes(optionValue)
      ? value.filter((v) => v !== optionValue)
      : [...value, optionValue]
    onChange(newValue)
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="w-[480px] justify-between"
        >
          <div className="flex justify-start gap-2">
            {value?.length
              ? value.map((val, i) => (
                  <div
                    key={i}
                    className="rounded-xl border bg-slate-200 px-2 py-1 text-xs font-medium"
                  >
                    {
                      options.find((framework) => framework.value === val)
                        ?.label
                    }
                  </div>
                ))
              : 'Select framework...'}
          </div>
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[480px] p-0">
        <Command>
          <CommandInput placeholder="Search framework..." />
          <CommandEmpty>No framework found.</CommandEmpty>
          <CommandGroup>
            <CommandList>
              {options.map((framework) => (
                <CommandItem
                  key={framework.value}
                  value={framework.value}
                  onSelect={() => {
                    // handleSetValue(framework.value)
                    handleValueChange(framework.value)
                  }}
                >
                  <Check
                    className={twMerge(
                      'mr-2 h-4 w-4',
                      value.includes(framework.value)
                        ? 'opacity-100'
                        : 'opacity-0'
                    )}
                  />
                  {framework.label}
                </CommandItem>
              ))}
            </CommandList>
          </CommandGroup>
        </Command>
      </PopoverContent>
    </Popover>
  )
}
