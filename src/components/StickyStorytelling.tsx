import React, { useState, useEffect, useRef } from 'react';
import { ArrowRight, Waves, Landmark, Compass, Utensils, Sparkles, Heart, Sun } from 'lucide-react';

interface StoryBlock {
  id: string;
  category: string;
  title: string;
  subtitle: string;
  description: string;
  highlights: string[];
  imageUrl: string;
  location: string;
  tag: string;
}

const STORY_BLOCKS: StoryBlock[] = [
  {
    id: 'beach',
    category: 'Mediterranean Coast',
    title: 'Crystal Waters & Sun-Drenched Shores',
    subtitle: 'From Hammamet to the white sands of Mahdia',
    description: 'Tunisia boasts over 1,148 kilometers of Mediterranean coastline. Calm, shallow turquoise waters gently lap against soft golden sands, providing peaceful swimming havens sheltered by jasmine gardens and centuries-old fortresses.',
    highlights: ['Mahdia powder white sands', 'Hasdrubal seawater lagoon pools', 'Cap Bon secluded coves'],
    imageUrl: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1400&q=80',
    location: 'Hammamet & Mahdia',
    tag: 'Calm Swimming',
  },
  {
    id: 'history',
    category: 'UNESCO World Heritage',
    title: '3,000 Years of Imperial Splendor',
    subtitle: 'Where Phoenician queens and Roman emperors walked',
    description: 'Walk through the towering Antonine thermal baths on the shores of ancient Carthage, explore the monumental Roman Colosseum of El Jem (the 3rd largest on Earth), and lose yourself in the 9th-century vaulted Medina of Tunis.',
    highlights: ['UNESCO Colosseum of El Jem', 'Bardo Roman mosaic palace', 'Punic ports of Carthage'],
    imageUrl: 'https://images.unsplash.com/photo-1548625361-197e42d76f8e?auto=format&fit=crop&w=1400&q=80',
    location: 'Carthage & El Jem',
    tag: 'Ancient History',
  },
  {
    id: 'family',
    category: 'Family Entertainment',
    title: 'Thrills, Water Parks & Theme Adventures',
    subtitle: 'Ancient myths turned into world-class family fun',
    description: 'Dive into Carthage Land in Yasmine Hammamet with 25+ themed rides, pirate flumes, and the Aqua Land wave pools. Board handcrafted wooden galleons for Mediterranean pirate cruises with dolphin watching and swimming breaks.',
    highlights: ['Carthage Land & Aqua Land passes', 'Mediterranean pirate galleon voyage', 'Hands-on Nabeul pottery workshops'],
    imageUrl: 'https://images.unsplash.com/photo-1513889961551-628c1e5e2ee9?auto=format&fit=crop&w=1400&q=80',
    location: 'Yasmine Hammamet',
    tag: 'Family & Games',
  },
  {
    id: 'desert',
    category: 'The Grand Sahara',
    title: 'Endless Golden Dunes & Starry Nights',
    subtitle: 'The vast quiet of the Grand Erg Oriental',
    description: 'Watch the sunrise ignite the date palm oases of Tozeur, ride camels across the rolling sands of Douz, and discover troglodyte Berber cave dwellings in Matmata where Star Wars was filmed under unpolluted desert skies.',
    highlights: ['Tozeur 400,000 palm oasis', 'Matmata underground cave homes', 'Sahara nomadic desert camps'],
    imageUrl: 'https://images.unsplash.com/photo-1509316975850-ff9c5deb0cd9?auto=format&fit=crop&w=1400&q=80',
    location: 'Tozeur & Douz',
    tag: 'Desert Wonder',
  },
  {
    id: 'food',
    category: 'Culinary Soul',
    title: 'Fragrant Spices, Olive Groves & Fresh Catch',
    subtitle: 'A Mediterranean cuisine refined over centuries',
    description: 'Savor steaming couscous royal au mérou with wild grouper, crispy golden brick à l’œuf, fresh salads seasoned with virgin olive oil, hot sugared bambalouni pastries, and afternoon mint tea crowned with roasted pine nuts at cliffside cafes.',
    highlights: ['Cliffside tea at Café des Délices', 'Palatial dining at Dar El Jeld', 'Fresh grilled Mediterranean fish'],
    imageUrl: 'https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=1400&q=80',
    location: 'Tunis & Sidi Bou Said',
    tag: 'Local Gastronomy',
  },
  {
    id: 'culture',
    category: 'Artisanal Heritage',
    title: 'Cobbled Villages & Handcrafted Wonders',
    subtitle: 'The timeless blue doors of Sidi Bou Said',
    description: 'Stroll cobblestone pedestrian alleys lined with whitewashed houses, bougainvillea, and ornate wrought-iron moucharabieh windows. Watch master ceramic artists in Nabeul paint geometric tiles by hand.',
    highlights: ['Cobalt blue alleys of Sidi Bou Said', 'Master ceramic studios of Nabeul', 'Bourguiba gold-domed mausoleum'],
    imageUrl: 'https://images.unsplash.com/photo-1534447677768-be436bb09401?auto=format&fit=crop&w=1400&q=80',
    location: 'Sidi Bou Said & Nabeul',
    tag: 'Art & Atmosphere',
  },
];

