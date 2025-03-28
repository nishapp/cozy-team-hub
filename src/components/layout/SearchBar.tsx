
import React from "react";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";

const SearchBar = () => {
  return (
    <div className="relative w-full max-w-xl">
      <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
        <Search className="w-4 h-4 text-muted-foreground" />
      </div>
      <Input
        type="search"
        placeholder="Search for ideas, people, or projects..."
        className="pl-10 py-2 h-10 rounded-full bg-muted/50 border-none focus:ring-1"
      />
    </div>
  );
};

export default SearchBar;
