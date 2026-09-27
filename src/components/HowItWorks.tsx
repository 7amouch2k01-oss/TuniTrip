import React from 'react';
import { Heart, Search, Compass } from 'lucide-react';

export const HowItWorks: React.FC = () => {
  const steps = [
    {
      number: '01',
      title: 'Tell us what you love.',
      description:
        'Share your travel pace, interests, budget, and who you are traveling with in simple, natural words.',
      icon: Heart,
    },
    {
      number: '02',
      title: 'We research Tunisia.',
      description:
        'Our local AI analyzes verified places, coastal routes, authentic stays, and real seasonal prices.',
      icon: Search,
    },
    {
      number: '03',
      title: 'We build your trip.',
      description:
        'Receive a balanced day-by-day journey, smart budget, and interactive map tailored specifically to you.',
      icon: Compass,
    },
  ];

  return (
    <section id="how-it-works" className="py-24 sm:py-32 bg-[#FAF7F2] border-t border-[#EADBCE]/60">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="max-w-2xl mx-auto text-center mb-16 sm:mb-24">
          <span className="text-xs uppercase font-extrabold tracking-[0.2em] text-[#088395] block mb-3">
            HOW IT WORKS
          </span>
          <h2 className="font-serif text-3xl sm:text-5xl font-bold text-slate-900 tracking-tight leading-tight">
            Travel planning made <br className="hidden sm:inline" />
            <span className="italic font-normal text-[#088395]">wonderfully simple.</span>
          </h2>
        </div>

        {/* 3 Simple Steps */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12 lg:gap-16">
          {steps.map((step) => {
            const Icon = step.icon;
            return (
              <div key={step.number} className="relative flex flex-col items-start group">
                {/* Step Number in Elegant Display Type */}
                <div className="font-serif text-4xl sm:text-5xl font-light text-slate-300 mb-6 group-hover:text-[#088395] transition-colors">
                  {step.number}
                </div>

                <div className="w-10 h-10 rounded-2xl bg-white border border-[#EADBCE] flex items-center justify-center text-[#0A4D68] shadow-xs mb-5 group-hover:border-[#088395]/40 transition-colors">
                  <Icon className="w-5 h-5 text-[#088395]" />
                </div>

                <h3 className="font-serif font-bold text-xl sm:text-2xl text-slate-900 mb-3 tracking-tight">
                  {step.title}
                </h3>

                <p className="text-slate-600 text-sm sm:text-base leading-relaxed font-normal">
                  {step.description}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};
