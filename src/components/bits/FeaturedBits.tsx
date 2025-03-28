
import React, { useState } from "react";
import { Plus } from "lucide-react";
import { 
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious
} from "@/components/ui/carousel";
import { useInterval } from "@/hooks/useInterval";

interface FeaturedBitProps {
  imageUrl: string;
  title?: string;
}

const FeaturedBit: React.FC<FeaturedBitProps> = ({ imageUrl, title }) => {
  return (
    <div className="relative rounded-2xl overflow-hidden h-32 w-full cursor-pointer group">
      <img 
        src={imageUrl} 
        alt={title || "Featured bit"} 
        className="w-full h-full object-cover transition-transform duration-200 group-hover:scale-105"
      />
      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors duration-200"></div>
      <button className="absolute top-2 right-2 bg-white/90 dark:bg-black/70 p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-200">
        <Plus size={16} className="text-black dark:text-white" />
      </button>
      {title && (
        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-2">
          <p className="text-white text-sm font-medium truncate">{title}</p>
        </div>
      )}
    </div>
  );
};

interface FeaturedBitsProps {
  images: string[];
  titles?: string[];
}

const FeaturedBits: React.FC<FeaturedBitsProps> = ({ images, titles = [] }) => {
  const [api, setApi] = useState<any>(null);

  // Auto-scroll carousel every 3 seconds
  useInterval(() => {
    if (api) {
      api.scrollNext();
    }
  }, 3000);

  return (
    <Carousel
      opts={{
        align: "start",
        loop: true,
        dragFree: true,
      }}
      className="w-full mb-8"
      setApi={setApi}
    >
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold">Categories</h2>
      </div>
      <div className="relative">
        <CarouselContent className="-ml-2 md:-ml-4">
          {images.map((imageUrl, index) => (
            <CarouselItem key={index} className="pl-2 md:pl-4 basis-1/3 sm:basis-1/4 md:basis-1/5 lg:basis-1/6">
              <FeaturedBit 
                imageUrl={imageUrl} 
                title={titles[index] || `Category ${index + 1}`} 
              />
            </CarouselItem>
          ))}
        </CarouselContent>
        <CarouselPrevious className="left-0 bg-white dark:bg-black shadow-md" />
        <CarouselNext className="right-0 bg-white dark:bg-black shadow-md" />
      </div>
    </Carousel>
  );
};

export default FeaturedBits;