interface StickyStorytellingProps {
  onSelectStory?: (category: string) => void;
  onStartPlanningWithPrompt?: (prompt: string) => void;
}

export const StickyStorytelling: React.FC<StickyStorytellingProps> = ({
  onStartPlanningWithPrompt,
}) => {
  const [activeIndex, setActiveIndex] = useState(0);
  const blockRefs = useRef<(HTMLDivElement | null)[]>([]);

  useEffect(() => {
    const handleScroll = () => {
      const scrollY = window.scrollY;
      const windowHeight = window.innerHeight;

      blockRefs.current.forEach((el, index) => {
        if (!el) return;
        const rect = el.getBoundingClientRect();
        // Check if element is in middle of viewport
        if (rect.top <= windowHeight * 0.45 && rect.bottom >= windowHeight * 0.2) {
          setActiveIndex(index);
        }
      });
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const currentBlock = STORY_BLOCKS[activeIndex] || STORY_BLOCKS[0];

  return (
    <section className="relative py-24 bg-[#FAF7F2] border-t border-[#EADBCE]/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16 sm:mb-20">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#088395]/10 border border-[#088395]/20 text-[#0A4D68] text-xs font-bold uppercase tracking-wider mb-4">
            <Sparkles className="w-3.5 h-3.5 text-[#C5A059]" />
            <span>Curated Tunisia Stories</span>
          </div>
          <h2 className="font-serif text-3xl sm:text-5xl lg:text-6xl text-[#0A4D68] tracking-tight leading-[1.15]">
            One country. <br />
            <span className="italic font-normal text-[#088395]">A thousand ways to experience it.</span>
          </h2>
          <p className="mt-4 text-base sm:text-lg text-slate-600 font-medium">
            Whether you seek peaceful Mediterranean waters, world-class Roman ruins, high-energy family amusement, or desert silence.
          </p>
        </div>

        {/* Sticky Scroll Split Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-16 items-start">
          
          {/* Left Column: Pinned Sticky Visual Container (5 cols) */}
          <div className="lg:col-span-6 lg:sticky lg:top-28">
            <div className="relative h-[380px] sm:h-[480px] lg:h-[580px] rounded-3xl overflow-hidden shadow-2xl border border-[#EADBCE]">
              
              {/* Layered Images with Crossfade */}
              {STORY_BLOCKS.map((block, idx) => (
                <div
                  key={block.id}
                  className={`absolute inset-0 transition-opacity duration-700 ease-in-out ${
                    idx === activeIndex ? 'opacity-100 scale-100 z-10' : 'opacity-0 scale-105 z-0'
                  }`}
                  style={{ transitionProperty: 'opacity, transform' }}
                >
                  <img
                    src={block.imageUrl}
                    alt={block.title}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                </div>
              ))}

              {/* Floating Metadata on Sticky Card */}
              <div className="absolute bottom-6 left-6 right-6 z-20 text-white">
                <div className="flex items-center gap-2 mb-2">
                  <span className="px-3 py-1 rounded-full bg-[#088395]/90 backdrop-blur-md text-[11px] font-bold tracking-wider uppercase text-white shadow-sm">
                    {currentBlock.category}
                  </span>
                  <span className="px-3 py-1 rounded-full bg-black/50 backdrop-blur-md text-[11px] font-semibold text-slate-200">
                    📍 {currentBlock.location}
                  </span>
                </div>
                <h3 className="font-serif text-2xl sm:text-3xl font-bold leading-tight">
                  {currentBlock.title}
                </h3>
                <p className="text-xs sm:text-sm text-slate-200 mt-1.5 font-medium line-clamp-2">
                  {currentBlock.subtitle}
                </p>

                {/* Progress Indicators */}
                <div className="flex items-center gap-1.5 mt-5">
                  {STORY_BLOCKS.map((_, idx) => (
                    <button
                      key={idx}
                      onClick={() => {
                        blockRefs.current[idx]?.scrollIntoView({ behavior: 'smooth', block: 'center' });
                      }}
                      className={`h-1.5 rounded-full transition-all duration-300 cursor-pointer ${
                        idx === activeIndex ? 'w-8 bg-[#D4AF37]' : 'w-2 bg-white/40 hover:bg-white/70'
                      }`}
                      title={STORY_BLOCKS[idx].title}
                    />
                  ))}
                </div>
              </div>

              {/* Decorative Handwritten Label */}
              <div className="absolute top-4 right-5 z-20 font-hand text-xl text-amber-200/90 rotate-2 pointer-events-none drop-shadow-md">
                Tunisia awaits ♡
              </div>
            </div>
          </div>

          {/* Right Column: Scrollable Narrative Content Blocks (6 cols) */}
          <div className="lg:col-span-6 space-y-24 sm:space-y-32 py-8 lg:py-12">
            {STORY_BLOCKS.map((block, idx) => {
              const isActive = idx === activeIndex;

              return (
                <div
                  key={block.id}
                  ref={(el) => { blockRefs.current[idx] = el; }}
                  className={`p-6 sm:p-8 rounded-3xl transition-all duration-500 border ${
                    isActive
                      ? 'bg-white border-[#088395]/40 shadow-xl shadow-[#0A4D68]/5 translate-x-1'
                      : 'bg-white/40 border-transparent opacity-60 hover:opacity-100'
                  }`}
                >
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-xs uppercase font-extrabold tracking-wider text-[#C5A059]">
                      0{idx + 1} • {block.category}
                    </span>
                    <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-[#FAF7F2] text-slate-600 border border-[#EADBCE]">
                      {block.tag}
                    </span>
                  </div>

                  <h3 className="font-serif text-2xl sm:text-3xl font-bold text-[#0A4D68] leading-snug">
                    {block.title}
                  </h3>

                  <p className="text-xs sm:text-sm font-semibold text-[#088395] mt-1 mb-3">
                    {block.subtitle}
                  </p>

                  <p className="text-xs sm:text-sm text-slate-600 leading-relaxed font-normal mb-5">
                    {block.description}
                  </p>

                  {/* Curated Highlights List */}
                  <div className="space-y-2 mb-6 border-t border-slate-100 pt-4">
                    <span className="text-[11px] uppercase font-bold text-slate-400 block tracking-wider">
                      Selected Experiences:
                    </span>
                    {block.highlights.map((item, hIdx) => (
                      <div key={hIdx} className="flex items-center gap-2 text-xs font-medium text-slate-700">
                        <span className="w-1.5 h-1.5 rounded-full bg-[#088395]" />
                        <span>{item}</span>
                      </div>
                    ))}
                  </div>

                  {/* Action CTA */}
                  <button
                    onClick={() => {
                      if (onStartPlanningWithPrompt) {
                        onStartPlanningWithPrompt(`Plan a trip to Tunisia focusing on ${block.title.toLowerCase()} in ${block.location}`);
                      }
                    }}
                    className="inline-flex items-center gap-2 text-xs font-bold text-[#088395] hover:text-[#0A4D68] group cursor-pointer transition-colors"
                  >
                    <span>Plan this experience with AI</span>
                    <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                  </button>
                </div>
              );
            })}
          </div>

        </div>

      </div>
    </section>
  );
};
