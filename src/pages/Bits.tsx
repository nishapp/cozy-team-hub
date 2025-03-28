import { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import { Navigate, useNavigate } from "react-router-dom";
import Navbar from "../components/layout/Navbar";
import PageTransition from "../components/ui/PageTransition";
import { supabase } from "@/lib/supabase";
import BitCard from "@/components/bits/BitCard";
import BitDetailModal from "@/components/bits/BitDetailModal";
import HeaderAddBitButton from "@/components/bits/HeaderAddBitButton";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Filter, Search, X } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";

interface Bit {
  id: string;
  title: string;
  description: string;
  tags: string[];
  category: string;
  visibility: string;
  wdylt_comment?: string;
  image_url?: string;
  created_at: string;
  shared_by?: string;
  isBookmarked?: boolean;
  link?: string;
}

const sampleBits = [
  {
    id: "1",
    title: "Learning TypeScript",
    description: "Notes on advanced TypeScript features and patterns. TypeScript is a strongly typed programming language that builds on JavaScript, giving you better tooling at any scale.",
    tags: ["programming", "typescript", "web development"],
    category: "coding",
    visibility: "public",
    wdylt_comment: "Excited to master TypeScript!",
    image_url: "https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=800&auto=format&fit=crop&q=60&ixlib=rb-4.0.3",
    created_at: new Date().toISOString(),
    link: "https://www.typescriptlang.org/docs/"
  },
  {
    id: "2",
    title: "React Hooks Deep Dive",
    description: "Understanding useEffect, useMemo, and useCallback in depth.",
    tags: ["react", "javascript", "hooks"],
    category: "coding",
    visibility: "public",
    wdylt_comment: "Hooks have changed the way I write React!",
    created_at: new Date().toISOString(),
    link: "https://reactjs.org/docs/hooks-intro.html"
  },
  {
    id: "3",
    title: "Mindfulness Meditation",
    description: "Practicing mindfulness daily has improved my focus and reduced stress significantly.",
    tags: ["wellness", "mindfulness", "health"],
    category: "health",
    visibility: "public",
    wdylt_comment: "Feeling centered and calm.",
    image_url: "https://images.unsplash.com/photo-1506126613408-eca07ce68773?w=800&auto=format&fit=crop&q=60&ixlib=rb-4.0.3",
    created_at: new Date().toISOString(),
    link: "https://www.mindful.org/meditation/mindfulness-getting-started/"
  },
  {
    id: "4",
    title: "Garden Progress",
    description: "My vegetable garden is thriving this year. The tomatoes and peppers are coming in nicely.",
    tags: ["gardening", "vegetables", "hobby"],
    category: "hobbies",
    visibility: "public",
    wdylt_comment: "Growing my own food is so rewarding!",
    image_url: "https://images.unsplash.com/photo-1466692478-ca5e3f4abd8c?w=800&auto=format&fit=crop&q=60&ixlib=rb-4.0.3",
    created_at: new Date().toISOString(),
    link: "https://www.gardeningknowhow.com/vegetable/"
  },
  {
    id: "5",
    title: "Book Review: Atomic Habits",
    description: "James Clear's book on building good habits and breaking bad ones. Highly recommended for anyone looking to make positive changes in their life.",
    tags: ["books", "productivity", "habits"],
    category: "reading",
    visibility: "public",
    wdylt_comment: "This book changed my approach to habits!",
    image_url: "https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=800&auto=format&fit=crop&q=60&ixlib=rb-4.0.3",
    created_at: new Date().toISOString(),
    link: "https://jamesclear.com/atomic-habits"
  },
];

