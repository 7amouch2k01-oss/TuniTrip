import React, { useState } from 'react';
import { Star, Clock, ArrowRight, Plus, Sparkles, Compass } from 'lucide-react';
import { Currency } from '../types';
import { budgetService } from '../services/budgetEngine';

interface ExperienceItem {
  id: string;
  category: 'adventure' | 'culture' | 'food' | 'nature' | 'wellness' | 'family';
  title: string;
  location: string;
  duration: string;
  priceUSD: number;
  rating: number;
  reviewCount: number;
  imageUrl: string;
  description: string;
}

const EXPERIENCES: ExperienceItem[] = [
  {
    id: 'exp-sahara-camp',
    category: 'adventure',
    title: 'Sahara Desert Nomadic Camp & Stargazing',
    location: 'Douz & Grand Erg Oriental',
    duration: '2 Days / 1 Night',
    priceUSD: 48,
    rating: 4.9,
    reviewCount: 914,
    imageUrl: 'https://images.unsplash.com/photo-1509316975850-ff9c5deb0cd9?auto=format&fit=crop&w=800&q=80',
    description: 'Camel trek into the rolling dunes of the Sahara, traditional campfire bread baking in the sand, and overnight in Berber tents under dazzling celestial skies.',
  },
  {
    id: 'exp-cooking-class',
    category: 'food',
    title: 'Tunis Medina Market Walk & Cooking Atelier',
    location: 'Medina of Tunis',
    duration: '3.5 Hours',
    priceUSD: 25,
    rating: 4.8,
    reviewCount: 640,
    imageUrl: 'https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=800&q=80',
    description: 'Shop for fresh coriander, saffron, and wild fish in the historic souks with a master chef, then prepare authentic grouper couscous and crispy briks.',
  },
  {
    id: 'exp-carthage-land',
    category: 'family',
    title: 'Carthage Land Theme Park & Aqua Land Combo',
    location: 'Yasmine Hammamet',
    duration: 'Full Day Pass',
    priceUSD: 16,
    rating: 4.6,
    reviewCount: 4820,
    imageUrl: 'https://images.unsplash.com/photo-1513889961551-628c1e5e2ee9?auto=format&fit=crop&w=800&q=80',
    description: 'All-inclusive pass to 25+ rollercoasters, 5D cinema, Hannibal flume rides, and the connected Aqua Land wave pool and giant water slides.',
  },
  {
    id: 'exp-camel-ride',
    category: 'nature',
    title: 'Golden Hour Camel Trek in Tozeur Dunes',
    location: 'Tozeur & Chott El Djerid',
    duration: 'Half Day',
    priceUSD: 18,
    rating: 4.7,
    reviewCount: 1102,
    imageUrl: 'https://images.unsplash.com/photo-1533105079780-92b9be482077?auto=format&fit=crop&w=800&q=80',
    description: 'Ride across shimmering salt flats and golden dunes as the sun sets over the palm groves, led by local Berber camel masters.',
  },
  {
    id: 'exp-hammam',
    category: 'wellness',
    title: 'Traditional Royal Hammam, Gommage & Jasmine Oil',
    location: 'Sidi Bou Said',
    duration: '2 Hours',
    priceUSD: 35,
    rating: 4.9,
    reviewCount: 780,
    imageUrl: 'https://images.unsplash.com/photo-1540555700478-4be289fbecef?auto=format&fit=crop&w=800&q=80',
    description: 'Relax inside a candlelit Andalusian vaulted bathhouse with eucalyptus steam, olive oil black soap exfoliation, and neroli massage.',
  },
  {
    id: 'exp-catamaran',
    category: 'adventure',
    title: 'Private Catamaran Coastal Voyage & Snorkeling',
    location: 'Port El Kantaoui / Hammamet',
    duration: '3.5 Hours',
    priceUSD: 22,
    rating: 4.8,
    reviewCount: 890,
    imageUrl: 'https://images.unsplash.com/photo-1506953823976-52e1fdc0149a?auto=format&fit=crop&w=800&q=80',
    description: 'Sail the calm turquoise gulf on a luxury catamaran with dolphin watching, open-sea swimming stops, and chilled Mediterranean fruit served onboard.',
  },
];

