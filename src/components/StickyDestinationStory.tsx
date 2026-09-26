import React, { useState } from 'react';
import { ArrowRight, Star, Clock, Sparkles, MapPin, Heart, Plus } from 'lucide-react';

interface DestinationItem {
  id: string;
  name: string;
  arabicName: string;
  tagline: string;
  description: string;
  bestFor: string;
  duration: string;
  placesCount: number;
  rating: number;
  imageUrl: string;
  highlights: string[];
}

const DESTINATIONS: DestinationItem[] = [
  {
    id: 'sidi-bou-said',
    name: 'Sidi Bou Said',
    arabicName: 'سيدي بوسعيد',
    tagline: 'Blue & white cliffside beauty overlooking the Mediterranean',
    description: 'A romantic village of cobalt blue doors, whitewashed alleys, and fragrant jasmine. Famous for Baron d’Erlanger’s palace and sunset mint tea crowned with pine nuts at Café des Délices.',
    bestFor: 'Culture · Photography · Calm · Sunsets',
    duration: '1 - 2 Days',
    placesCount: 8,
    rating: 4.8,
    imageUrl: 'https://images.unsplash.com/photo-1534447677768-be436bb09401?auto=format&fit=crop&w=1200&q=80',
    highlights: ['Café des Délices sunset terrace', 'Ennejma Ezzahra palace', 'Cobbled pedestrian alleys'],
  },
  {
    id: 'hammamet',
    name: 'Hammamet',
    arabicName: 'الحمامات',
    tagline: 'Golden beaches, fragrant jasmine & Carthage Land entertainment',
    description: 'Tunisia’s original resort gem combining turquoise swimming waters, luxury thalassotherapy hotels, the Carthage Land amusement and aqua park, and quiet seaside medina walls.',
    bestFor: 'Beaches · Family & Games · Thalasso · Swimming',
    duration: '3 - 5 Days',
    placesCount: 14,
    rating: 4.7,
    imageUrl: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=1200&q=80',
    highlights: ['Carthage Land & Aqua Land passes', 'Hasdrubal seawater lagoon pools', 'Seafront 15th-century Kasbah'],
  },
  {
    id: 'carthage',
    name: 'Carthage',
    arabicName: 'قرطاج',
    tagline: 'Ancient maritime superpower & UNESCO Roman thermal monuments',
    description: 'Legendary city founded in 814 BC by Queen Dido. Walk among the monumental pillars of the Antonine Baths at the sea edge and explore Byrsa Hill overlooking the turquoise Gulf of Tunis.',
    bestFor: 'History · UNESCO Antiquities · Vistas',
    duration: '1 Day',
    placesCount: 10,
    rating: 4.7,
    imageUrl: 'https://images.unsplash.com/photo-1552832230-c0197dd311b5?auto=format&fit=crop&w=1200&q=80',
    highlights: ['Antonine Roman Thermal Baths', 'Byrsa Hill Punic acropolis', 'Ancient Punic military ports'],
  },
  {
    id: 'tunis',
    name: 'Tunis',
    arabicName: 'تونس العاصمة',
    tagline: 'The capital: UNESCO 9th-century Medina & Bardo mosaic palace',
    description: 'The energetic cultural heartbeat of the nation. Discover 700 protected monuments in the vaulted Medina souks, dine in restored Ottoman palaces, and marvel at the world’s greatest Roman mosaics.',
    bestFor: 'History · Gastronomy · Artisanal Souks',
    duration: '2 - 3 Days',
    placesCount: 18,
    rating: 4.6,
    imageUrl: 'https://images.unsplash.com/photo-1518684079-3c830dcef090?auto=format&fit=crop&w=1200&q=80',
    highlights: ['UNESCO Medina & Zitouna Mosque', 'Bardo National Museum mosaics', 'Palatial dining at Dar El Jeld'],
  },
  {
    id: 'el-jem',
    name: 'El Jem',
    arabicName: 'الجم',
    tagline: 'The 3rd largest Roman Colosseum on Earth rising over olive plains',
    description: 'A colossal UNESCO World Heritage Roman amphitheater that once seated 35,000 spectators. Climb the upper arches and venture deep into the underground vaults where gladiators prepared.',
    bestFor: 'Ancient Rome · World Wonder · Architecture',
    duration: '1 Day',
    placesCount: 5,
    rating: 4.9,
    imageUrl: 'https://images.unsplash.com/photo-1548625361-197e42d76f8e?auto=format&fit=crop&w=1200&q=80',
    highlights: ['Colosseum arena floor & arches', 'Gladiatorial subterranean tunnels', 'El Jem Archaeological Museum'],
  },
  {
    id: 'sousse',
    name: 'Sousse & Port El Kantaoui',
    arabicName: 'سوسة والقنطاوي',
    tagline: 'Medieval maritime Ribat fortress & luxury yacht marina walks',
    description: 'The pearl of the Sahel coast. Features the 9th-century Ribat watchtowers, cobbled spice souks, and the elegant Port El Kantaoui marina offering pirate ship cruises and watersports.',
    bestFor: 'Family Fun · Sailing · Coastal Heritage',
    duration: '2 - 3 Days',
    placesCount: 12,
    rating: 4.6,
    imageUrl: 'https://images.unsplash.com/photo-1509198397868-475647b2a1e5?auto=format&fit=crop&w=1200&q=80',
    highlights: ['Port El Kantaoui pirate ship cruise', '9th-century Sousse Ribat fortress', 'AquaSplash water park'],
  },
  {
    id: 'mahdia',
    name: 'Mahdia',
    arabicName: 'المهدية',
    tagline: 'Untouched turquoise waters & powder-soft white sand beaches',
    description: 'Tunisia’s most peaceful coastal sanctuary. Uncrowded shallow seas, ancient Fatimid sea gates, sunset walks by the marine cemetery, and exceptional fresh Mediterranean seafood.',
    bestFor: 'Pure Swimming · Serenity · Uncrowded Shores',
    duration: '2 - 3 Days',
    placesCount: 7,
    rating: 4.8,
    imageUrl: 'https://images.unsplash.com/photo-1519046904884-53103b34b206?auto=format&fit=crop&w=1200&q=80',
    highlights: ['Crystal-clear Salakta & Corniche beach', 'Skifa El Kahla grand black gate', 'Cap Afrique sunset lookout'],
  },
  {
    id: 'djerba',
    name: 'Djerba',
    arabicName: 'جربة',
    tagline: 'The mythical island of peace, white domes & crocodile lagoons',
    description: 'Homer’s island of the lotus-eaters. Characterized by tranquil palm groves, pristine shallow beaches, Djerba Explore crocodile park, and the historic El Ghriba synagogue.',
    bestFor: 'Island Peace · Family · Wildlife · Beaches',
    duration: '3 - 4 Days',
    placesCount: 15,
    rating: 4.8,
    imageUrl: 'https://images.unsplash.com/photo-1544551763-46a013bb70d5?auto=format&fit=crop&w=1200&q=80',
    highlights: ['Djerba Explore 400+ crocodile farm', 'Sidi Mahres turquoise beach', 'Guellala pottery village'],
  },
  {
    id: 'tozeur',
    name: 'Tozeur & The Sahara',
    arabicName: 'توزر والجنوب الصحراوي',
    tagline: 'Verdant date palm oasis, Berber troglodytes & desert dunes',
    description: 'Gateway to the southern desert. Experience horse carriage rides through 400,000 date palms, Star Wars film locations in the Sahara dunes, and Matmata subterranean Berber dwellings.',
    bestFor: 'Desert Adventure · Star Wars · Berber Culture',
    duration: '2 - 3 Days',
    placesCount: 11,
    rating: 4.8,
    imageUrl: 'https://images.unsplash.com/photo-1509316975850-ff9c5deb0cd9?auto=format&fit=crop&w=1200&q=80',
    highlights: ['Eden Palm date eco-reserve', 'Matmata underground cave homes', 'Mos Espa Star Wars desert set'],
  },
];

