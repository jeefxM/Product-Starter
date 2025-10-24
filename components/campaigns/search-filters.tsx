"use client";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Search, Filter, X } from "lucide-react";
import { useState } from "react";

export function SearchFilters() {
  const [activeFilters, setActiveFilters] = useState<string[]>([]);

  const categories = [
    "Technology",
    "Gaming",
    "Art",
    "Music",
    "Fashion",
    "Food",
    "Health",
    "Education",
  ];

  const removeFilter = (filter: string) => {
    setActiveFilters((prev) => prev.filter((f) => f !== filter));
  };

  return (
    <div className="space-y-4 mb-8">
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
          <Input placeholder="Search campaigns..." className="pl-10" />
        </div>

        <div className="flex gap-2">
          <Select>
            <SelectTrigger className="w-[140px] rounded-xl">
              <SelectValue placeholder="Category" />
            </SelectTrigger>
            <SelectContent>
              {categories.map((category) => (
                <SelectItem key={category} value={category.toLowerCase()}>
                  {category}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select>
            <SelectTrigger className="w-[120px] rounded-xl">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="active">Active</SelectItem>
              <SelectItem value="funded">Funded</SelectItem>
              <SelectItem value="ending-soon">Ending Soon</SelectItem>
            </SelectContent>
          </Select>

          <Button variant="outline" size="icon" className="rounded-xl">
            <Filter className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {activeFilters.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {activeFilters.map((filter) => (
            <Badge
              key={filter}
              variant="secondary"
              className="gap-1 rounded-xl"
            >
              {filter}
              <X
                className="h-3 w-3 cursor-pointer"
                onClick={() => removeFilter(filter)}
              />
            </Badge>
          ))}
        </div>
      )}
    </div>
  );
}
