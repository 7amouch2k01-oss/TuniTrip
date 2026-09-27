import { EvidenceItem, PriceType, SourceType } from '../ai/types';

export class EvidenceNormalizer {
  public static normalizePlace(raw: {
    id: string;
    name: string;
    description: string;
    city?: string;
    source: string;
    sourceUrl: string;
    sourceType?: SourceType;
    category?: string;
    latitude?: number;
    longitude?: number;
    rating?: number;
    reviewCount?: number;
    price?: number;
    currency?: string;
    priceType?: PriceType;
    openingHours?: string;
    isOpenNow?: boolean;
    image?: string;
    confidence?: number;
    rawProvider?: string;
  }): EvidenceItem {
    return {
      id: raw.id,
      type: raw.category === 'hotel' ? 'hotel' : raw.category === 'restaurant' ? 'restaurant' : 'place',
      title: raw.name,
      description: raw.description,
      source: raw.source,
      sourceUrl: raw.sourceUrl,
      sourceType: raw.sourceType || 'google_places',
      location: raw.city,
      coordinates:
        raw.latitude && raw.longitude
          ? { latitude: raw.latitude, longitude: raw.longitude }
          : undefined,
      price: raw.price,
      currency: raw.currency || 'USD',
      priceType: raw.priceType || (raw.price ? 'estimated' : 'unavailable'),
      rating: raw.rating ? Number(raw.rating.toFixed(1)) : undefined,
      reviewCount: raw.reviewCount,
      openingHours: raw.openingHours,
      isOpenNow: raw.isOpenNow,
      image: raw.image,
      retrievedAt: new Date().toISOString(),
      confidence: raw.confidence ?? 0.85,
      rawProvider: raw.rawProvider || 'google_places',
    };
  }

  public static normalizeWebResult(raw: {
    title: string;
    snippet: string;
    url: string;
    source: string;
    publishedDate?: string;
    confidence?: number;
  }): EvidenceItem {
    return {
      id: `web_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      type: 'web',
      title: raw.title,
      description: raw.snippet,
      source: raw.source,
      sourceUrl: raw.url,
      sourceType: 'web_search',
      publishedAt: raw.publishedDate,
      retrievedAt: new Date().toISOString(),
      confidence: raw.confidence ?? 0.8,
      rawProvider: 'google_web_search',
    };
  }

  public static normalizeWeather(raw: {
    city: string;
    temperatureC: number;
    condition: string;
    precipitationMm: number;
    forecastDate: string;
  }): EvidenceItem {
    return {
      id: `weather_${raw.city.toLowerCase()}_${raw.forecastDate}`,
      type: 'weather',
      title: `Weather in ${raw.city} (${raw.forecastDate})`,
      description: `Current forecast: ${raw.condition}, ${Math.round(raw.temperatureC)}°C, precipitation: ${raw.precipitationMm} mm.`,
      source: 'Open-Meteo Weather Service',
      sourceUrl: 'https://open-meteo.com',
      sourceType: 'weather_service',
      location: raw.city,
      retrievedAt: new Date().toISOString(),
      confidence: 0.95,
      rawProvider: 'open_meteo',
    };
  }

  public static normalizeExchangeRate(raw: {
    base: string;
    target: string;
    rate: number;
  }): EvidenceItem {
    return {
      id: `rate_${raw.base}_${raw.target}`,
      type: 'rate',
      title: `${raw.base} to ${raw.target} Exchange Rate`,
      description: `1 ${raw.base} = ${raw.rate.toFixed(3)} ${raw.target}`,
      source: 'Central Bank of Tunisia / Open Exchange',
      sourceUrl: 'https://www.bct.gov.tn',
      sourceType: 'exchange_service',
      retrievedAt: new Date().toISOString(),
      confidence: 0.98,
      rawProvider: 'open_exchange_rates',
    };
  }
}
