import { useState } from "react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
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
}

export function UpdateValueDialog({
  open,
  onOpenChange,
  onSubmit,
  title,
  description,
  label = "Amount",
  defaultValue = 0,
}: UpdateValueDialogProps) {
  const [value, setValue] = useState<string>(defaultValue.toString())
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const numValue = parseFloat(value)
    if (!isNaN(numValue)) {
      onSubmit(numValue)
      onOpenChange(false)
      setValue(defaultValue.toString()) // Reset for next time
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          {description && <p className="text-sm text-muted-foreground">{description}</p>}
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
                step="0.01"
                required
                autoFocus
              />
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit">Update</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
