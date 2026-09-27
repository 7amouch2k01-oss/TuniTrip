import React from 'react';
import { Sparkles } from 'lucide-react';

export interface BrandEmblemProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
}

/**
 * Precision-crafted Tunisian Mediterranean Navigation Emblem
 * Features:
 * - 4-Point Faceted Maritime Compass Needle (North, South, East, West) with gold isometric shading
 * - Fine-tuned astrolabe coordinate ring
 * - Center jewel core in Mediterranean deep marine teal & pearl
 */
export const BrandEmblem: React.FC<BrandEmblemProps> = ({
  className = '',
  size = 'md',
}) => {
  const sizeMap = {
    sm: 'w-7 h-7',
    md: 'w-10 h-10',
    lg: 'w-12 h-12',
    xl: 'w-16 h-16',
  };

  return (
    <div
      className={`rounded-2xl p-1.5 flex items-center justify-center transition-all duration-300 relative shrink-0 bg-gradient-to-br from-[#0A4D68] via-[#088395] to-[#0A4D68] border border-[#088395]/40 shadow-md group-hover:scale-105 group-hover:shadow-lg group-hover:shadow-[#088395]/25 ${sizeMap[size]} ${className}`}
    >
      <svg
        viewBox="0 0 40 40"
        className="w-full h-full transform group-hover:rotate-12 transition-transform duration-500 ease-out"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          {/* Radiant Light Gold Gradient */}
          <linearGradient id="emblemLightGold" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#FFF4CC" />
            <stop offset="60%" stopColor="#FDE68A" />
            <stop offset="100%" stopColor="#F59E0B" />
          </linearGradient>

          {/* Deep Amber / Antique Gold Gradient */}
          <linearGradient id="emblemDeepGold" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#E5A93C" />
            <stop offset="60%" stopColor="#D4AF37" />
            <stop offset="100%" stopColor="#B45309" />
          </linearGradient>

          {/* Subtle Outer Astrolabe Gradient */}
          <linearGradient id="astrolabeRingGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#FDE68A" stopOpacity="0.6" />
            <stop offset="100%" stopColor="#D4AF37" stopOpacity="0.2" />
          </linearGradient>
        </defs>

        {/* Outer Orbit / Astrolabe Ring */}
        <circle
          cx="20"
          cy="20"
          r="16"
          stroke="url(#astrolabeRingGrad)"
          strokeWidth="0.75"
          strokeDasharray="1.5 2.5"
        />

        {/* Inner Guide Circle */}
        <circle
          cx="20"
          cy="20"
          r="12.5"
          stroke="#FDE68A"
          strokeWidth="0.5"
          strokeOpacity="0.25"
        />

        {/* 4 Cardinal Small Axis Ticks */}
        <circle cx="20" cy="4" r="0.9" fill="#FFF4CC" />
        <circle cx="20" cy="36" r="0.9" fill="#FDE68A" fillOpacity="0.7" />
        <circle cx="4" cy="20" r="0.9" fill="#FDE68A" fillOpacity="0.7" />
        <circle cx="36" cy="20" r="0.9" fill="#FDE68A" fillOpacity="0.7" />

        {/* 4 Sub-cardinal Faceted Diamond Points (NE, NW, SE, SW) */}
        {/* NE */}
        <polygon points="20,20 27,13 20,17.5" fill="url(#emblemLightGold)" fillOpacity="0.5" />
        <polygon points="20,20 27,13 17.5,20" fill="url(#emblemDeepGold)" fillOpacity="0.4" />
        {/* NW */}
        <polygon points="20,20 13,13 20,17.5" fill="url(#emblemLightGold)" fillOpacity="0.5" />
        <polygon points="20,20 13,13 17.5,20" fill="url(#emblemDeepGold)" fillOpacity="0.4" />
        {/* SE */}
        <polygon points="20,20 27,27 20,22.5" fill="url(#emblemDeepGold)" fillOpacity="0.4" />
        <polygon points="20,20 27,27 22.5,20" fill="url(#emblemLightGold)" fillOpacity="0.5" />
        {/* SW */}
        <polygon points="20,20 13,27 20,22.5" fill="url(#emblemDeepGold)" fillOpacity="0.4" />
        <polygon points="20,20 13,27 17.5,20" fill="url(#emblemLightGold)" fillOpacity="0.5" />

        {/* Primary 4-Point Compass Star with Realistic Isometric Facets */}
        {/* North Point */}
        <polygon points="20,20 20,4 16.5,20" fill="url(#emblemDeepGold)" />
        <polygon points="20,20 20,4 23.5,20" fill="url(#emblemLightGold)" />

        {/* South Point */}
        <polygon points="20,20 20,36 16.5,20" fill="url(#emblemLightGold)" />
        <polygon points="20,20 20,36 23.5,20" fill="url(#emblemDeepGold)" />

        {/* East Point */}
        <polygon points="20,20 36,20 20,16.5" fill="url(#emblemLightGold)" />
        <polygon points="20,20 36,20 20,23.5" fill="url(#emblemDeepGold)" />

        {/* West Point */}
        <polygon points="20,20 4,20 20,16.5" fill="url(#emblemDeepGold)" />
        <polygon points="20,20 4,20 20,23.5" fill="url(#emblemLightGold)" />

        {/* Precision Center Jewel */}
        <circle cx="20" cy="20" r="3.8" fill="#FAF7F2" stroke="#0A4D68" strokeWidth="0.8" />
        <circle cx="20" cy="20" r="2.2" fill="#0A4D68" />
        <circle cx="19.2" cy="19.2" r="0.8" fill="#FFFFFF" />
      </svg>
    </div>
  );
};

