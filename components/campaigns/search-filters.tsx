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
import { Search, Filter, X, Zap, Trophy, Clock, Star } from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";

interface SearchFiltersProps {
  searchTerm: string;
  setSearchTerm: (value: string) => void;
  selectedCategory: string;
  setSelectedCategory: (value: string) => void;
  selectedStatus: string;
  setSelectedStatus: (value: string) => void;
}

export function SearchFilters({
  searchTerm,
  setSearchTerm,
  selectedCategory,
  setSelectedCategory,
  selectedStatus,
  setSelectedStatus,
}: SearchFiltersProps) {
  const [activeFilters, setActiveFilters] = useState<string[]>([]);

  const categories = [
    { name: "Technology", color: "bg-blue-500", icon: "💻" },
    { name: "Gaming", color: "bg-purple-500", icon: "🎮" },
    { name: "Art", color: "bg-pink-500", icon: "🎨" },
    { name: "Music", color: "bg-green-500", icon: "🎵" },
    { name: "Fashion", color: "bg-orange-500", icon: "👗" },
    { name: "Food", color: "bg-red-500", icon: "🍔" },
    { name: "Health", color: "bg-emerald-500", icon: "🏥" },
    { name: "Education", color: "bg-indigo-500", icon: "📚" },
  ];

  const statusOptions = [
    { value: "active", label: "Active", color: "bg-green-500", icon: Zap },
    { value: "funded", label: "Funded", color: "bg-blue-500", icon: Trophy },
    { value: "ending-soon", label: "Ending Soon", color: "bg-orange-500", icon: Clock },
  ];

  const addFilter = (filter: string) => {
    if (!activeFilters.includes(filter)) {
      setActiveFilters([...activeFilters, filter]);
    }
  };

  const removeFilter = (filter: string) => {
    setActiveFilters((prev) => prev.filter((f) => f !== filter));
    if (filter.startsWith("Category: ")) {
      setSelectedCategory("");
    } else if (filter.startsWith("Status: ")) {
      setSelectedStatus("");
    }
  };

  const clearAllFilters = () => {
    setActiveFilters([]);
    setSearchTerm("");
    setSelectedCategory("");
    setSelectedStatus("");
  };

  const handleCategoryChange = (value: string) => {
    setSelectedCategory(value);
    if (value) {
      const filter = `Category: ${categories.find(c => c.name.toLowerCase() === value)?.name}`;
      addFilter(filter);
    }
  };

  const handleStatusChange = (value: string) => {
    setSelectedStatus(value);
    if (value) {
      const statusOption = statusOptions.find(s => s.value === value);
      if (statusOption) {
        addFilter(`Status: ${statusOption.label}`);
      }
    }
  };

  return (
    <div className="space-y-6">
      {/* Search Bar */}
      <div className="relative">
        <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-muted-foreground h-5 w-5" />
        <Input
          placeholder="Search campaigns by name, creator, or description..."
          className="pl-12 h-12 text-base border-2 focus:border-primary/50 transition-all duration-300"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      {/* Filter Controls */}
      <div className="flex flex-col lg:flex-row gap-4">
        {/* Category Filter */}
        <div className="flex-1">
          <Select value={selectedCategory} onValueChange={handleCategoryChange}>
            <SelectTrigger className="h-12 border-2 focus:border-primary/50 transition-all duration-300">
              <SelectValue placeholder="Select Category">
                {selectedCategory && (
                  <div className="flex items-center gap-2">
                    <span className="text-lg">
                      {categories.find(c => c.name.toLowerCase() === selectedCategory)?.icon}
                    </span>
                    {categories.find(c => c.name.toLowerCase() === selectedCategory)?.name}
                  </div>
                )}
              </SelectValue>
            </SelectTrigger>
            <SelectContent>
              {categories.map((category) => (
                <SelectItem key={category.name} value={category.name.toLowerCase()}>
                  <div className="flex items-center gap-3">
                    <span className="text-lg">{category.icon}</span>
                    <div className="flex items-center gap-2">
                      <div className={cn("w-2 h-2 rounded-full", category.color)} />
                      {category.name}
                    </div>
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Status Filter */}
        <div className="lg:w-48">
          <Select value={selectedStatus} onValueChange={handleStatusChange}>
            <SelectTrigger className="h-12 border-2 focus:border-primary/50 transition-all duration-300">
              <SelectValue placeholder="Status">
                {selectedStatus && (
                  <div className="flex items-center gap-2">
                    {(() => {
                      const statusOption = statusOptions.find(s => s.value === selectedStatus);
                      const Icon = statusOption?.icon;
                      return Icon ? <Icon className="w-4 h-4" /> : null;
                    })()}
                    {statusOptions.find(s => s.value === selectedStatus)?.label}
                  </div>
                )}
              </SelectValue>
            </SelectTrigger>
            <SelectContent>
              {statusOptions.map((status) => (
                <SelectItem key={status.value} value={status.value}>
                  <div className="flex items-center gap-3">
                    <div className={cn("w-2 h-2 rounded-full", status.color)} />
                    <status.icon className="w-4 h-4 mr-2" />
                    {status.label}
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Clear Filters Button */}
        {activeFilters.length > 0 && (
          <Button
            variant="outline"
            onClick={clearAllFilters}
            className="h-12 px-6 border-2 hover:bg-destructive/5 hover:border-destructive/50 hover:text-destructive transition-all duration-300"
          >
            <X className="w-4 h-4 mr-2" />
            Clear All
          </Button>
        )}
      </div>

      {/* Popular Categories - Quick Filter */}
      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <Star className="w-4 h-4 text-primary" />
          <span className="text-sm font-medium">Popular Categories</span>
        </div>
        <div className="flex flex-wrap gap-2">
          {categories.slice(0, 6).map((category) => (
            <Badge
              key={category.name}
              variant="outline"
              className={cn(
                "cursor-pointer hover:border-2 transition-all duration-300 hover:scale-105 px-3 py-1.5",
                selectedCategory === category.name.toLowerCase()
                  ? `border-2 ${category.color.replace('bg-', 'border-')} text-white ${category.color}`
                  : "hover:border-primary/50"
              )}
              onClick={() => handleCategoryChange(category.name.toLowerCase())}
            >
              <span className="mr-1">{category.icon}</span>
              {category.name}
            </Badge>
          ))}
        </div>
      </div>

      {/* Active Filters Display */}
      {activeFilters.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">Active Filters</span>
            <span className="text-xs text-muted-foreground">
              {activeFilters.length} filter{activeFilters.length > 1 ? 's' : ''} applied
            </span>
          </div>
          <div className="flex flex-wrap gap-2">
            {activeFilters.map((filter) => (
              <Badge
                key={filter}
                className="gap-2 px-3 py-1.5 bg-primary/10 text-primary border-primary/20 hover:bg-primary/20 transition-all duration-300"
              >
                {filter.includes("Category:") && (
                  <>
                    <span>
                      {categories.find(c => filter.includes(c.name))?.icon}
                    </span>
                  </>
                )}
                {filter.includes("Status:") && (
                  <>
                    {(() => {
                      const statusLabel = filter.replace("Status: ", "");
                      const statusOption = statusOptions.find(s => s.label === statusLabel);
                      const Icon = statusOption?.icon;
                      return Icon ? <Icon className="w-3 h-3" /> : null;
                    })()}
                  </>
                )}
                {filter}
                <X
                  className="h-3 w-3 cursor-pointer hover:bg-primary/30 rounded-full p-0.5 transition-colors"
                  onClick={() => removeFilter(filter)}
                />
              </Badge>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
