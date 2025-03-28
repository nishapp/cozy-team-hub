
import React from "react";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";

const SearchBar = () => {
  return (
    <div className="relative w-full max-w-xl">
      <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
        <Search className="w-4 h-4 text-gray-500" />
      </div>
      <Input
        type="search"
        placeholder="Search"
        className="pl-10 py-2 h-10 rounded-full bg-gray-100 dark:bg-gray-800 border-none focus-visible:ring-gray-300 dark:focus-visible:ring-gray-600"
      />
    </div>
  );
};

export default SearchBar;
