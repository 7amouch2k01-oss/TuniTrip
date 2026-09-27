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

export interface StructuredTripProfile {
  travelers: number;
  duration_days: number;
  destination_country: string;
  destination_regions: string[];
  budget: {
    amount: number;
    currency: Currency;
  };
  traveler_type: 'family' | 'couple' | 'solo' | 'friends' | 'business';
  interests: string[];
  inferred_categories: string[];
  preferred_pace: 'relaxed' | 'moderate' | 'fast-paced';
  priorities: string[];
}

export interface ResearchSearchPlan {
  searchCategories: string[];
  targetQueries: string[];
  mustIncludeFeatures: string[];
  budgetConstraintPerNightUSD: number;
  maxDriveTimeMinutesPerDay: number;
}

export interface NormalizedPlaceItem {
  id: string;
  name: string;
  category: PlaceCategory;
  subcategory: string;
  location: string;
  city: string;
  region: string;
  coordinates: { latitude: number; longitude: number };
  description: string;
  rating: number;
  review_count: number;
  price_level: number;
  exact_price: number;
  currency: Currency;
  opening_hours: string;
  website?: string;
  phone?: string;
  photos: string[];
  amenities: string[];
  tags: string[];
  family_friendly: boolean;
  quietness: number; // 1 to 10
  historical_value: number; // 1 to 10
  water_access: boolean;
  source: string;
  source_url: string;
  last_checked: string;
  isVerified: boolean;
  matchReason?: string;
  relevanceScore?: number;
  matchExplanation?: string;
}

export interface ProactiveInsight {
  type: 'route_synergy' | 'budget_warning' | 'pace_tip' | 'family_convenience';
  title: string;
  description: string;
  actionLabel?: string;
}

export interface AgentStructuredResponse {
  messageText: string;
  profile?: TripProfile;
  structuredProfile?: StructuredTripProfile;
  searchPlan?: ResearchSearchPlan;
  recommendations?: PlaceItem[];
  allDiscoveredPlaces?: NormalizedPlaceItem[];
  proactiveInsights?: ProactiveInsight[];
  itinerary?: ItineraryDay[];
  planModes?: PlanMode[];
  activePlanId?: string;
  budget?: BudgetBreakdown;
  sources?: { name: string; url: string; context: string; checkedAt?: string }[];
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

export type PlanStatus = 'confirmed' | 'pending_confirmation' | 'draft';

export interface TripPlan {
  id: string;
  title: string;
  createdAt: string;
  updatedAt: string;
  status: PlanStatus;
  destination: string;
  coverImage?: string;
  profile: TripProfile;
  itinerary: ItineraryDay[];
  budget: BudgetBreakdown;
  activePlanModeId: string;
  planModes: PlanMode[];
  messages: ChatMessage[];
  currentToolSteps: ToolExecutionStep[];
  bookingConfirmationCode?: string;
  confirmedAt?: string;
  notes?: string;
}

