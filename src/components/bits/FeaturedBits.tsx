
import React from "react";
import { Plus } from "lucide-react";

interface FeaturedBitProps {
  imageUrl: string;
}

const FeaturedBit: React.FC<FeaturedBitProps> = ({ imageUrl }) => {
  return (
    <div className="relative rounded-2xl overflow-hidden h-32 w-full cursor-pointer group">
      <img 
        src={imageUrl} 
        alt="Featured bit" 
        className="w-full h-full object-cover transition-transform duration-200 group-hover:scale-105"
      />
      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors duration-200"></div>
      <button className="absolute top-2 right-2 bg-white/90 dark:bg-black/70 p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-200">
        <Plus size={16} />
      </button>
    </div>
  );
};

interface FeaturedBitsProps {
  images: string[];
}

const FeaturedBits: React.FC<FeaturedBitsProps> = ({ images }) => {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-8 gap-2 mb-8">
      {images.map((imageUrl, index) => (
        <FeaturedBit key={index} imageUrl={imageUrl} />
      ))}
    </div>
  );
};

export default FeaturedBits;
