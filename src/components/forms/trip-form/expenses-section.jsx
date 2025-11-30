'use client'

import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import { Button } from '@/components/ui/button'
import { Calendar } from '@/components/ui/calendar'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { CalendarIcon, DollarSign, Plus, Trash2 } from 'lucide-react'
import { format } from 'date-fns'
import { cn } from '@/lib/utils'

export function ExpensesSection({
  formData,
  handleExpenseChange,
  addExpense,
  removeExpense,
}) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Expenses</CardTitle>
        <CardDescription>Add expected expenses for this trip</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {formData.expenses.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <DollarSign className="h-12 w-12 mx-auto mb-4 text-muted-foreground/50" />
            <p>No expenses have been added yet.</p>
            <p className="text-sm">
              Add expected expenses like fuel, tolls, and accommodation.
            </p>
          </div>
        ) : (
          formData.expenses.map((expense, index) => (
            <div key={`expense-${index}`} className="space-y-4">
              <div className="flex items-center justify-between">
                <Badge variant="outline" className="px-2 py-1">
                  Expense {index + 1}
                </Badge>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => removeExpense(index)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor={`expense-type-${index}`}>Type</Label>
                  <Select
                    value={expense.type}
                    onValueChange={(value) =>
                      handleExpenseChange(index, 'type', value)
                    }
                  >
                    <SelectTrigger id={`expense-type-${index}`}>
                      <SelectValue placeholder="Select type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="fuel">Fuel</SelectItem>
                      <SelectItem value="toll">Toll</SelectItem>
                      <SelectItem value="accommodation">
                        Accommodation
                      </SelectItem>
                      <SelectItem value="meals">Meals</SelectItem>
                      <SelectItem value="maintenance">Maintenance</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor={`expense-amount-${index}`}>Amount</Label>
                  <Input
                    id={`expense-amount-${index}`}
                    value={expense.amount}
                    onChange={(e) =>
                      handleExpenseChange(index, 'amount', e.target.value)
                    }
                    placeholder="e.g., R 500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor={`expense-date-${index}`}>Date</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className={cn(
                          'w-full justify-start text-left font-normal',
                          !expense.date && 'text-muted-foreground'
                        )}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {expense.date
                          ? format(new Date(expense.date), 'PPP')
                          : 'Select date'}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                      <Calendar
                        mode="single"
                        selected={
                          expense.date ? new Date(expense.date) : undefined
                        }
                        onSelect={(date) =>
                          handleExpenseChange(
                            index,
                            'date',
                            date ? format(date, 'yyyy-MM-dd') : ''
                          )
                        }
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                </div>

                <div className="space-y-2">
                  <Label htmlFor={`expense-notes-${index}`}>Notes</Label>
                  <Input
                    id={`expense-notes-${index}`}
                    value={expense.notes}
                    onChange={(e) =>
                      handleExpenseChange(index, 'notes', e.target.value)
                    }
                    placeholder="Additional details"
                  />
                </div>
              </div>

              {index < formData.expenses.length - 1 && (
                <Separator className="my-4" />
              )}
            </div>
          ))
        )}

        <Button
          type="button"
          variant="outline"
          className="w-full"
          onClick={addExpense}
        >
          <Plus className="h-4 w-4 mr-2" /> Add Expense
        </Button>
      </CardContent>
    </Card>
  )
}
