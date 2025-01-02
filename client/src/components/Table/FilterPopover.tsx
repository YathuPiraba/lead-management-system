import React from "react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import { Search } from "lucide-react";

type FilterPopoverProps = {
  column: string;
  type?: "text" | "date" | "status";
  value: any;
  onValueChange: (value: any) => void;
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

const FilterPopover = ({
  column,
  type = "text",
  value,
  onValueChange,
  open,
  onOpenChange,
}: FilterPopoverProps) => (
  <Popover open={open} onOpenChange={onOpenChange}>
    <PopoverTrigger asChild>
      <Button
        variant="ghost"
        size="sm"
        className={`h-8 w-8 p-0 ${value ? "text-blue-600" : ""}`}
      >
        <Search className="h-4 w-4" />
      </Button>
    </PopoverTrigger>
    <PopoverContent className="w-80 p-4">
      <div className="grid gap-4">
        <div className="space-y-2">
          <h4 className="font-medium leading-none">{`Filter by ${column}`}</h4>
          <p className="text-sm text-muted-foreground">
            Enter your search criteria below
          </p>
        </div>
        {type === "date" ? (
          <Calendar
            mode="single"
            selected={value ? new Date(value) : undefined}
            onSelect={(date) => onValueChange(date?.toISOString())}
            className="rounded-md border"
          />
        ) : type === "status" ? (
          <Select value={value} onValueChange={onValueChange}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Select status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All</SelectItem>
              <SelectItem value="Completed">Completed</SelectItem>
              <SelectItem value="Pending">Pending</SelectItem>
            </SelectContent>
          </Select>
        ) : (
          <div className="grid gap-2">
            <Input
              placeholder={`Search ${column}`}
              value={value || ""}
              onChange={(e) => onValueChange(e.target.value)}
              className="h-8"
            />
          </div>
        )}
      </div>
    </PopoverContent>
  </Popover>
);

export default FilterPopover;
