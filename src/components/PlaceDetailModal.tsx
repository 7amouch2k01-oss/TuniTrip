import React from 'react';
import {
  X,
  Star,
  MapPin,
  Clock,
  ShieldCheck,
  Plus,
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

  const thingsToDo = [
    `Experience the signature attractions of ${place.title}`,
    `Discover panoramic Mediterranean views & coastal walkways`,
    `Taste traditional local delicacies, mint tea & fresh pastries`,
    `Explore verified UNESCO & historical monuments nearby`,
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/70 backdrop-blur-sm animate-fadeIn">
      <div className="bg-white rounded-2xl max-w-3xl w-full max-h-[92vh] overflow-y-auto shadow-2xl border border-neutral-200">
        
        {/* Editorial Top Gallery Layout */}
        <div className="p-4 sm:p-6 pb-0">
          <div className="relative rounded-xl overflow-hidden shadow-sm border border-neutral-200 bg-neutral-100">
            
            {/* Main Photo (with monochrome grayscale filter) */}
            <div className="h-64 sm:h-80 w-full relative">
              <img
                src={place.imageUrl}
                alt={place.title}
                className="w-full h-full object-cover grayscale contrast-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />
              
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
                  <span className="px-3 py-0.5 rounded-full bg-neutral-900 border border-neutral-700 text-white text-[10px] uppercase font-bold tracking-wider">
                    {place.category.replace('_', ' ')}
                  </span>
                  <span className="flex items-center gap-1 bg-black/60 backdrop-blur-md px-2.5 py-0.5 rounded-full text-xs font-bold text-white border border-neutral-700">
                    <Star className="w-3.5 h-3.5 fill-white text-white" />
                    <span>{place.rating} ({place.reviewCount.toLocaleString()} reviews)</span>
                  </span>
                </div>
                <h2 className="font-bold text-2xl sm:text-3xl leading-tight">
                  {place.title}
                </h2>
                <div className="flex items-center gap-2 text-xs text-neutral-300 mt-1 font-medium">
                  <MapPin className="w-3.5 h-3.5 text-neutral-400" />
                  <span>{place.city}, {place.region} • Tunisia</span>
                </div>
              </div>
            </div>

          </div>
        </div>

        {/* Content Body */}
        <div className="p-6 sm:p-8 space-y-6">
          
          {/* Key Quick Badges */}
          <div className="flex flex-wrap items-center gap-4 text-xs font-semibold text-neutral-700 pb-4 border-b border-neutral-200">
            <span className="flex items-center gap-1.5">
              <Star className="w-4 h-4 text-neutral-900 fill-neutral-900" />
              <strong>{place.rating}</strong> (1.2k+ reviews)
            </span>
            <span className="text-neutral-300">•</span>
            <span className="flex items-center gap-1.5">
              <Compass className="w-4 h-4 text-neutral-700" />
              8+ places & viewpoints
            </span>
            <span className="text-neutral-300">•</span>
            <span className="flex items-center gap-1.5">
              <Clock className="w-4 h-4 text-neutral-700" />
              1 - 2 days recommended
            </span>
          </div>

          {/* Description */}
          <div>
            <p className="text-sm text-neutral-600 leading-relaxed font-normal">
              {place.fullDescription}
            </p>
          </div>

          {/* Side by Side: Things To Do & Practicalities */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
            
            {/* Top Things To Do */}
            <div className="p-4 rounded-xl bg-neutral-50 border border-neutral-200">
              <h4 className="font-bold text-sm text-neutral-900 mb-3">
                Top things to do
              </h4>
              <ol className="space-y-2 text-xs text-neutral-700">
                {thingsToDo.map((todo, idx) => (
                  <li key={idx} className="flex items-start gap-2">
                    <span className="font-bold text-neutral-900 shrink-0">{idx + 1}.</span>
                    <span>{todo}</span>
                  </li>
                ))}
              </ol>
            </div>

            {/* Pricing & Hours Card */}
            <div className="p-4 rounded-xl bg-neutral-50 border border-neutral-200 flex flex-col justify-between">
              <div>
                <h4 className="font-bold text-sm text-neutral-900 mb-2">
                  Visitor Practicalities
                </h4>
                <div className="space-y-2 text-xs">
                  <div className="flex justify-between">
                    <span className="text-neutral-500">Estimated Cost:</span>
                    <span className="font-bold text-neutral-900">
                      {place.estimatedPrice > 0
                        ? `${budgetService.formatCurrency(place.estimatedPrice, currency)} / ${place.priceUnit.replace('_', ' ')}`
                        : 'Free Entry'}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-neutral-500">Opening Hours:</span>
                    <span className="font-semibold text-neutral-800">{place.openingHours || 'Open Daily'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-neutral-500">Atmosphere:</span>
                    <span className="font-semibold text-neutral-800">{place.calmAtmosphere ? 'Peaceful & Calm' : 'Vibrant'}</span>
                  </div>
                </div>
              </div>

              {/* Source Verification */}
              <div className="mt-4 pt-2 border-t border-neutral-200 text-[11px] text-neutral-500 flex items-center justify-between">
                <span className="truncate">Source: {place.sourceName}</span>
                <span className="text-neutral-900 font-bold flex items-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  <span>Verified</span>
                </span>
              </div>
            </div>

          </div>

          {/* Why Matched Badge */}
          {place.matchReason && (
            <div className="p-3.5 rounded-xl bg-neutral-50 border border-neutral-200 text-xs text-neutral-700 flex items-start gap-2">
              <Sparkles className="w-4 h-4 text-neutral-700 shrink-0 mt-0.5" />
              <span><strong>Why TuniTrip Recommends This:</strong> {place.matchReason}</span>
            </div>
          )}

          {/* Action Footer */}
          <div className="flex items-center gap-3 pt-4 border-t border-neutral-100">
            <button
              onClick={() => {
                onAddToTrip(place);
                onClose();
              }}
              className="flex-1 py-3 px-6 rounded-xl bg-neutral-900 hover:bg-neutral-800 text-white font-bold text-sm shadow-xs transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Add to your trip</span>
            </button>

            {onToggleSave && (
              <button
                onClick={() => onToggleSave(place)}
                className={`p-3 rounded-xl border transition-all cursor-pointer ${
                  isSaved
                    ? 'bg-neutral-900 border-neutral-900 text-white'
                    : 'bg-white border-neutral-200 text-neutral-400 hover:text-neutral-900 hover:bg-neutral-50'
                }`}
                title={isSaved ? 'Saved to collection' : 'Save place'}
              >
                <Heart className={`w-5 h-5 ${isSaved ? 'fill-white text-white' : ''}`} />
              </button>
            )}
          </div>

        </div>
      </div>
    </div>
  );
};
