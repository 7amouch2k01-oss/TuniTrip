export type Currency = 'USD' | 'EUR' | 'GBP' | 'TND';

export interface TripProfile {
  destination: string;
  travelers: number;
  durationDays: number;
  budget: number;
  currency: Currency;
  tripType: 'Family' | 'Couple' | 'Solo' | 'Friends' | 'Business';
  interests: string[];
  preferredPace: 'Relaxed' | 'Moderate' | 'Fast-paced';
  accommodationType?: string;
  transportPreference?: string;
  dietaryOrSpecialNotes?: string[];
  departureDate?: string;
}

export type PlaceCategory =
  | 'hotel'
  | 'theme_park'
  | 'beach'
  | 'history'
  | 'culture'
  | 'nature'
  | 'desert'
  | 'food'
  | 'adventure'
  | 'calm_escape';

export interface PlaceItem {
  id: string;
  title: string;
  frenchTitle?: string;
  arabicTitle?: string;
  category: PlaceCategory;
  city: string;
  region: string;
  shortDescription: string;
  fullDescription: string;
  rating: number;
  reviewCount: number;
  estimatedPrice: number; // in USD
  priceLocalTND: number; // in TND
  priceUnit: 'per_person' | 'per_night' | 'entry' | 'meal';
  latitude: number;
  longitude: number;
  imageUrl: string;
  galleryUrls?: string[];
  amenities?: string[];
  openingHours?: string;
  bestSeason?: string;
  familyFriendly: boolean;
  calmAtmosphere: boolean;
  matchReason?: string;
  sourceName: string;
  sourceUrl: string;
  lastChecked: string;
  isVerified: boolean;
  bookingUrl?: string;
}

export interface ItineraryActivity {
  id: string;
  time: string;
  title: string;
  description: string;
  category: PlaceCategory;
  city: string;
  durationHours: number;
  costUSD: number;
  costTND: number;
  placeId?: string;
  latitude: number;
  longitude: number;
  imageUrl: string;
  reasonWhy: string;
  sourceName: string;
  sourceUrl: string;
  isOptional?: boolean;
  bookingStatus: 'not_booked' | 'ready_to_book' | 'awaiting_confirmation' | 'confirmed';
  bookingUrl?: string;
}

export interface ItineraryDay {
  dayNumber: number;
  dateStr?: string;
  title: string;
  city: string;
  summary: string;
  travelInfo?: string;
  activities: ItineraryActivity[];
  hotelStay?: {
    hotelId: string;
    hotelName: string;
    priceUSD: number;
    rating: number;
    imageUrl: string;
    city: string;
  };
  dailyTotalUSD: number;
}

export interface PlanMode {
  id: string;
  name: string;
  tagline: string;
  description: string;
  estimatedCostUSD: number;
  highlights: string[];
  vibe: 'family' | 'relaxed' | 'culture' | 'budget';
  itinerary: ItineraryDay[];
}

export interface BudgetBreakdown {
  hotelsTotalUSD: number;
  transportTotalUSD: number;
  activitiesTotalUSD: number;
  foodTotalUSD: number;
  extrasTotalUSD: number;
  totalEstimatedUSD: number;
  userBudgetUSD: number;
  remainingUSD: number;
  percentageUsed: number;
  costPerTravelerUSD: number;
  currency: Currency;
  isOverBudget: boolean;
  optimizationAdvice?: string;
}

export interface ToolExecutionStep {
  toolName: string;
  status: 'running' | 'completed' | 'failed';
  summary: string;
  resultCount?: number;
  details?: string;
}

export interface AgentStructuredResponse {
  messageText: string;
  profile?: TripProfile;
  recommendations?: PlaceItem[];
  itinerary?: ItineraryDay[];
  planModes?: PlanMode[];
  activePlanId?: string;
  budget?: BudgetBreakdown;
  sources?: { name: string; url: string; context: string }[];
  readyForConfirmation?: boolean;
  suggestedPrompts?: string[];
}

export interface ChatMessage {
  id: string;
  sender: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: string;
  toolSteps?: ToolExecutionStep[];
  structuredData?: AgentStructuredResponse;
  isThinking?: boolean;
}

export interface BookingItem {
  id: string;
  type: 'hotel' | 'activity' | 'transfer';
  title: string;
  provider: string;
  referenceId: string;
  dates: string;
  details: string;
  totalUSD: number;
  status: 'not_booked' | 'ready_to_book' | 'awaiting_confirmation' | 'confirmed' | 'failed';
  bookingUrl: string;
  lastUpdated: string;
}