interface UnforgettableExperiencesProps {
  currency: Currency;
  onSelectExperience?: (exp: ExperienceItem) => void;
  onStartPlanningWithPrompt?: (prompt: string) => void;
}

export const UnforgettableExperiences: React.FC<UnforgettableExperiencesProps> = ({
  currency,
  onSelectExperience,
  onStartPlanningWithPrompt,
}) => {
  const [filter, setFilter] = useState<string>('all');

  const filtered = filter === 'all'
    ? EXPERIENCES
    : EXPERIENCES.filter((e) => e.category === filter);

  return (
    <section className="py-24 bg-white border-t border-[#EADBCE]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-12">
          <span className="text-xs uppercase font-extrabold tracking-wider px-3.5 py-1 rounded-full bg-[#C5A059]/15 text-[#B38E46] border border-[#C5A059]/30">
            Handpicked Local Activities
          </span>
          <h2 className="font-serif text-3xl sm:text-5xl text-[#0A4D68] mt-3 tracking-tight">
            Unforgettable Experiences
          </h2>
          <p className="mt-3 text-xs sm:text-sm text-slate-500 font-medium">
            Live real moments and discover the true soul of Tunisia through authentic local encounters.
          </p>
        </div>

        {/* Filter Pills */}
        <div className="flex items-center justify-center gap-2 overflow-x-auto pb-4 scrollbar-none mb-10">
          {[
            { id: 'all', label: 'All' },
            { id: 'adventure', label: 'Adventure' },
            { id: 'family', label: 'Family & Theme Parks' },
            { id: 'culture', label: 'Culture' },
            { id: 'food', label: 'Food & Wine' },
            { id: 'nature', label: 'Nature & Desert' },
            { id: 'wellness', label: 'Wellness' },
          ].map((cat) => (
            <button
              key={cat.id}
              onClick={() => setFilter(cat.id)}
              className={`px-4 py-2 rounded-full text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
                filter === cat.id
                  ? 'bg-[#088395] text-white shadow-xs'
                  : 'bg-[#FAF7F2] hover:bg-[#F4EFE6] text-slate-700 border border-[#EADBCE]'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>

        {/* Cards Grid (3 Columns) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filtered.map((item) => (
            <div
              key={item.id}
              className="bg-[#FAF7F2] rounded-3xl border border-[#EADBCE] overflow-hidden shadow-xs hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex flex-col justify-between group"
            >
              <div className="relative h-48 overflow-hidden">
                <img
                  src={item.imageUrl}
                  alt={item.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />

                <div className="absolute top-3 left-3 bg-black/60 backdrop-blur-md px-2.5 py-1 rounded-full text-white text-[11px] font-bold">
                  📍 {item.location.split('&')[0]}
                </div>

                <div className="absolute top-3 right-3 bg-white/95 backdrop-blur-md px-2 py-0.5 rounded-full text-slate-900 text-xs font-bold flex items-center gap-1 shadow-xs">
                  <Star className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
                  <span>{item.rating}</span>
                </div>

                <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between text-white text-xs">
                  <span className="font-semibold text-slate-200">⏱ {item.duration}</span>
                  <span className="font-bold bg-[#088395] px-2.5 py-0.5 rounded-full">
                    From {budgetService.formatCurrency(item.priceUSD, currency)}
                  </span>
                </div>
              </div>

              <div className="p-5 flex-1 flex flex-col justify-between">
                <div>
                  <h3 className="font-serif font-bold text-slate-900 text-base leading-snug line-clamp-1 mb-1.5">
                    {item.title}
                  </h3>
                  <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed">
                    {item.description}
                  </p>
                </div>

                <div className="pt-4 border-t border-[#EADBCE]/60 flex items-center justify-between mt-4">
                  <span className="text-[11px] text-slate-400">
                    {item.reviewCount.toLocaleString()} verified bookings
                  </span>

                  <button
                    onClick={() => {
                      if (onStartPlanningWithPrompt) {
                        onStartPlanningWithPrompt(`I want to include ${item.title} in my Tunisia trip`);
                      }
                    }}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#088395] hover:bg-[#0A4D68] text-white text-xs font-bold shadow-xs transition-colors cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Add to Trip</span>
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
};