const Bits = () => {
  const { user, loading: authLoading } = useAuth();
  const [fullName, setFullName] = useState<string>("");
  const [bits, setBits] = useState<Bit[]>(sampleBits);
  const [bookmarkedBits, setBookmarkedBits] = useState<Bit[]>([]);
  const [bitCount, setBitCount] = useState<number>(0);
  const [selectedBit, setSelectedBit] = useState<Bit | null>(null);
  const [activeTab, setActiveTab] = useState<string>("all");
  const navigate = useNavigate();
  
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const [tagFilters, setTagFilters] = useState<string[]>([]);
  const [filteredBits, setFilteredBits] = useState<Bit[]>(bits);
  const [filteredBookmarkedBits, setFilteredBookmarkedBits] = useState<Bit[]>(bookmarkedBits);
  
  const categories = [...new Set(bits.map(bit => bit.category))];
  const allTags = [...new Set(bits.flatMap(bit => bit.tags))];

  useEffect(() => {
    const fetchUserProfile = async () => {
      if (!user) return;

      const { data, error } = await supabase
        .from("profiles")
        .select("full_name")
        .eq("id", user.id)
        .single();

      if (error) {
        console.error("Error fetching user profile:", error);
        return;
      }

      if (data && data.full_name) {
        setFullName(data.full_name);
      }
    };

    fetchUserProfile();
    
    setBitCount(sampleBits.length);
    
    const loadBookmarks = () => {
      try {
        const savedBookmarks = localStorage.getItem('bookmarkedBits');
        if (savedBookmarks) {
          const bookmarkIds = JSON.parse(savedBookmarks) as string[];
          const markedBits = bits.map(bit => ({
            ...bit,
            isBookmarked: bookmarkIds.includes(bit.id)
          }));
          setBits(markedBits);
          
          const bookmarked = markedBits.filter(bit => bit.isBookmarked);
          setBookmarkedBits(bookmarked);
        }
      } catch (error) {
        console.error("Error loading bookmarks:", error);
      }
    };
    
    loadBookmarks();
  }, [user]);

  useEffect(() => {
    applyFilters();
  }, [bits, bookmarkedBits, searchTerm, categoryFilter, tagFilters]);

  const applyFilters = () => {
    const filterBits = (bitsToFilter: Bit[]) => {
      return bitsToFilter.filter(bit => {
        const matchesSearch = 
          searchTerm === "" || 
          bit.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
          bit.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
          bit.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));
        
        const matchesCategory = 
          categoryFilter === "all" || 
          bit.category.toLowerCase() === categoryFilter.toLowerCase();
        
        const matchesTags = 
          tagFilters.length === 0 || 
          tagFilters.every(tag => bit.tags.includes(tag));
        
        return matchesSearch && matchesCategory && matchesTags;
      });
    };
    
    setFilteredBits(filterBits(bits));
    setFilteredBookmarkedBits(filterBits(bookmarkedBits));
  };

  const resetFilters = () => {
    setSearchTerm("");
    setCategoryFilter("all");
    setTagFilters([]);
  };

  const addTagFilter = (tag: string) => {
    if (!tagFilters.includes(tag)) {
      setTagFilters([...tagFilters, tag]);
    }
  };

  const removeTagFilter = (tag: string) => {
    setTagFilters(tagFilters.filter(t => t !== tag));
  };

  const handleBitAdded = (newBit: Bit) => {
    const bitWithId = {
      ...newBit,
      id: newBit.id || `temp-${Date.now()}`,
    };
    
    setBits([bitWithId, ...bits]);
    setBitCount(prevCount => prevCount + 1);
    toast.success("Bit added successfully!");
  };

  const handleBitUpdated = (updatedBit: Bit) => {
    const updatedBits = bits.map(bit => 
      bit.id === updatedBit.id ? { ...updatedBit, isBookmarked: bit.isBookmarked } : bit
    );
    setBits(updatedBits);
    
    if (bookmarkedBits.some(bit => bit.id === updatedBit.id)) {
      setBookmarkedBits(bookmarkedBits.map(bit => 
        bit.id === updatedBit.id ? { ...updatedBit, isBookmarked: true } : bit
      ));
    }
    
    toast.success("Bit updated successfully!");
  };

  const handleBitSelected = (bit: Bit) => {
    setSelectedBit(bit);
  };
  
  const handleBookmarkToggle = (bit: Bit, isBookmarked: boolean) => {
    const updatedBits = bits.map(b => 
      b.id === bit.id ? { ...b, isBookmarked } : b
    );
    setBits(updatedBits);
    
    if (isBookmarked) {
      setBookmarkedBits([...bookmarkedBits, { ...bit, isBookmarked: true }]);
    } else {
      setBookmarkedBits(bookmarkedBits.filter(b => b.id !== bit.id));
    }
    
    try {
      const bookmarkIds = updatedBits
        .filter(b => b.isBookmarked)
        .map(b => b.id);
      localStorage.setItem('bookmarkedBits', JSON.stringify(bookmarkIds));
    } catch (error) {
      console.error("Error saving bookmarks:", error);
    }
  };

  if (!user && !authLoading) {
    return <Navigate to="/auth" replace />;
  }

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="h-8 w-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <PageTransition>
      <div className="min-h-screen flex flex-col">
        <Navbar />
        
        <main className="flex-1 container py-8">
          <div className="mb-8">
            <div className="flex items-center gap-3 mb-6">
              <Button 
                variant="ghost" 
                size="icon"
                onClick={() => navigate('/dashboard')}
                className="h-8 w-8"
              >
                <ArrowLeft size={18} />
              </Button>
              <h1 className="text-3xl font-bold">My Bits</h1>
              <span className="text-muted-foreground">{bitCount} Pins</span>
            </div>
            
            <div className="flex justify-between items-center mb-4">
              <p className="text-muted-foreground">
                All your bits in one place. Browse and organize your collection.
              </p>
              <div className="flex items-center gap-2">
                <HeaderAddBitButton onBitAdded={handleBitAdded} />
              </div>
            </div>
            
            <div className="mb-4">
              <div className="flex flex-col sm:flex-row gap-2 mb-2">
                <div className="relative flex-grow">
                  <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    type="search"
                    placeholder="Search by title, description, or tags..."
                    className="pl-8 w-full"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                  {searchTerm && (
                    <Button
                      variant="ghost"
                      size="icon"
                      className="absolute right-1 top-1 h-8 w-8"
                      onClick={() => setSearchTerm("")}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  )}
                </div>
                
                <div className="flex gap-2">
                  <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                    <SelectTrigger className="min-w-[150px]">
                      <SelectValue placeholder="Filter by category" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Categories</SelectItem>
                      {categories.map((category) => (
                        <SelectItem key={category} value={category.toLowerCase()}>
                          {category.charAt(0).toUpperCase() + category.slice(1)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="outline" className="flex items-center gap-1">
                        <Filter className="h-4 w-4" />
                        <span>Tags</span>
                        {tagFilters.length > 0 && (
                          <Badge variant="secondary" className="ml-1">
                            {tagFilters.length}
                          </Badge>
                        )}
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent className="w-56">
                      <DropdownMenuLabel>Filter by Tags</DropdownMenuLabel>
                      <DropdownMenuSeparator />
                      <div className="max-h-[300px] overflow-y-auto">
                        <DropdownMenuGroup>
                          {allTags.map((tag) => (
                            <DropdownMenuItem
                              key={tag}
                              className="flex items-center justify-between cursor-pointer"
                              onClick={() => {
                                if (tagFilters.includes(tag)) {
                                  removeTagFilter(tag);
                                } else {
                                  addTagFilter(tag);
                                }
                              }}
                            >
                              <span>{tag}</span>
                              {tagFilters.includes(tag) && (
                                <span className="text-primary">✓</span>
                              )}
                            </DropdownMenuItem>
                          ))}
                        </DropdownMenuGroup>
                      </div>
                      {tagFilters.length > 0 && (
                        <>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem 
                            className="text-destructive focus:text-destructive cursor-pointer"
                            onClick={() => setTagFilters([])}
                          >
                            Clear tag filters
                          </DropdownMenuItem>
                        </>
                      )}
                    </DropdownMenuContent>
                  </DropdownMenu>
                  
                  {(searchTerm || categoryFilter !== "all" || tagFilters.length > 0) && (
                    <Button variant="ghost" onClick={resetFilters}>
                      Clear All
                    </Button>
                  )}
                </div>
              </div>
              
              <div className="flex flex-wrap gap-2 mt-2">
                {categoryFilter !== "all" && (
                  <Badge variant="secondary" className="flex items-center gap-1">
                    <span>Category: {categoryFilter}</span>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-4 w-4 p-0 ml-1"
                      onClick={() => setCategoryFilter("all")}
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  </Badge>
                )}
                
                {tagFilters.map((tag) => (
                  <Badge key={tag} variant="secondary" className="flex items-center gap-1">
                    <span>Tag: {tag}</span>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-4 w-4 p-0 ml-1"
                      onClick={() => removeTagFilter(tag)}
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  </Badge>
                ))}
              </div>
            </div>
          </div>
          
          <Tabs defaultValue="all" value={activeTab} onValueChange={setActiveTab} className="mb-8">
            <TabsList>
              <TabsTrigger value="all">All Bits</TabsTrigger>
              <TabsTrigger value="bookmarked">
                Bookmarked ({bookmarkedBits.length})
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="all" className="mt-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 auto-rows-max">
                {filteredBits.map((bit) => (
                  <BitCard 
                    key={bit.id} 
                    bit={bit} 
                    onBitUpdated={handleBitUpdated}
                    onClick={() => handleBitSelected(bit)}
                    onBookmarkToggle={handleBookmarkToggle}
                  />
                ))}
              </div>
              
              {filteredBits.length === 0 && (
                <div className="text-center py-10">
                  {bits.length > 0 ? (
                    <p className="text-muted-foreground">No bits match your current filters. Try adjusting your search or filters.</p>
                  ) : (
                    <p className="text-muted-foreground">No bits yet. Add your first bit!</p>
                  )}
                </div>
              )}
            </TabsContent>
            
            <TabsContent value="bookmarked" className="mt-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 auto-rows-max">
                {filteredBookmarkedBits.map((bit) => (
                  <BitCard 
                    key={bit.id} 
                    bit={bit} 
                    onBitUpdated={handleBitUpdated}
                    onClick={() => handleBitSelected(bit)}
                    onBookmarkToggle={handleBookmarkToggle}
                  />
                ))}
              </div>
              
              {filteredBookmarkedBits.length === 0 && (
                <div className="text-center py-10">
                  {bookmarkedBits.length > 0 ? (
                    <p className="text-muted-foreground">No bookmarked bits match your current filters. Try adjusting your search or filters.</p>
                  ) : (
                    <p className="text-muted-foreground">No bookmarked bits yet. Bookmark some bits to see them here!</p>
                  )}
                </div>
              )}
            </TabsContent>
          </Tabs>
          
          {selectedBit && (
            <BitDetailModal 
              bit={{...selectedBit, shared_by: selectedBit.shared_by || "You"}} 
              isOpen={!!selectedBit} 
              onClose={() => setSelectedBit(null)} 
              onBitUpdated={handleBitUpdated}
            />
          )}
        </main>
      </div>
    </PageTransition>
  );
};

export default Bits;
