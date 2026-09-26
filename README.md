# 🇹🇳 TuniTrip — AI-Powered Tunisia Travel Planner

> **“Discover Tunisia, your way.”**  
> An intelligent local travel companion designed for foreign visitors and travelers who want to explore Tunisia through natural conversation, verified cultural insights, budget guardrails, and realistic geographical itineraries.

---

## 🌟 Product Highlights

- **AI-First Conversational Architect:**
  Say *"Hello, I want to visit Tunisia for 7 days with 3 other family members. We love games like Disneyland or Carthage Land, history, swimming and calm places. Our budget is $2,450."* — TuniTrip immediately extracts trip constraints, searches authoritative knowledge bases, calculates budgets, and crafts a 7-day realistic itinerary.
- **Authentic Tunisian Knowledge Layer (RAG):**
  Grounds every recommendation in verified sources including **UNESCO World Heritage**, **Tunisian National Tourist Office (ONTT)**, **Carthage Land Official Park Authorities**, and **verified hotel partners**.
- **Interactive Multi-Mode Itinerary:**
  Generates 4 distinct, named trip experiences:
  1. *Family Adventure & Carthage Fun* (Flagship balanced recommendation)
  2. *Calm Coast & Mediterranean Serenity* (Relaxed pacing, private beach lounging, zero traffic stress)
  3. *Heritage & Imperial Wonders* (Bardo Mosaic Palace, Carthage ruins, El Jem Colosseum)
  4. *Budget-Smart Family Escape* (Under $1,200 total; $287 per person)
- **Geographically Conscious Pacing:**
  Respects actual travel times and distances between Tunisian regions (e.g. Tunis to Hammamet 50 mins, Hammamet to El Jem 90 mins). Never schedules geographically impossible leaps.
- **Dynamic Multi-Currency Budget Engine:**
  Live budget calculations in **USD ($)**, **EUR (€)**, **GBP (£)**, and **Tunisian Dinars (TND)**, itemized by accommodations, theme parks & activities, private transfers, dining, and extras with buffer protection.
- **Synchronized Live Map Experience:**
  Interactive Leaflet map featuring custom category pins (Hotels, Theme parks, Beaches, UNESCO Ruins, Food, Calm Escapes) and driving route lines synchronized with active itinerary selections.
- **Strict 5-Stage Booking Flow & Consumer Safety:**
  Financial transactions and bookings require explicit Stage 4 review and checkbox authorization. Generates verified partner booking vouchers (`TN-HTL-7741`, `CL-PAS-9921`, `TN-TRN-3418`).
- **High-Fidelity Presentation & Demo Mode:**
  Runs smoothly offline or online with zero configuration required. Includes a one-click **"Try Demo Trip"** button for investor and tourism stakeholder presentations.

---

## 🏗️ Architecture

```
User Prompt
    │
    ▼
Travel Agent Orchestrator (services/travelAgent.ts)
    │
    ├─► Step 1: Preference Extraction (TripProfile)
    ├─► Step 2: Semantic RAG Retrieval (services/ragEngine.ts)
    ├─► Step 3: Verified Places & Hotel Search (data/knowledgeBase.ts)
    ├─► Step 4: Budget Engine & Currency Converter (services/budgetEngine.ts)
    ├─► Step 5: Route & Itinerary Generator (services/itineraryEngine.ts)
    ├─► Step 6: Conversational Memory & Dynamic Modifications
    └─► Step 7: 5-Stage Explicit Booking Confirmation & Voucher Generation
```

### Tech Stack
- **Framework:** React 19, TypeScript, Vite
- **Styling:** Tailwind CSS v4, custom Mediterranean Teal & Sand design system
- **Mapping:** Leaflet with CartoDB Voyager tiles
- **Icons & Effects:** Lucide React, Canvas Confetti
- **Testing:** Automated scenario test suite (`tsx`)

---

## 🚀 Getting Started

### 1. Installation
```bash
npm install
```

### 2. Run the Development Server
```bash
npm run dev
```
Open [http://localhost:5173](http://localhost:5173) in your browser.

### 3. Run the Automated Scenario Test Suite
```bash
npm test
```

---

## 🎯 Tested Presentation Scenario

1. **Initial Message:**
   > *"Hello I wanna visit Tunisia for 7 days with 3 other family members. We love playing games like Disneyland or Carthage Land games. We love history and swimming and calm places. My budget is 2450 dollars."*
   - Agent returns Carthage Land Yasmine Hammamet, Hasdrubal Thalassa beachfront stay, El Jem Colosseum, and budget summary ($1,980 total / $470 buffer remaining).
2. **Conversational Rerouting:**
   > *"I like this plan but I don't want to stay in Tunis"*
   - Agent reroutes accommodation directly to the calm Hammamet Mediterranean coast with direct airport transfer.
3. **Activity Customization:**
   > *"Keep the hotel in Hammamet but replace the second activity"*
   - Agent replaces the pool lounge with private catamaran sailing & calm cove swimming.
4. **Explicit Booking Confirmation:**
   > *"Perfect. Book it."*
   - Agent opens the Stage 4 itemized verification review and requires explicit user checkbox authorization before generating verified reference vouchers.

---

## 🇹🇳 Curated Destinations Included
- **Tunis & Coast:** Carthage (UNESCO), Sidi Bou Said, Medina of Tunis, Bardo Museum
- **Cap Bon:** Hammamet, Yasmine Hammamet, Nabeul Pottery, Kelibia
- **Sahel:** Sousse, Port El Kantaoui, Monastir Ribat, Mahdia Corniche
- **Central & South:** El Jem Amphitheatre (UNESCO), Tozeur Oasis, Matmata Troglodytes, Djerba Island
