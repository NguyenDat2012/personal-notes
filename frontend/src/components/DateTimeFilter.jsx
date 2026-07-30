import * as React from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { options } from "@/lib/data";

export const DateTimeFilter = ({ dateQuery, setDateQuery }) => {
  return (
    <div className="flex flex-wrap gap-2 justify-center sm:justify-end">
      {options.map((option) => (
        <Button
          key={option.value}
          variant={dateQuery === option.value ? "gradient" : "outline"}
          size="sm"
          className="rounded-full text-xs px-3"
          onClick={(e) => {
            e.preventDefault();
            setDateQuery(option.value);
          }}
        >
          {option.label}
        </Button>
      ))}
    </div>
  );
};
