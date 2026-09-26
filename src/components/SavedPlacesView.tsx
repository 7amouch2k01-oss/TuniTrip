import React from 'react';
import { Bookmark, Star, MapPin, Trash2, ArrowRight } from 'lucide-react';
import { Currency, PlaceItem } from '../types';
import { TUNISIA_KNOWLEDGE_BASE } from '../data/knowledgeBase';
import { budgetService } from '../services/budgetEngine';

interface SavedPlacesViewProps {
  savedPlaceIds: string[];
  currency: Currency;
  onOpenPlaceDetails: (place: PlaceItem) => void;
  onRemoveSaved: (id: string) => void;
  onExploreMore: () => void;
}

export const SavedPlacesView: React.FC<SavedPlacesViewProps> = ({
  savedPlaceIds,
  currency,
  onOpenPlaceDetails,
  onRemoveSaved,
  onExploreMore,
}) => {
  const savedPlaces = TUNISIA_KNOWLEDGE_BASE.filter((p) => savedPlaceIds.includes(p.id));

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 animate-fadeIn">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#EADBCE] pb-6">
        <div>
          <span className="text-[10px] uppercase font-extrabold tracking-widest px-3 py-1 rounded-full bg-[#0A4D68]/10 text-[#0A4D68]">
            My Travel Collection
          </span>
          <h1 className="font-serif font-bold text-2xl sm:text-3xl text-slate-900 mt-2">
            Saved Tunisian Places & Stays
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Bookmark attractions, theme parks, and beachfront hotels to reference during your trip.
          </p>
        </div>

        <button
          onClick={onExploreMore}
          className="px-5 py-2.5 rounded-2xl bg-[#0A4D68] hover:bg-[#088395] text-white text-xs font-bold shadow-md shadow-[#0A4D68]/20 transition-all flex items-center gap-2 cursor-pointer self-start sm:self-auto"
        >
          <span>Explore More Places</span>
          <ArrowRight className="w-3.5 h-3.5 text-[#D4AF37]" />
        </button>
      </div>

      {/* Grid or Empty State */}
      {savedPlaces.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-3xl border border-[#EADBCE] p-8 max-w-lg mx-auto space-y-4">
          <div className="w-16 h-16 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center mx-auto">
            <Bookmark className="w-8 h-8" />
          </div>
          <h3 className="font-display font-bold text-lg text-slate-900">No saved places yet</h3>
          <p className="text-xs text-slate-500">
            Browse our curated collection of Tunisian theme parks, beaches, and historic ruins and click the bookmark button to save them here.
          </p>
          <button
            onClick={onExploreMore}
            className="px-6 py-2.5 rounded-full bg-[#088395] text-white text-xs font-bold shadow-md cursor-pointer hover:bg-[#0A4D68]"
          >
            Start Exploring Tunisia
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {savedPlaces.map((place) => (
            <div
              key={place.id}
              className="bg-white rounded-3xl border border-[#EADBCE] overflow-hidden shadow-xs hover:shadow-lg transition-all flex flex-col justify-between"
            >
              <div className="relative h-44 overflow-hidden">
                <img
                  src={place.imageUrl}
                  alt={place.title}
                  className="w-full h-full object-cover"
                />
                <div className="absolute top-3 left-3 bg-[#0A4D68]/80 backdrop-blur-md px-2.5 py-0.5 rounded-full text-white text-[11px] font-bold">
                  📍 {place.city}
                </div>
                <button
                  onClick={() => onRemoveSaved(place.id)}
                  className="absolute top-3 right-3 p-1.5 rounded-full bg-black/60 hover:bg-red-600 text-white backdrop-blur-md transition-colors cursor-pointer"
                  title="Remove from saved"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>

              <div className="p-5 flex-1 flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between text-xs text-slate-500 mb-1">
                    <span className="uppercase font-bold text-[10px] text-[#088395]">
                      {place.category.replace('_', ' ')}
                    </span>
                    <span className="flex items-center gap-1 text-slate-700 font-bold">
                      <Star className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
                      <span>{place.rating}</span>
                    </span>
                  </div>

                  <h3 className="font-display font-bold text-slate-900 text-base leading-snug line-clamp-1 mb-1">
                    {place.title}
                  </h3>
                  <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed">
                    {place.shortDescription}
                  </p>
                </div>

                <div className="pt-3 border-t border-slate-100 flex items-center justify-between mt-3">
                  <span className="font-bold text-sm text-[#0A4D68]">
                    {place.estimatedPrice > 0
                      ? budgetService.formatCurrency(place.estimatedPrice, currency)
                      : 'Free'}
                  </span>
                  <button
                    onClick={() => onOpenPlaceDetails(place)}
                    className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-[#088395] hover:text-white text-slate-800 text-xs font-bold transition-all cursor-pointer"
                  >
                    View Details
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

    </div>
  );
};
