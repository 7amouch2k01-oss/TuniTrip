import React from 'react';
import { ArrowRight, Sparkles, MapPin, Calendar, Users, DollarSign, Check } from 'lucide-react';

interface ExampleItineraryShowcaseProps {
  onCustomizeTrip: (prompt: string) => void;
}

export const ExampleItineraryShowcase: React.FC<ExampleItineraryShowcaseProps> = ({
  onCustomizeTrip,
}) => {
  const exampleDays = [
    {
      day: 'DAY 1',
      title: 'Tunis & Sidi Bou Said',
      summary: 'Arrival, panoramic views over the Gulf of Tunis, and cliffside mint tea at Café des Délices.',
      time: '3 activities · Zero rush',
    },
    {
      day: 'DAY 2',
      title: 'Carthage to Hammamet',
      summary: 'Antonine Roman thermal baths by the sea, scenic coastal transfer to Hammamet resort.',
      time: '1h 15m scenic drive',
    },
    {
      day: 'DAY 3',
      title: 'Carthage Land Theme & Water Park',
      summary: 'Full-day family excitement with 25+ themed rides, water flumes, and wave pools.',
      time: 'Full day family pass',
    },
    {
      day: 'DAY 4',
      title: 'Calm Swimming & Nabeul Pottery',
      summary: 'Morning beach time in Hammamet, followed by hands-on ceramic studio workshop in Nabeul.',
      time: '2.5h pottery atelier',
    },
    {
      day: 'DAY 5',
      title: 'Mediterranean Catamaran Cruise',
      summary: 'Private family sailing in the sheltered bay, dolphin watching, and swimming in hidden coves.',
      time: '3h morning voyage',
    },
    {
      day: 'DAY 6',
      title: 'Imperial Colosseum of El Jem',
      summary: 'UNESCO World Heritage Roman amphitheater — the 3rd largest on Earth — and Monastir fortress.',
      time: 'Day excursion',
    },
    {
      day: 'DAY 7',
      title: 'Medina Souks & Farewell',
      summary: 'Artisan perfume alleys, olive oil tasting, jasmine memories, and airport transfer.',
      time: 'Relaxed departure',
    },
  ];

  const defaultPrompt =
    'Hello I wanna visit Tunisia for 7 days with 3 other family members. We love playing games like Disneyland or Carthage Land games. We love history and swimming and calm places. My budget is 2450 dollars.';

  return (
    <section className="py-24 sm:py-32 bg-[#FAF7F2] border-t border-[#EADBCE]/60">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="max-w-2xl mb-16">
          <span className="text-xs uppercase font-extrabold tracking-[0.2em] text-[#088395] block mb-3">
            SEE WHAT TUNITRIP CAN CREATE
          </span>
          <h2 className="font-serif text-3xl sm:text-5xl font-bold text-slate-900 tracking-tight leading-tight">
            A thoughtfully paced journey, <br className="hidden sm:inline" />
            <span className="italic font-normal text-[#088395]">crafted in seconds.</span>
          </h2>
        </div>

        {/* Feature Itinerary Card */}
        <div className="bg-white rounded-3xl border border-[#EADBCE] shadow-sm overflow-hidden p-6 sm:p-10 lg:p-12">
          {/* Top Info Bar */}
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 pb-8 border-b border-[#EADBCE]/70">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#088395]/10 text-[#088395] text-xs font-bold uppercase tracking-wider mb-2">
                <Sparkles className="w-3.5 h-3.5" />
                Featured Journey
              </div>
              <h3 className="font-serif text-2xl sm:text-4xl font-bold text-slate-900 tracking-tight">
                Tunisia Family Coastal & Heritage Escape
              </h3>
              <p className="text-sm sm:text-base text-slate-600 mt-2 font-normal">
                Carefully balanced between theme park entertainment, UNESCO ancient history, and calm Mediterranean shores.
              </p>
            </div>

            {/* Quick Stats Pills */}
            <div className="flex flex-wrap items-center gap-3">
              <div className="flex items-center gap-1.5 px-4 py-2 rounded-2xl bg-[#FAF7F2] border border-[#EADBCE] text-xs font-semibold text-slate-700">
                <Calendar className="w-4 h-4 text-[#088395]" />
                <span>7 Days</span>
              </div>
              <div className="flex items-center gap-1.5 px-4 py-2 rounded-2xl bg-[#FAF7F2] border border-[#EADBCE] text-xs font-semibold text-slate-700">
                <Users className="w-4 h-4 text-[#088395]" />
                <span>4 Guests</span>
              </div>
              <div className="flex items-center gap-1.5 px-4 py-2 rounded-2xl bg-emerald-50 border border-emerald-200 text-xs font-bold text-emerald-800">
                <DollarSign className="w-4 h-4 text-emerald-600" />
                <span>$2,146 Est. ($2,450 budget)</span>
              </div>
            </div>
          </div>

          {/* 7-Day Timeline List */}
          <div className="py-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-7 gap-4">
            {exampleDays.map((item, idx) => (
              <div
                key={idx}
                className="bg-[#FAF7F2]/60 rounded-2xl p-4 border border-[#EADBCE]/60 flex flex-col justify-between hover:bg-[#FAF7F2] transition-colors"
              >
                <div>
                  <div className="text-[10px] font-extrabold uppercase tracking-wider text-[#088395] mb-1">
                    {item.day}
                  </div>
                  <h4 className="font-serif font-bold text-sm text-slate-900 mb-2 leading-snug">
                    {item.title}
                  </h4>
                  <p className="text-xs text-slate-600 font-normal leading-relaxed line-clamp-3">
                    {item.summary}
                  </p>
                </div>
                <div className="mt-4 pt-2 border-t border-[#EADBCE]/40 text-[10px] text-slate-400 font-medium">
                  {item.time}
                </div>
              </div>
            ))}
          </div>

          {/* Bottom Action Footer */}
          <div className="pt-6 border-t border-[#EADBCE]/70 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-2 text-xs text-slate-500 font-medium">
              <Check className="w-4 h-4 text-emerald-600" />
              <span>Includes verified beachfront resort, park passes, private minivan transfers, and local meals.</span>
            </div>

            <button
              onClick={() => onCustomizeTrip(defaultPrompt)}
              className="px-6 py-3 rounded-full bg-[#088395] hover:bg-[#0A4D68] text-white font-bold text-xs sm:text-sm shadow-md shadow-[#088395]/20 transition-all flex items-center justify-center gap-2 cursor-pointer self-start sm:self-auto shrink-0 active:scale-95"
            >
              <span>Customize this trip</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </section>
  );
};
