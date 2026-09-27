import React from 'react';
import { ArrowUpRight } from 'lucide-react';

interface CategoryCard {
  id: string;
  name: string;
  description: string;
  imageUrl: string;
  prompt: string;
}

const CATEGORIES: CategoryCard[] = [
  {
    id: 'beach',
    name: 'Beach',
    description: 'Calm turquoise waters, jasmine breezes, and powder-white sands in Hammamet and Mahdia.',
    imageUrl: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1200&q=80',
    prompt: 'Plan a relaxing 6-day beach vacation in Hammamet and Mahdia with calm swimming and seaside dining',
  },
  {
    id: 'history',
    name: 'History',
    description: 'Walk through 3,000 years of civilization at Carthage, Dougga, and the Roman Colosseum of El Jem.',
    imageUrl: 'https://images.unsplash.com/photo-1552832230-c0197dd311b5?auto=format&fit=crop&w=1200&q=80',
    prompt: 'Plan a 5-day cultural and historical tour visiting UNESCO Carthage, the Bardo Museum, and El Jem',
  },
  {
    id: 'family',
    name: 'Family',
    description: 'Carthage Land rollercoasters, Aqua Land water slides, and calm, child-friendly beaches.',
    imageUrl: 'https://images.unsplash.com/photo-1513889961551-628c1e5e2ee9?auto=format&fit=crop&w=1200&q=80',
    prompt: 'Plan a 7-day family trip to Tunisia with Carthage Land theme park, swimming, and fun activities',
  },
  {
    id: 'adventure',
    name: 'Adventure',
    description: 'Cap Bon catamaran sailing, sea kayaking, quad excursions, and scenic coastal hikes.',
    imageUrl: 'https://images.unsplash.com/photo-1544551763-46a013bb70d5?auto=format&fit=crop&w=1200&q=80',
    prompt: 'Plan an active 5-day adventure with sailing, coastal trekking, and outdoor activities in Tunisia',
  },
  {
    id: 'culture',
    name: 'Culture',
    description: 'Cobalt-blue doors in Sidi Bou Said, hand-painted ceramics in Nabeul, and vibrant Medina souks.',
    imageUrl: 'https://images.unsplash.com/photo-1534447677768-be436bb09401?auto=format&fit=crop&w=1200&q=80',
    prompt: 'Plan a 4-day romantic cultural getaway visiting Sidi Bou Said, Tunis Medina, and local art studios',
  },
  {
    id: 'desert',
    name: 'Desert',
    description: 'Verdant date palm oases in Tozeur, Matmata troglodyte caves, and golden Sahara dunes in Douz.',
    imageUrl: 'https://images.unsplash.com/photo-1509316975850-ff9c5deb0cd9?auto=format&fit=crop&w=1200&q=80',
    prompt: 'Plan a 5-day southern Tunisia expedition exploring the Sahara desert dunes, Tozeur, and Matmata',
  },
];

interface CuratedExploreProps {
  onPlanCategory: (prompt: string) => void;
  onExploreMore: () => void;
}

export const CuratedExplore: React.FC<CuratedExploreProps> = ({
  onPlanCategory,
}) => {
  return (
    <section id="explore" className="py-24 sm:py-32 bg-white border-t border-[#EADBCE]/60">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="max-w-2xl mb-16">
          <span className="text-xs uppercase font-extrabold tracking-[0.2em] text-[#088395] block mb-3">
            EXPLORE TUNISIA
          </span>
          <h2 className="font-serif text-3xl sm:text-5xl font-bold text-slate-900 tracking-tight leading-tight">
            Six ways to <br className="hidden sm:inline" />
            <span className="italic font-normal text-[#088395]">experience the country.</span>
          </h2>
        </div>

        {/* 6 Large Visual Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {CATEGORIES.map((cat) => (
            <div
              key={cat.id}
              onClick={() => onPlanCategory(cat.prompt)}
              className="group relative rounded-3xl overflow-hidden aspect-[4/5] cursor-pointer shadow-sm hover:shadow-xl transition-all duration-500 transform hover:-translate-y-1"
            >
              {/* Background Photo */}
              <img
                src={cat.imageUrl}
                alt={cat.name}
                className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
              />

              {/* Restrained Gradient Overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/30 to-transparent transition-opacity" />

              {/* Top Accent Icon */}
              <div className="absolute top-5 right-5 w-10 h-10 rounded-full bg-white/20 backdrop-blur-md border border-white/30 flex items-center justify-center text-white opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                <ArrowUpRight className="w-5 h-5" />
              </div>

              {/* Card Content at Bottom */}
              <div className="absolute bottom-0 left-0 right-0 p-6 sm:p-8 text-white">
                <h3 className="font-serif text-2xl sm:text-3xl font-bold tracking-tight mb-2">
                  {cat.name}
                </h3>
                <p className="text-xs sm:text-sm text-slate-200 line-clamp-2 leading-relaxed font-normal opacity-90">
                  {cat.description}
                </p>
                <div className="mt-4 flex items-center gap-1.5 text-xs font-bold text-amber-200 opacity-90 group-hover:opacity-100 group-hover:translate-x-1 transition-all">
                  <span>Plan a {cat.name.toLowerCase()} trip</span>
                  <ArrowUpRight className="w-3.5 h-3.5" />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
