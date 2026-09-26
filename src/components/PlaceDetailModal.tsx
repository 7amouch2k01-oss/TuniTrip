import React from 'react';
import {
  X,
  Star,
  MapPin,
  Clock,
  DollarSign,
  ShieldCheck,
  ExternalLink,
  Plus,
  Check,
  Sparkles,
  Heart,
  Compass,
} from 'lucide-react';
import { Currency, PlaceItem } from '../types';
import { budgetService } from '../services/budgetEngine';

interface PlaceDetailModalProps {
  place: PlaceItem | null;
  onClose: () => void;
  currency: Currency;
  onAddToTrip: (place: PlaceItem) => void;
  isSaved?: boolean;
  onToggleSave?: (place: PlaceItem) => void;
}

export const PlaceDetailModal: React.FC<PlaceDetailModalProps> = ({
  place,
  onClose,
  currency,
  onAddToTrip,
  isSaved = false,
  onToggleSave,
}) => {
  if (!place) return null;

  // Curated things to do for the destination
  const thingsToDo = [
    `Experience the signature attractions of ${place.title}`,
    `Discover panoramic Mediterranean views & coastal walkways`,
    `Taste traditional local delicacies, mint tea & fresh pastries`,
    `Explore verified UNESCO & historical monuments nearby`,
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/70 backdrop-blur-md animate-fadeIn">
      <div className="bg-white rounded-3xl max-w-3xl w-full max-h-[92vh] overflow-y-auto shadow-2xl border border-[#EADBCE]">
        
        {/* Editorial Top Gallery Layout (Matching Reference Image Middle-Left) */}
        <div className="p-4 sm:p-6 pb-0">
          <div className="relative rounded-2xl overflow-hidden shadow-md">
            
            {/* Main Big Photo */}
            <div className="h-64 sm:h-80 w-full relative">
              <img
                src={place.imageUrl}
                alt={place.title}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
              
              {/* Close Button */}
              <button
                onClick={onClose}
                className="absolute top-4 right-4 p-2 rounded-full bg-black/60 hover:bg-black/90 text-white backdrop-blur-md transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>

              {/* Title & Metadata over Main Image */}
              <div className="absolute bottom-4 left-4 right-4 text-white">
                <div className="flex items-center gap-2 mb-1.5">
                  <span className="px-3 py-1 rounded-full bg-[#088395] text-white text-[10px] uppercase font-bold tracking-wider">
                    {place.category.replace('_', ' ')}
                  </span>
                  <span className="flex items-center gap-1 bg-black/50 backdrop-blur-md px-2.5 py-0.5 rounded-full text-xs font-bold text-amber-300">
                    <Star className="w-3.5 h-3.5 fill-amber-300" />
                    <span>{place.rating} ({place.reviewCount.toLocaleString()} reviews)</span>
                  </span>
                </div>
                <h2 className="font-serif text-2xl sm:text-4xl font-bold leading-tight">
                  {place.title}
                </h2>
                <div className="flex items-center gap-2 text-xs text-slate-200 mt-1 font-medium">
                  <MapPin className="w-3.5 h-3.5 text-[#C5A059]" />
                  <span>{place.city}, {place.region} • Tunisia</span>
                </div>
              </div>
            </div>

          </div>
        </div>

        {/* Content Body (Matching Reference Image Editorial Details) */}
        <div className="p-6 sm:p-8 space-y-6">
          
          {/* Key Quick Badges */}
          <div className="flex flex-wrap items-center gap-4 text-xs font-semibold text-slate-700 pb-4 border-b border-slate-100">
            <span className="flex items-center gap-1.5">
              <Star className="w-4 h-4 text-amber-500 fill-amber-500" />
              <strong>{place.rating}</strong> (1.2k+ reviews)
            </span>
            <span className="text-slate-300">•</span>
            <span className="flex items-center gap-1.5">
              <Compass className="w-4 h-4 text-[#088395]" />
              8+ places & viewpoints
            </span>
            <span className="text-slate-300">•</span>
            <span className="flex items-center gap-1.5">
              <Clock className="w-4 h-4 text-[#C5A059]" />
              1 - 2 days recommended
            </span>
          </div>

          {/* Description */}
          <div>
            <p className="text-sm text-slate-600 leading-relaxed font-normal">
              {place.fullDescription}
            </p>
          </div>

          {/* Side by Side: Mini Map Preview & Top Things To Do (Reference Image Layout) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
            
            {/* Top Things To Do */}
            <div className="p-4 rounded-2xl bg-[#FAF7F2] border border-[#EADBCE]">
              <h4 className="font-serif font-bold text-sm text-[#0A4D68] mb-3">
                Top things to do
              </h4>
              <ol className="space-y-2 text-xs text-slate-700">
                {thingsToDo.map((todo, idx) => (
                  <li key={idx} className="flex items-start gap-2">
                    <span className="font-bold text-[#088395] shrink-0">{idx + 1}.</span>
                    <span>{todo}</span>
                  </li>
                ))}
              </ol>
            </div>

            {/* Pricing & Hours Card */}
            <div className="p-4 rounded-2xl bg-[#FAF7F2] border border-[#EADBCE] flex flex-col justify-between">
              <div>
                <h4 className="font-serif font-bold text-sm text-[#0A4D68] mb-2">
                  Visitor Practicalities
                </h4>
                <div className="space-y-2 text-xs">
                  <div className="flex justify-between">
                    <span className="text-slate-500">Estimated Cost:</span>
                    <span className="font-bold text-[#088395]">
                      {place.estimatedPrice > 0
                        ? `${budgetService.formatCurrency(place.estimatedPrice, currency)} / ${place.priceUnit.replace('_', ' ')}`
                        : 'Free Entry'}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Opening Hours:</span>
                    <span className="font-semibold text-slate-800">{place.openingHours || 'Open Daily'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Atmosphere:</span>
                    <span className="font-semibold text-slate-800">{place.calmAtmosphere ? 'Peaceful & Calm' : 'Vibrant'}</span>
                  </div>
                </div>
              </div>

              {/* Source Verification */}
              <div className="mt-4 pt-2 border-t border-slate-200 text-[11px] text-slate-500 flex items-center justify-between">
                <span className="truncate">Source: {place.sourceName}</span>
                <span className="text-emerald-700 font-bold flex items-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  <span>Verified</span>
                </span>
              </div>
            </div>

          </div>

          {/* Why Matched Badge */}
          {place.matchReason && (
            <div className="p-3.5 rounded-2xl bg-[#E8F6F8] border border-[#088395]/20 text-xs text-[#0A4D68] flex items-start gap-2">
              <Sparkles className="w-4 h-4 text-[#088395] shrink-0 mt-0.5" />
              <span><strong>Why TuniTrip Recommends This:</strong> {place.matchReason}</span>
            </div>
          )}

          {/* Action Footer: Golden "Add to your trip" + Favorite Heart (Matching Reference Image) */}
          <div className="flex items-center gap-3 pt-4 border-t border-slate-100">
            <button
              onClick={() => {
                onAddToTrip(place);
                onClose();
              }}
              className="flex-1 py-3.5 px-6 rounded-2xl bg-[#D4AF37] hover:bg-[#C5A059] text-[#0A4D68] font-bold text-sm shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer transform active:scale-95"
            >
              <Plus className="w-4 h-4" />
              <span>Add to your trip</span>
            </button>

            {onToggleSave && (
              <button
                onClick={() => onToggleSave(place)}
                className={`p-3.5 rounded-2xl border transition-all cursor-pointer ${
                  isSaved
                    ? 'bg-rose-50 border-rose-300 text-rose-600'
                    : 'bg-white border-[#EADBCE] text-slate-400 hover:text-rose-500 hover:bg-slate-50'
                }`}
                title={isSaved ? 'Saved to collection' : 'Save place'}
              >
                <Heart className={`w-5 h-5 ${isSaved ? 'fill-rose-500 text-rose-500' : ''}`} />
              </button>
            )}
          </div>

        </div>
      </div>
    </div>
  );
};
