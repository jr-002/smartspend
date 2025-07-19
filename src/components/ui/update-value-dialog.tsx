import { useState } from "react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

interface UpdateValueDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSubmit: (value: number) => void
  title: string
  description?: string
  label?: string
  defaultValue?: number
  placeholder?: string
  min?: number
  max?: number
}

export function UpdateValueDialog({
  open,
  onOpenChange,
  onSubmit,
  title,
  description,
  label = "Amount",
  defaultValue = 0,
  placeholder = "Enter amount",
  min,
  max,
}: UpdateValueDialogProps) {
  const [value, setValue] = useState<string>(defaultValue.toString())
  const [error, setError] = useState<string>("")
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    
    const numValue = parseFloat(value)
    
    if (isNaN(numValue)) {
      setError("Please enter a valid number")
      return
    }
    
    if (min !== undefined && numValue < min) {
      setError(`Amount must be at least ${min}`)
      return
    }
    
    if (max !== undefined && numValue > max) {
      setError(`Amount must not exceed ${max}`)
      return
    }
    
    onSubmit(numValue)
    onOpenChange(false)
    setValue(defaultValue.toString()) // Reset for next time
  }

  const handleOpenChange = (open: boolean) => {
    if (!open) {
      setError("")
      setValue(defaultValue.toString())
    }
    onOpenChange(open)
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          {description && <DialogDescription>{description}</DialogDescription>}
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="value" className="text-right">
                {label}
              </Label>
              <Input
                id="value"
                type="number"
                className="col-span-3"
                value={value}
                onChange={(e) => setValue(e.target.value)}
                placeholder={placeholder}
                step="0.01"
                min={min}
                max={max}
                required
                autoFocus
              />
            </div>
            {error && (
              <div className="col-span-4 text-sm text-destructive">
                {error}
              </div>
            )}
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => handleOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit">Update</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