export interface BrandLogoProps {
  variant?: 'light' | 'dark' | 'transparent';
  size?: 'sm' | 'md' | 'lg';
  showTagline?: boolean;
  showAiBadge?: boolean;
  className?: string;
  onClick?: () => void;
}

export const BrandLogo: React.FC<BrandLogoProps> = ({
  variant = 'light',
  size = 'md',
  showTagline = true,
  showAiBadge = true,
  className = '',
  onClick,
}) => {
  const isDark = variant === 'dark' || variant === 'transparent';

  const textSizes = {
    sm: 'text-xl',
    md: 'text-2xl',
    lg: 'text-3xl',
  };

  return (
    <div
      onClick={onClick}
      className={`flex items-center gap-2.5 sm:gap-3 select-none group ${
        onClick ? 'cursor-pointer' : ''
      } ${className}`}
      title="TuniTrip — Discover Tunisia"
    >
      {/* Emblem */}
      <BrandEmblem size={size} />

      {/* Brand Wordmark & Metadata */}
      <div className="flex flex-col">
        <div className="flex items-center gap-1.5">
          <span
            className={`font-display font-extrabold ${textSizes[size]} tracking-tight leading-none transition-colors ${
              isDark ? 'text-white' : 'text-[#0A4D68]'
            }`}
          >
            Tuni
            <span className="bg-gradient-to-r from-[#D4AF37] via-[#F59E0B] to-[#D4AF37] bg-clip-text text-transparent">
              Trip
            </span>
          </span>

          {showAiBadge && (
            <span
              className={`text-[9px] uppercase font-black tracking-wider px-1.5 py-0.5 rounded-md flex items-center gap-1 transition-colors ${
                isDark
                  ? 'bg-white/15 text-amber-200 border border-white/20'
                  : 'bg-[#088395]/10 text-[#088395] border border-[#088395]/25'
              }`}
            >
              <Sparkles className="w-2.5 h-2.5 text-[#D4AF37]" />
              AI
            </span>
          )}
        </div>

        {showTagline && (
          <p
            className={`text-[9px] sm:text-[9.5px] font-bold tracking-[0.18em] uppercase mt-1 flex items-center gap-1 leading-none transition-colors ${
              isDark ? 'text-slate-200/90' : 'text-[#088395]'
            }`}
          >
            <span>Discover Tunisia</span>
            <span className="text-[10px]">🇹🇳</span>
          </p>
        )}
      </div>
    </div>
  );
};
