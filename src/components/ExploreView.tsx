import React, { useState, useMemo } from 'react';
import {
  Search,
  Star,
  MapPin,
  Heart,
  Plus,
  Compass,
  ArrowRight,
} from 'lucide-react';
import { Currency, PlaceItem } from '../types';
import { TUNISIA_KNOWLEDGE_BASE } from '../data/knowledgeBase';
import { budgetService } from '../services/budgetEngine';

interface ExploreViewProps {
  currency: Currency;
  onOpenPlaceDetails: (place: PlaceItem) => void;
  onAddToTrip: (place: PlaceItem) => void;
  savedPlaceIds: string[];
  onToggleSave: (place: PlaceItem) => void;
}

export const ExploreView: React.FC<ExploreViewProps> = ({
  currency,
  onOpenPlaceDetails,
  onAddToTrip,
  savedPlaceIds,
  onToggleSave,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedCity, setSelectedCity] = useState<string>('all');

  const categories = [
    { id: 'all', label: 'All' },
    { id: 'city', label: 'Cities' },
    { id: 'beach', label: 'Beaches' },
    { id: 'desert', label: 'Deserts & Oasis' },
    { id: 'culture', label: 'Culture & Ruins' },
    { id: 'family', label: 'Theme Parks & Family' },
  ];

  const filteredPlaces = useMemo(() => {
    return TUNISIA_KNOWLEDGE_BASE.filter((p) => {
      // Search
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const corpus = `${p.title} ${p.shortDescription} ${p.fullDescription} ${p.city} ${p.region}`.toLowerCase();
        if (!corpus.includes(q)) return false;
      }

      // Category matching
      if (selectedCategory !== 'all') {
        if (selectedCategory === 'beach' && p.category !== 'beach') return false;
        if (selectedCategory === 'culture' && p.category !== 'history' && p.category !== 'culture') return false;
        if (selectedCategory === 'desert' && p.category !== 'nature') return false;
        if (selectedCategory === 'family' && p.category !== 'theme_park') return false;
        if (selectedCategory === 'city' && p.category !== 'history' && p.category !== 'hotel' && p.category !== 'food') return false;
      }

      if (selectedCity !== 'all' && p.city.toLowerCase() !== selectedCity.toLowerCase()) {
        return false;
      }

      return true;
    });
  }, [searchQuery, selectedCategory, selectedCity]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-10 animate-fadeIn">
      
      {/* Editorial Header (Matching Top-Center of Reference Image) */}
      <div className="text-center max-w-3xl mx-auto space-y-3">
        <span className="text-xs uppercase font-extrabold tracking-widest text-[#D4AF37] block">
          DISCOVER TUNISIA
        </span>
        <h1 className="font-serif text-3xl sm:text-5xl lg:text-6xl font-bold text-[#0A4D68] tracking-tight">
          Discover Our Destinations
        </h1>
        <p className="text-sm sm:text-base text-slate-600 font-normal max-w-xl mx-auto">
          From ancient cities to stunning beaches, explore the most beautiful places in Tunisia.
        </p>

        {/* Search Bar (Matching Reference Image) */}
        <div className="max-w-xl mx-auto pt-4">
          <div className="relative">
            <Search className="w-5 h-5 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search destinations, cities, or activities..."
              className="w-full pl-12 pr-4 py-3.5 bg-white rounded-full text-xs sm:text-sm text-slate-800 placeholder-slate-400 focus:outline-none border border-[#EADBCE] shadow-sm focus:border-[#088395] focus:ring-4 focus:ring-[#088395]/10 transition-all font-medium"
            />
          </div>
        </div>

        {/* Category Pills (Matching Reference Image: All, Cities, Beaches, Deserts, Mountains, Culture) */}
        <div className="flex items-center justify-center gap-2 overflow-x-auto pt-4 pb-2 scrollbar-none">
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={`px-5 py-2 rounded-full text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
                selectedCategory === cat.id
                  ? 'bg-[#0A4D68] text-white shadow-sm'
                  : 'bg-white hover:bg-slate-100 text-slate-700 border border-[#EADBCE]'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>
      </div>

      {/* Destination Grid (4 Columns / Reference Image Style) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {filteredPlaces.map((place) => {
          const isSaved = savedPlaceIds.includes(place.id);

          return (
            <div
              key={place.id}
              className="bg-white rounded-2xl border border-[#EADBCE] overflow-hidden shadow-xs hover:shadow-xl transition-all duration-300 flex flex-col justify-between group"
            >
              {/* Photo Banner with subtle zoom */}
              <div className="relative h-44 overflow-hidden">
                <img
                  src={place.imageUrl}
                  alt={place.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />

                {/* Rating Badge */}
                <div className="absolute top-2.5 right-2.5 bg-white/95 backdrop-blur-md px-2 py-0.5 rounded-full text-slate-900 text-xs font-bold flex items-center gap-1 shadow-xs">
                  <Star className="w-3 h-3 text-amber-400 fill-amber-400" />
                  <span>{place.rating}</span>
                </div>

                {/* Favorite Heart Button */}
                <button
                  onClick={() => onToggleSave(place)}
                  className="absolute top-2.5 left-2.5 p-1.5 rounded-full bg-black/40 hover:bg-black/70 text-white backdrop-blur-md transition-colors cursor-pointer"
                  title="Save place"
                >
                  <Heart className={`w-3.5 h-3.5 ${isSaved ? 'fill-rose-500 text-rose-500' : ''}`} />
                </button>

                {/* City Location */}
                <div className="absolute bottom-2.5 left-2.5 text-white text-[11px] font-bold bg-[#0A4D68]/80 backdrop-blur-md px-2.5 py-0.5 rounded-md">
                  📍 {place.city}
                </div>
              </div>

              {/* Body */}
              <div className="p-4 flex-1 flex flex-col justify-between">
                <div>
                  <h3 className="font-serif font-bold text-slate-900 text-base leading-snug line-clamp-1 mb-1">
                    {place.title}
                  </h3>
                  <p className="text-xs text-slate-500 line-clamp-1 mb-2 font-medium">
                    {place.shortDescription}
                  </p>
                </div>

                {/* Footnote & Price */}
                <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
                  <span className="text-xs font-bold text-[#088395]">
                    {place.estimatedPrice > 0
                      ? budgetService.formatCurrency(place.estimatedPrice, currency)
                      : 'Free Entry'}
                  </span>

                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => onOpenPlaceDetails(place)}
                      className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold transition-colors cursor-pointer"
                    >
                      Details
                    </button>
                    <button
                      onClick={() => onAddToTrip(place)}
                      className="p-1 rounded-lg bg-[#088395] hover:bg-[#0A4D68] text-white transition-colors cursor-pointer"
                      title="Add to Itinerary"
                    >
                      <Plus className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

    </div>
  );
};
