import React, { useEffect, useRef } from 'react';
import L from 'leaflet';
import { ItineraryActivity, PlaceItem } from '../types';

interface InteractiveMapProps {
  places?: PlaceItem[];
  activities?: ItineraryActivity[];
  selectedPlaceId?: string | null;
  onSelectPlace?: (id: string) => void;
  className?: string;
}

export const InteractiveMap: React.FC<InteractiveMapProps> = ({
  places = [],
  activities = [],
  selectedPlaceId,
  onSelectPlace,
  className = 'h-96 w-full rounded-2xl',
}) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const markersRef = useRef<Record<string, L.Marker>>({});
  const polylineRef = useRef<L.Polyline | null>(null);

  // Initialize map
  useEffect(() => {
    if (!mapContainerRef.current) return;

    if (!mapInstanceRef.current) {
      // Center of Tunisia (approx Kairouan / Sousse area)
      const map = L.map(mapContainerRef.current, {
        center: [35.8, 10.3],
        zoom: 8,
        zoomControl: false,
        attributionControl: false,
      });

      // CartoDB Positron tiles (clean, architectural monochrome grayscale)
      L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png', {
        maxZoom: 19,
        subdomains: 'abcd',
      }).addTo(map);

      // Add zoom control top right
      L.control.zoom({ position: 'topright' }).addTo(map);

      mapInstanceRef.current = map;
    }

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, []);

  // Update markers & routes
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map) return;

    // Clear existing markers
    Object.values(markersRef.current).forEach((marker) => marker.remove());
    markersRef.current = {};

    if (polylineRef.current) {
      polylineRef.current.remove();
      polylineRef.current = null;
    }

    // Merge points from activities or places
    const points: Array<{
      id: string;
      title: string;
      lat: number;
      lng: number;
      category: string;
      city: string;
      costUSD?: number;
      imageUrl?: string;
    }> = [];

    activities.forEach((act) => {
      if (act.latitude && act.longitude) {
        points.push({
          id: act.id,
          title: act.title,
          lat: act.latitude,
          lng: act.longitude,
          category: act.category,
          city: act.city,
          costUSD: act.costUSD,
          imageUrl: act.imageUrl,
        });
      }
    });

    places.forEach((p) => {
      if (p.latitude && p.longitude && !points.some((pt) => pt.id === p.id)) {
        points.push({
          id: p.id,
          title: p.title,
          lat: p.latitude,
          lng: p.longitude,
          category: p.category,
          city: p.city,
          costUSD: p.estimatedPrice,
          imageUrl: p.imageUrl,
        });
      }
    });

    if (points.length === 0) return;

    const bounds = L.latLngBounds([]);

    // Custom marker icon creator (Monochrome ChatGPT aesthetic)
    const createIcon = (_category: string, isSelected: boolean) => {
      const bg = isSelected ? '#000000' : '#262626';
      const size = isSelected ? 34 : 26;
      const border = isSelected ? '3px solid #000000' : '2px solid #FFFFFF';

      return L.divIcon({
        className: 'custom-map-pin',
        html: `
          <div style="
            background: ${bg};
            width: ${size}px;
            height: ${size}px;
            border-radius: 50%;
            border: ${border};
            box-shadow: 0 2px 8px rgba(0,0,0,0.3);
            display: flex;
            align-items: center;
            justify-content: center;
            color: #ffffff;
            font-size: ${isSelected ? '12px' : '10px'};
            font-weight: 700;
            transition: all 0.2s ease;
            cursor: pointer;
          ">
            ●
          </div>
        `,
        iconSize: [size, size],
        iconAnchor: [size / 2, size / 2],
        popupAnchor: [0, -size / 2],
      });
    };

    // Plot markers
    points.forEach((pt) => {
      const isSelected = selectedPlaceId === pt.id;
      const marker = L.marker([pt.lat, pt.lng], {
        icon: createIcon(pt.category, isSelected),
        title: pt.title,
      }).addTo(map);

      // Popup
      const popupContent = document.createElement('div');
      popupContent.className = 'p-1 text-neutral-900 text-sm max-w-[220px] font-sans';
      popupContent.innerHTML = `
        ${pt.imageUrl ? `<img src="${pt.imageUrl}" alt="${pt.title}" class="w-full h-24 object-cover rounded-lg mb-2" />` : ''}
        <div class="font-bold text-neutral-900 leading-tight mb-1">${pt.title}</div>
        <div class="text-xs text-neutral-500 mb-2 flex items-center justify-between">
          <span>📍 ${pt.city}</span>
          ${pt.costUSD !== undefined ? `<span class="font-bold text-neutral-900">${pt.costUSD > 0 ? `$${pt.costUSD}` : 'Free'}</span>` : ''}
        </div>
      `;

      marker.bindPopup(popupContent);

      marker.on('click', () => {
        if (onSelectPlace) {
          onSelectPlace(pt.id);
        }
      });

      markersRef.current[pt.id] = marker;
      bounds.extend([pt.lat, pt.lng]);
    });

    // Draw route polyline if activities have sequence
    if (activities.length > 1) {
      const routeCoords: [number, number][] = activities
        .filter((a) => a.latitude && a.longitude)
        .map((a) => [a.latitude, a.longitude]);

      if (routeCoords.length > 1) {
        polylineRef.current = L.polyline(routeCoords, {
          color: '#171717',
          weight: 2.5,
          dashArray: '5, 6',
          opacity: 0.8,
        }).addTo(map);
      }
    }

    // Fit map bounds
    if (bounds.isValid()) {
      map.fitBounds(bounds, { padding: [40, 40], maxZoom: 11 });
    }
  }, [places, activities, selectedPlaceId]);

  // Center on selected place when changed
  useEffect(() => {
    if (!selectedPlaceId || !mapInstanceRef.current) return;
    const marker = markersRef.current[selectedPlaceId];
    if (marker) {
      mapInstanceRef.current.panTo(marker.getLatLng(), { animate: true });
      marker.openPopup();
    }
  }, [selectedPlaceId]);

  return (
    <div className={`relative overflow-hidden shadow-lg border border-[#EADBCE]/80 ${className}`}>
      <div ref={mapContainerRef} className="w-full h-full" />
      <div className="absolute bottom-3 left-3 z-[400] bg-white/90 backdrop-blur-md px-3 py-1.5 rounded-full text-xs font-medium text-slate-700 shadow-sm flex items-center gap-2 border border-slate-200">
        <span className="w-2 h-2 rounded-full bg-[#088395] animate-ping" />
        <span>Live Interactive Tunisia Route</span>
      </div>
    </div>
  );
};