interface StickyDestinationStoryProps {
  onPlanDestination?: (destName: string) => void;
}

export const StickyDestinationStory: React.FC<StickyDestinationStoryProps> = ({
  onPlanDestination,
}) => {
  const [selectedId, setSelectedId] = useState<string>('sidi-bou-said');

  const currentDest = DESTINATIONS.find((d) => d.id === selectedId) || DESTINATIONS[0];

  return (
    <section className="py-24 bg-[#F4EFE6]/50 border-t border-[#EADBCE]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-16">
          <div>
            <span className="text-xs uppercase font-extrabold tracking-wider px-3.5 py-1 rounded-full bg-[#088395]/10 text-[#088395] border border-[#088395]/20">
              Editorial Destination Index
            </span>
            <h2 className="font-serif text-3xl sm:text-5xl text-[#0A4D68] mt-3 tracking-tight">
              Destinations Worth Remembering
            </h2>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 max-w-md font-medium">
            From the whitewashed cliffs of the north to ancient Roman arenas and golden southern dunes.
          </p>
        </div>

        {/* Destination Layout: Interactive List on Left, Sticky Feature Card on Right */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Left Column: Interactive Destination Selector List (5 cols) */}
          <div className="lg:col-span-5 space-y-2">
            {DESTINATIONS.map((dest) => {
              const isSelected = dest.id === selectedId;

              return (
                <div
                  key={dest.id}
                  onClick={() => setSelectedId(dest.id)}
                  className={`p-4 sm:p-5 rounded-2xl cursor-pointer transition-all duration-300 border flex items-center justify-between ${
                    isSelected
                      ? 'bg-white border-[#088395] shadow-lg shadow-[#088395]/10 translate-x-1.5'
                      : 'bg-white/60 hover:bg-white border-[#EADBCE]/80 hover:border-[#088395]/40'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <span className={`w-2 h-2 rounded-full transition-all ${
                      isSelected ? 'bg-[#088395] scale-125' : 'bg-slate-300'
                    }`} />
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className={`font-serif text-lg font-bold transition-colors ${
                          isSelected ? 'text-[#088395]' : 'text-slate-900'
                        }`}>
                          {dest.name}
                        </h3>
                        <span className="text-[10px] text-slate-400 font-sans">{dest.arabicName}</span>
                      </div>
                      <p className="text-[11px] text-slate-500 line-clamp-1 mt-0.5">
                        {dest.tagline}
                      </p>
                    </div>
                  </div>

                  <div className="text-right shrink-0">
                    <span className="text-xs font-bold text-slate-700 flex items-center gap-1">
                      <Star className="w-3 h-3 text-amber-400 fill-amber-400" />
                      <span>{dest.rating}</span>
                    </span>
                    <span className="text-[10px] text-slate-400">{dest.duration}</span>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Right Column: Sticky Large Feature Showcase (7 cols) */}
          <div className="lg:col-span-7 lg:sticky lg:top-28">
            <div className="bg-white rounded-3xl overflow-hidden shadow-2xl border border-[#EADBCE]">
              
              {/* Photo Banner */}
              <div className="relative h-72 sm:h-96 w-full overflow-hidden">
                <img
                  src={currentDest.imageUrl}
                  alt={currentDest.name}
                  className="w-full h-full object-cover transition-transform duration-700 hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />

                {/* Floating Tags */}
                <div className="absolute top-4 left-4 flex items-center gap-2">
                  <span className="px-3 py-1 rounded-full bg-black/60 backdrop-blur-md text-white text-xs font-bold">
                    📍 {currentDest.name}
                  </span>
                  <span className="px-3 py-1 rounded-full bg-white/90 backdrop-blur-md text-slate-900 text-xs font-bold flex items-center gap-1">
                    <Star className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
                    <span>{currentDest.rating} (Verified ONTT)</span>
                  </span>
                </div>

                <div className="absolute bottom-4 left-4 right-4 text-white">
                  <span className="text-xs font-bold uppercase tracking-wider text-amber-300">
                    Featured Destination Spotlight
                  </span>
                  <h3 className="font-serif text-3xl sm:text-4xl font-bold mt-0.5">
                    {currentDest.name}
                  </h3>
                  <p className="text-xs sm:text-sm text-slate-200 mt-1 line-clamp-2">
                    {currentDest.tagline}
                  </p>
                </div>
              </div>

              {/* Showcase Body */}
              <div className="p-6 sm:p-8 space-y-6">
                <div>
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-1">
                    About {currentDest.name}
                  </h4>
                  <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                    {currentDest.description}
                  </p>
                </div>

                {/* Meta Grid */}
                <div className="grid grid-cols-2 gap-4 p-4 rounded-2xl bg-[#FAF7F2] border border-[#EADBCE]">
                  <div>
                    <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider">
                      Best For
                    </span>
                    <span className="font-bold text-xs text-[#0A4D68] mt-0.5 block">
                      {currentDest.bestFor}
                    </span>
                  </div>
                  <div>
                    <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider">
                      Recommended Stay
                    </span>
                    <span className="font-bold text-xs text-[#088395] mt-0.5 block">
                      {currentDest.duration}
                    </span>
                  </div>
                </div>

                {/* Key Highlights */}
                <div>
                  <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider mb-2">
                    Signature Highlights:
                  </span>
                  <div className="flex flex-wrap gap-2">
                    {currentDest.highlights.map((h, i) => (
                      <span
                        key={i}
                        className="px-3 py-1 rounded-full bg-slate-100 text-slate-700 text-xs font-medium"
                      >
                        ✓ {h}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Actions */}
                <div className="pt-2 flex items-center gap-3">
                  <button
                    onClick={() => {
                      if (onPlanDestination) {
                        onPlanDestination(currentDest.name);
                      }
                    }}
                    className="flex-1 py-3 px-5 rounded-2xl bg-[#088395] hover:bg-[#0A4D68] text-white text-xs font-bold shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <span>Plan a Trip Including {currentDest.name}</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

            </div>
          </div>

        </div>

      </div>
    </section>
  );
};
