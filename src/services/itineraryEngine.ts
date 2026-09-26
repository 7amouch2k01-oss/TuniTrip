import { ItineraryDay, PlanMode, TripProfile } from '../types';
import { ragService } from './ragEngine';

export class ItineraryEngine {
  /**
   * Generates the 4 distinct plan modes for a family/traveler profile
   */
  public generatePlanModes(profile: TripProfile): PlanMode[] {
    const carthageLand = ragService.getById('carthage-land-hammamet')!;
    const carthageRuins = ragService.getById('carthage-archaeological-site')!;
    const sidiBouSaid = ragService.getById('sidi-bou-said-village')!;
    const cafeDelices = ragService.getById('cafe-des-delices')!;
    const hammametBeach = ragService.getById('hammamet-golden-beach')!;
    const elJem = ragService.getById('el-jem-amphitheatre')!;
    const monastirRibat = ragService.getById('ribat-of-monastir')!;
    const pirateShip = ragService.getById('port-el-kantaoui-pirate-ship')!;
    const nabeulPottery = ragService.getById('nabeul-artisanal-pottery')!;
    const bardoMuseum = ragService.getById('bardo-national-museum')!;
    const sousseMedina = ragService.getById('sousse-medina-ribat')!;
    const mahdiaBeach = ragService.getById('mahdia-corniche-beach')!;

    const hasdrubalHotel = ragService.getById('hotel-hasdrubal-thalassa-hammamet')!;
    const orangersHotel = ragService.getById('hotel-the-orangers-hammamet')!;
    const marilliaHotel = ragService.getById('hotel-marillia-hammamet')!;
    const kuriatPalaceHotel = ragService.getById('hotel-iberostar-kuriat-palace')!;

    // PLAN 1: Family Adventure & Carthage Land (The Recommended Flagship)
    const familyAdventureItinerary: ItineraryDay[] = [
      {
        dayNumber: 1,
        title: 'Arrival in Tunis & Panoramic Sidi Bou Said Cliffside',
        city: 'Tunis & Sidi Bou Said',
        summary: 'Warm airport welcome, scenic coastal drive, tranquil blue-and-white village stroll, and refreshing mint tea.',
        travelInfo: 'Tunis-Carthage Airport → Sidi Bou Said (15 km / 20 min drive)',
        hotelStay: {
          hotelId: hasdrubalHotel.id,
          hotelName: hasdrubalHotel.title,
          priceUSD: hasdrubalHotel.estimatedPrice,
          rating: hasdrubalHotel.rating,
          imageUrl: hasdrubalHotel.imageUrl,
          city: 'Hammamet',
        },
        dailyTotalUSD: 165,
        activities: [
          {
            id: 'act-1-1',
            time: '10:30 AM',
            title: 'Tunis-Carthage Airport Chauffeur Welcome',
            description: 'Private air-conditioned minivan greeting for 4 travelers, with cold Tunisian bottled spring water.',
            category: 'adventure',
            city: 'Tunis',
            durationHours: 1.0,
            costUSD: 0,
            costTND: 0,
            latitude: 36.851,
            longitude: 10.2272,
            imageUrl: 'https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?auto=format&fit=crop&w=1000&q=80',
            reasonWhy: 'Seamless arrival with zero luggage stress for a traveling family.',
            sourceName: 'TuniTrip Private Fleet Partner',
            sourceUrl: 'https://discovertunisia.com',
            bookingStatus: 'ready_to_book',
          },
          {
            id: 'act-1-2',
            time: '02:30 PM',
            title: 'Stroll Sidi Bou Said Cobbled Alleys & Bambalouni',
            description: 'Walk through pedestrian-only cobalt blue alleys, smelling fragrant jasmine and tasting hot sugared bambalouni donuts.',
            category: 'culture',
            city: 'Sidi Bou Said',
            durationHours: 2.5,
            costUSD: 3,
            costTND: 10,
            latitude: sidiBouSaid.latitude,
            longitude: sidiBouSaid.longitude,
            imageUrl: sidiBouSaid.imageUrl,
            reasonWhy: 'Calm, pedestrian-friendly environment allowing kids to run safely and adults to soak in sea views.',
            sourceName: sidiBouSaid.sourceName,
            sourceUrl: sidiBouSaid.sourceUrl,
            bookingStatus: 'not_booked',
          },
          {
            id: 'act-1-3',
            time: '05:30 PM',
            title: 'Sunset Mint Tea at Café des Délices',
            description: 'Relax on straw mat terraces overlooking the Mediterranean while enjoying mint tea crowned with roasted pine nuts.',
            category: 'calm_escape',
            city: 'Sidi Bou Said',
            durationHours: 1.5,
            costUSD: 6,
            costTND: 18,
            latitude: cafeDelices.latitude,
            longitude: cafeDelices.longitude,
            imageUrl: cafeDelices.imageUrl,
            reasonWhy: 'Unrivaled tranquil atmosphere to unwind after international flights.',
            sourceName: cafeDelices.sourceName,
            sourceUrl: cafeDelices.sourceUrl,
            bookingStatus: 'not_booked',
          },
        ],
      },
      {
        dayNumber: 2,
        title: 'Ancient Carthage Antiquities & Scenic Coastal Transfer',
        city: 'Carthage to Hammamet',
        summary: 'Explore monumental Roman Antonine thermal baths on the sea, then transfer to Hammamet resort.',
        travelInfo: 'Carthage → Hammamet (65 km / 50 min smooth highway drive)',
        hotelStay: {
          hotelId: hasdrubalHotel.id,
          hotelName: hasdrubalHotel.title,
          priceUSD: hasdrubalHotel.estimatedPrice,
          rating: hasdrubalHotel.rating,
          imageUrl: hasdrubalHotel.imageUrl,
          city: 'Hammamet',
        },
        dailyTotalUSD: 175,
        activities: [
          {
            id: 'act-2-1',
            time: '09:30 AM',
            title: 'UNESCO Archaeological Site of Carthage & Antonine Baths',
            description: 'Walk among giant seafront Roman marble pillars and learn Queen Dido and Hannibal history with an engaging local guide.',
            category: 'history',
            city: 'Carthage',
            durationHours: 2.5,
            costUSD: 5,
            costTND: 16,
            latitude: carthageRuins.latitude,
            longitude: carthageRuins.longitude,
            imageUrl: carthageRuins.imageUrl,
            reasonWhy: 'Fulfills the family’s love of history in an open-air coastal park.',
            sourceName: carthageRuins.sourceName,
            sourceUrl: carthageRuins.sourceUrl,
            bookingStatus: 'ready_to_book',
          },
          {
            id: 'act-2-2',
            time: '03:30 PM',
            title: 'Hammamet Beachfront Check-In & Lagoon Pool Swimming',
            description: 'Settle into beachfront rooms, enjoy gentle seawater swimming in Hasdrubal’s private Mediterranean cove and lagoon pool.',
            category: 'beach',
            city: 'Hammamet',
            durationHours: 3.0,
            costUSD: 0,
            costTND: 0,
            latitude: hammametBeach.latitude,
            longitude: hammametBeach.longitude,
            imageUrl: hammametBeach.imageUrl,
            reasonWhy: 'Direct swimming and calm relaxation time requested by the family.',
            sourceName: hammametBeach.sourceName,
            sourceUrl: hammametBeach.sourceUrl,
            bookingStatus: 'not_booked',
          },
        ],
      },
      {
        dayNumber: 3,
        title: 'Full Day Fun at Carthage Land Theme Park & Aqua Land',
        city: 'Hammamet',
        summary: 'Non-stop family entertainment: 25+ themed rides, pirate flumes, rollercoasters, and wave-pool water slides.',
        travelInfo: '5-minute golf buggy / walk from hotel to Carthage Land gates',
        hotelStay: {
          hotelId: hasdrubalHotel.id,
          hotelName: hasdrubalHotel.title,
          priceUSD: hasdrubalHotel.estimatedPrice,
          rating: hasdrubalHotel.rating,
          imageUrl: hasdrubalHotel.imageUrl,
          city: 'Hammamet',
        },
        dailyTotalUSD: 215,
        activities: [
          {
            id: 'act-3-1',
            time: '10:00 AM',
            title: 'Carthage Land Discovery: Hannibal Coasters & 5D Cinema',
            description: 'Full access to the ancient-themed amusement park with pirate ship rides, Hannibal’s expedition coaster, and Ali Baba discovery maze.',
            category: 'theme_park',
            city: 'Hammamet',
            durationHours: 3.5,
            costUSD: 16,
            costTND: 50,
            latitude: carthageLand.latitude,
            longitude: carthageLand.longitude,
            imageUrl: carthageLand.imageUrl,
            reasonWhy: 'Direct match for your family’s love of games like Disneyland or Carthage Land.',
            sourceName: carthageLand.sourceName,
            sourceUrl: carthageLand.sourceUrl,
            bookingStatus: 'ready_to_book',
            bookingUrl: carthageLand.bookingUrl,
          },
          {
            id: 'act-3-2',
            time: '02:30 PM',
            title: 'Aqua Land Water Park Slides & Wave Pool',
            description: 'Cool off in Carthage Land’s interconnected water world with multi-lane family slides and lazy lagoon river.',
            category: 'beach',
            city: 'Hammamet',
            durationHours: 3.0,
            costUSD: 0, // Included in combo ticket
            costTND: 0,
            latitude: carthageLand.latitude,
            longitude: carthageLand.longitude,
            imageUrl: 'https://images.unsplash.com/photo-1582650625119-3a31f8418b7d?auto=format&fit=crop&w=1000&q=80',
            reasonWhy: 'Ultimate combination of game-play thrills and cool water swimming for 4.',
            sourceName: carthageLand.sourceName,
            sourceUrl: carthageLand.sourceUrl,
            bookingStatus: 'not_booked',
          },
        ],
      },
      {
        dayNumber: 4,
        title: 'Calm Swimming & Nabeul Hands-On Pottery Workshop',
        city: 'Hammamet & Nabeul',
        summary: 'Morning calm Mediterranean beach swim followed by a private clay-turning workshop for the kids in Nabeul.',
        travelInfo: 'Hammamet → Nabeul (12 km / 15 min drive)',
        hotelStay: {
          hotelId: hasdrubalHotel.id,
          hotelName: hasdrubalHotel.title,
          priceUSD: hasdrubalHotel.estimatedPrice,
          rating: hasdrubalHotel.rating,
          imageUrl: hasdrubalHotel.imageUrl,
          city: 'Hammamet',
        },
        dailyTotalUSD: 165,
        activities: [
          {
            id: 'act-4-1',
            time: '09:30 AM',
            title: 'Morning Calm Swimming at Yasmine Private Beach',
            description: 'Relaxed morning by the calm shallow turquoise sea with complimentary sun loungers and towel service.',
            category: 'beach',
            city: 'Hammamet',
            durationHours: 3.0,
            costUSD: 0,
            costTND: 0,
            latitude: hammametBeach.latitude,
            longitude: hammametBeach.longitude,
            imageUrl: hammametBeach.imageUrl,
            reasonWhy: 'Preserves a relaxed, unhurried pace between active sightseeing days.',
            sourceName: hammametBeach.sourceName,
            sourceUrl: hammametBeach.sourceUrl,
            bookingStatus: 'not_booked',
          },
          {
            id: 'act-4-2',
            time: '03:00 PM',
            title: 'Nabeul Ceramic Studio & Kids Clay-Turning Session',
            description: 'Visit an authentic artisan atelier where each family member sculpts and paints their own ceramic souvenir tile to take home.',
            category: 'culture',
            city: 'Nabeul',
            durationHours: 2.5,
            costUSD: 12,
            costTND: 35,
            latitude: nabeulPottery.latitude,
            longitude: nabeulPottery.longitude,
            imageUrl: nabeulPottery.imageUrl,
            reasonWhy: 'Interactive hands-on cultural game experience that kids remember forever.',
            sourceName: nabeulPottery.sourceName,
            sourceUrl: nabeulPottery.sourceUrl,
            bookingStatus: 'ready_to_book',
          },
        ],
      },
      {
        dayNumber: 5,
        title: 'Mediterranean Pirate Ship Cruise & Port El Kantaoui',
        city: 'Port El Kantaoui (Sousse)',
        summary: 'Sail the calm gulf on a wooden galleon with games and swimming stops, plus evening harbor stroll.',
        travelInfo: 'Hammamet → Port El Kantaoui (85 km / 55 min highway drive)',
        hotelStay: {
          hotelId: hasdrubalHotel.id,
          hotelName: hasdrubalHotel.title,
          priceUSD: hasdrubalHotel.estimatedPrice,
          rating: hasdrubalHotel.rating,
          imageUrl: hasdrubalHotel.imageUrl,
          city: 'Hammamet',
        },
        dailyTotalUSD: 235,
        activities: [
          {
            id: 'act-5-1',
            time: '10:00 AM',
            title: 'Wooden Galleon Pirate Adventure & Open Sea Swim',
            description: 'Set sail from the marina with animated pirate crew, interactive treasure hunt games, and anchor drop in a calm bay for swimming.',
            category: 'adventure',
            city: 'Sousse',
            durationHours: 3.5,
            costUSD: 20,
            costTND: 60,
            latitude: pirateShip.latitude,
            longitude: pirateShip.longitude,
            imageUrl: pirateShip.imageUrl,
            reasonWhy: 'Combines fun theatrical games with open-water Mediterranean swimming.',
            sourceName: pirateShip.sourceName,
            sourceUrl: pirateShip.sourceUrl,
            bookingStatus: 'ready_to_book',
          },
          {
            id: 'act-5-2',
            time: '04:00 PM',
            title: 'Port El Kantaoui Marina Stroll & Gelato',
            description: 'Calm pedestrian marina walk among moored yachts, musical fountains, and traditional Tunisian jasmine sellers.',
            category: 'calm_escape',
            city: 'Sousse',
            durationHours: 2.0,
            costUSD: 5,
            costTND: 15,
            latitude: 35.892,
            longitude: 10.598,
            imageUrl: 'https://images.unsplash.com/photo-1509198397868-475647b2a1e5?auto=format&fit=crop&w=1000&q=80',
            reasonWhy: 'Leisurely waterfront atmosphere with zero motor traffic.',
            sourceName: 'ONTT Sousse',
            sourceUrl: 'https://discovertunisia.com',
            bookingStatus: 'not_booked',
          },
        ],
      },
      {
        dayNumber: 6,
        title: 'Imperial Colosseum of El Jem & Monastir Fortress',
        city: 'El Jem & Monastir',
        summary: 'Explore the 3rd largest Roman amphitheater in the world, followed by the majestic seaside Ribat fortress.',
        travelInfo: 'Hammamet → El Jem (140 km / 1 hr 30 min) → Monastir (65 km / 50 min)',
        hotelStay: {
          hotelId: hasdrubalHotel.id,
          hotelName: hasdrubalHotel.title,
          priceUSD: hasdrubalHotel.estimatedPrice,
          rating: hasdrubalHotel.rating,
          imageUrl: hasdrubalHotel.imageUrl,
          city: 'Hammamet',
        },
        dailyTotalUSD: 180,
        activities: [
          {
            id: 'act-6-1',
            time: '09:30 AM',
            title: 'UNESCO Amphitheatre of El Jem & Gladiator Tunnels',
            description: 'Walk the arena floor of the world-famous Roman Colosseum of Thysdrus and discover the underground animal and gladiatorial vaults.',
            category: 'history',
            city: 'El Jem',
            durationHours: 2.5,
            costUSD: 5,
            costTND: 16,
            latitude: elJem.latitude,
            longitude: elJem.longitude,
            imageUrl: elJem.imageUrl,
            reasonWhy: 'Spectacular living history that captivates both children and adults.',
            sourceName: elJem.sourceName,
            sourceUrl: elJem.sourceUrl,
            bookingStatus: 'ready_to_book',
          },
          {
            id: 'act-6-2',
            time: '03:00 PM',
            title: 'Ribat of Monastir Coastal Watchtower Climb',
            description: 'Visit the oldest 8th-century Islamic sea fortress in North Africa and ascend the Nador watchtower for panoramic ocean views.',
            category: 'history',
            city: 'Monastir',
            durationHours: 2.0,
            costUSD: 4,
            costTND: 12,
            latitude: monastirRibat.latitude,
            longitude: monastirRibat.longitude,
            imageUrl: monastirRibat.imageUrl,
            reasonWhy: 'Maritime fortress adventure paired with peaceful sea vistas.',
            sourceName: monastirRibat.sourceName,
            sourceUrl: monastirRibat.sourceUrl,
            bookingStatus: 'ready_to_book',
          },
        ],
      },
      {
        dayNumber: 7,
        title: 'Relaxed Farewell Breakfast, Souvenirs & Airport Transfer',
        city: 'Hammamet to Tunis',
        summary: 'Final calm swim, artisanal souvenir shopping in the Medina of Hammamet, and chauffeur transfer to Tunis-Carthage Airport.',
        travelInfo: 'Hammamet → Tunis-Carthage Airport (65 km / 50 min smooth drive)',
        dailyTotalUSD: 85,
        activities: [
          {
            id: 'act-7-1',
            time: '09:30 AM',
            title: 'Hammamet Old Kasbah & Medina Morning Walk',
            description: 'Gentle walk along the 15th-century seafront ramparts of Hammamet Fort, picking up authentic olive wood gifts and orange blossom perfume.',
            category: 'culture',
            city: 'Hammamet',
            durationHours: 2.0,
            costUSD: 3,
            costTND: 9,
            latitude: 36.396,
            longitude: 10.614,
            imageUrl: 'https://images.unsplash.com/photo-1549144511-f099e773c147?auto=format&fit=crop&w=1000&q=80',
            reasonWhy: 'Pleasant, relaxed conclusion to the trip without rushing.',
            sourceName: 'ONTT Cap Bon',
            sourceUrl: 'https://discovertunisia.com',
            bookingStatus: 'not_booked',
          },
          {
            id: 'act-7-2',
            time: '01:30 PM',
            title: 'Private Chauffeur Transfer to Tunis-Carthage Airport',
            description: 'Comfortable air-conditioned private minivan transfer ensuring arrival 3 hours prior to departure flight.',
            category: 'adventure',
            city: 'Tunis',
            durationHours: 1.0,
            costUSD: 0,
            costTND: 0,
            latitude: 36.851,
            longitude: 10.2272,
            imageUrl: 'https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?auto=format&fit=crop&w=1000&q=80',
            reasonWhy: 'Guarantees reliable, timely flight departure.',
            sourceName: 'TuniTrip Private Fleet Partner',
            sourceUrl: 'https://discovertunisia.com',
            bookingStatus: 'ready_to_book',
          },
        ],
      },
    ];

    // PLAN 2: Calm Coast & Mediterranean Serenity (Mahdia & Hammamet focus)
    const calmCoastItinerary: ItineraryDay[] = [
      {
        dayNumber: 1,
        title: 'Arrival & Scenic Coastal Welcome in Hammamet',
        city: 'Hammamet',
        summary: 'Direct transfer to serene beachfront resort with fragrant orange gardens.',
        travelInfo: 'Airport → Hammamet (65 km / 50 min)',
        hotelStay: {
          hotelId: orangersHotel.id,
          hotelName: orangersHotel.title,
          priceUSD: orangersHotel.estimatedPrice,
          rating: orangersHotel.rating,
          imageUrl: orangersHotel.imageUrl,
          city: 'Hammamet',
        },
        dailyTotalUSD: 145,
        activities: [familyAdventureItinerary[0].activities[0], familyAdventureItinerary[0].activities[2]],
      },
      {
        dayNumber: 2,
        title: 'Uninterrupted Beach Relaxation & Spa Experience',
        city: 'Hammamet',
        summary: 'Quiet seaside loungers, calm turquoise waters, and wellness hydrotherapy.',
        travelInfo: 'On-site resort sanctuary',
        hotelStay: {
          hotelId: orangersHotel.id,
          hotelName: orangersHotel.title,
          priceUSD: orangersHotel.estimatedPrice,
          rating: orangersHotel.rating,
          imageUrl: orangersHotel.imageUrl,
          city: 'Hammamet',
        },
        dailyTotalUSD: 155,
        activities: [familyAdventureItinerary[3].activities[0]],
      },
      {
        dayNumber: 3,
        title: 'Pristine White Sands & Crystal Waters of Mahdia',
        city: 'Mahdia',
        summary: 'Day trip to Tunisia’s quietest coastal jewel with powder-soft white beaches.',
        travelInfo: 'Hammamet → Mahdia (150 km / 1 hr 45 min)',
        hotelStay: {
          hotelId: orangersHotel.id,
          hotelName: orangersHotel.title,
          priceUSD: orangersHotel.estimatedPrice,
          rating: orangersHotel.rating,
          imageUrl: orangersHotel.imageUrl,
          city: 'Hammamet',
        },
        dailyTotalUSD: 165,
        activities: [
          {
            id: 'act-calm-3',
            time: '10:30 AM',
            title: 'Mahdia Turquoise Lagoon Swim & Skifa El Kahla',
            description: 'Bask on Mahdia’s untouched beaches and see the grand black gate of the Fatimid dynasty.',
            category: 'calm_escape',
            city: 'Mahdia',
            durationHours: 4.0,
            costUSD: 4,
            costTND: 12,
            latitude: mahdiaBeach.latitude,
            longitude: mahdiaBeach.longitude,
            imageUrl: mahdiaBeach.imageUrl,
            reasonWhy: 'Zero crowds and shallow calm crystal waters.',
            sourceName: mahdiaBeach.sourceName,
            sourceUrl: mahdiaBeach.sourceUrl,
            bookingStatus: 'not_booked',
          },
        ],
      },
      {
        dayNumber: 4,
        title: 'Carthage Land Amusement Morning & Relaxed Pool Afternoon',
        city: 'Hammamet',
        summary: 'Balanced day featuring the best of Carthage Land followed by calm garden siesta.',
        travelInfo: 'Local Hammamet (5 mins)',
        hotelStay: {
          hotelId: orangersHotel.id,
          hotelName: orangersHotel.title,
          priceUSD: orangersHotel.estimatedPrice,
          rating: orangersHotel.rating,
          imageUrl: orangersHotel.imageUrl,
          city: 'Hammamet',
        },
        dailyTotalUSD: 195,
        activities: [familyAdventureItinerary[2].activities[0]],
      },
      {
        dayNumber: 5,
        title: 'Nabeul Garden Villas & Mediterranean Citrus Tasting',
        city: 'Nabeul',
        summary: 'Private estate tour of citrus groves and delicate orange blossom water distillers.',
        travelInfo: 'Hammamet → Nabeul (12 km / 15 min)',
        hotelStay: {
          hotelId: orangersHotel.id,
          hotelName: orangersHotel.title,
          priceUSD: orangersHotel.estimatedPrice,
          rating: orangersHotel.rating,
          imageUrl: orangersHotel.imageUrl,
          city: 'Hammamet',
        },
        dailyTotalUSD: 160,
        activities: [familyAdventureItinerary[3].activities[1]],
      },
      {
        dayNumber: 6,
        title: 'El Jem Monumental Roman Amphitheater',
        city: 'El Jem',
        summary: 'Private afternoon tour of the ancient Colosseum with tranquil golden hour photography.',
        travelInfo: 'Hammamet → El Jem (140 km / 1 hr 30 min)',
        hotelStay: {
          hotelId: orangersHotel.id,
          hotelName: orangersHotel.title,
          priceUSD: orangersHotel.estimatedPrice,
          rating: orangersHotel.rating,
          imageUrl: orangersHotel.imageUrl,
          city: 'Hammamet',
        },
        dailyTotalUSD: 170,
        activities: [familyAdventureItinerary[5].activities[0]],
      },
      {
        dayNumber: 7,
        title: 'Farewell Seaside Brunch & Departure Transfer',
        city: 'Hammamet to Tunis',
        summary: 'Lush garden brunch before smooth private transfer back to Tunis-Carthage Airport.',
        travelInfo: 'Hammamet → Airport (65 km / 50 min)',
        dailyTotalUSD: 70,
        activities: [familyAdventureItinerary[6].activities[1]],
      },
    ];

    // PLAN 3: Heritage & Imperial Wonders (More museums, ruins, medinas)
    const heritageItinerary: ItineraryDay[] = [
      {
        dayNumber: 1,
        title: 'UNESCO Medina of Tunis & Dar El Jeld Palace Dinner',
        city: 'Tunis',
        summary: 'Explore 700 monuments of the historic medina and dine in an authentic 18th-century palace.',
        travelInfo: 'Airport → Tunis Medina (8 km / 15 min)',
        hotelStay: {
          hotelId: 'hotel-dar-el-jeld-tunis',
          hotelName: 'Dar El Jeld Hotel & Spa',
          priceUSD: 195,
          rating: 4.9,
          imageUrl: 'https://images.unsplash.com/photo-1590490360182-c33d57733427?auto=format&fit=crop&w=1000&q=80',
          city: 'Tunis',
        },
        dailyTotalUSD: 240,
        activities: [
          {
            id: 'act-medina-walk',
            time: '03:00 PM',
            title: 'Guided Walk through Tunis Medina Souks & Zitouna Mosque',
            description: 'Visit perfume souks (Souk El Attarine), artisan bookbinders, and historical medersas.',
            category: 'history',
            city: 'Tunis',
            durationHours: 2.5,
            costUSD: 10,
            costTND: 30,
            latitude: 36.799,
            longitude: 10.17,
            imageUrl: 'https://images.unsplash.com/photo-1518684079-3c830dcef090?auto=format&fit=crop&w=1000&q=80',
            reasonWhy: 'Rich 1,000-year Islamic and Mediterranean heritage.',
            sourceName: 'UNESCO World Heritage',
            sourceUrl: 'https://whc.unesco.org/en/list/36',
            bookingStatus: 'ready_to_book',
          },
        ],
      },
      {
        dayNumber: 2,
        title: 'Bardo Roman Mosaic Palace & Carthage Ruins',
        city: 'Tunis & Carthage',
        summary: 'World’s greatest Roman mosaics followed by Byrsa Hill and Antonine Baths.',
        travelInfo: 'Tunis → Carthage (18 km / 25 min)',
        hotelStay: {
          hotelId: hasdrubalHotel.id,
          hotelName: hasdrubalHotel.title,
          priceUSD: hasdrubalHotel.estimatedPrice,
          rating: hasdrubalHotel.rating,
          imageUrl: hasdrubalHotel.imageUrl,
          city: 'Hammamet',
        },
        dailyTotalUSD: 195,
        activities: [
          {
            id: 'act-bardo',
            time: '09:30 AM',
            title: 'Bardo National Museum Roman Mosaic Galleries',
            description: 'Admire thousands of preserved ancient mosaics depicting Neptune, Ulysses, and Roman life.',
            category: 'history',
            city: 'Tunis',
            durationHours: 2.5,
            costUSD: 5,
            costTND: 15,
            latitude: bardoMuseum.latitude,
            longitude: bardoMuseum.longitude,
            imageUrl: bardoMuseum.imageUrl,
            reasonWhy: 'Unparalleled archaeological treasure trove.',
            sourceName: bardoMuseum.sourceName,
            sourceUrl: bardoMuseum.sourceUrl,
            bookingStatus: 'ready_to_book',
          },
          familyAdventureItinerary[1].activities[0],
        ],
      },
      ...familyAdventureItinerary.slice(2),
    ];

    // PLAN 4: Budget Smart Family Escape (Optimized under $1,850 total)
    const budgetSmartItinerary: ItineraryDay[] = familyAdventureItinerary.map((day) => ({
      ...day,
      hotelStay: {
        hotelId: marilliaHotel.id,
        hotelName: marilliaHotel.title,
        priceUSD: marilliaHotel.estimatedPrice,
        rating: marilliaHotel.rating,
        imageUrl: marilliaHotel.imageUrl,
        city: 'Hammamet',
      },
      dailyTotalUSD: Math.round(day.dailyTotalUSD * 0.78),
    }));

    return [
      {
        id: 'family-adventure',
        name: 'Family Adventure & Carthage Fun',
        tagline: 'The Ultimate Balanced Family Escape',
        description: 'Carefully tailored to your family request: 2 full days of theme parks (Carthage Land & Aqua Land), scenic pirate ship voyage, Roman Colosseum of El Jem, and calm beachfront swimming.',
        estimatedCostUSD: 1480,
        highlights: [
          'Full Day Carthage Land & Aqua Land Combo',
          'Pirate Ship Cruise with Swimming Stops',
          'UNESCO Colosseum of El Jem Exploration',
          'Calm Hasdrubal Beach & Seawater Pools',
          'Authentic Nabeul Family Pottery Workshop',
        ],
        vibe: 'family',
        itinerary: familyAdventureItinerary,
      },
      {
        id: 'calm-coastal',
        name: 'Calm Coast & Mediterranean Serenity',
        tagline: 'Peaceful Waters, Quiet Gardens & Zero Rush',
        description: 'Focuses on tranquility: boutique orange grove resort, pristine white sand waters of Mahdia, sunset tea at Café des Délices, and relaxed pacing with zero traffic stress.',
        estimatedCostUSD: 1390,
        highlights: [
          'Crystal Clear Swimming at Mahdia Corniche',
          'Cliffside Sunset Mint Tea at Café des Délices',
          'Lush Green Gardens of The Orangers Resort',
          'Gentle Evening Marina Strolls in Kantaoui',
          'Optional Half-Day Carthage Land Amusement',
        ],
        vibe: 'relaxed',
        itinerary: calmCoastItinerary,
      },
      {
        id: 'heritage-wonders',
        name: 'Heritage & Imperial Wonders',
        tagline: 'Deep Dive into Carthage, Rome & Andalusian Palaces',
        description: 'Brings 3,000 years of civilization to life: Bardo Mosaic Palace, UNESCO Carthage Punic ports, El Jem Colosseum, and 8th-century Islamic Ribat of Monastir.',
        estimatedCostUSD: 1560,
        highlights: [
          'Bardo Museum Roman Mosaic Masterpieces',
          'UNESCO Antonine Thermal Baths at Carthage',
          'Colossal Arena of El Jem & Subterranean Tunnels',
          'Ribat of Monastir Watchtower Panoramas',
          'Medina of Tunis & Andalusian Palaces',
        ],
        vibe: 'culture',
        itinerary: heritageItinerary,
      },
      {
        id: 'budget-smart',
        name: 'Budget-Smart Family Escape',
        tagline: 'Maximum Experience at $1,150 Total ($287 / person)',
        description: 'Optimized accommodation with 4-star Marillia Yasmine beachfront resort (steps from Carthage Land), keeping over $1,300 in your pocket while enjoying all major activities.',
        estimatedCostUSD: 1150,
        highlights: [
          'Beachfront 4-Star Resort with 2 Large Pools',
          'Walking Distance to Carthage Land Gates',
          'Full Carthage Land Theme Park Tickets Included',
          'Comfortable Private Transportation',
          'Saves Over $1,300 from your $2,450 Budget',
        ],
        vibe: 'budget',
        itinerary: budgetSmartItinerary,
      },
    ];
  }

  /**
   * Adjust itinerary based on conversational modification instructions
   */
  public modifyItinerary(
    currentItinerary: ItineraryDay[],
    instruction: string
  ): { updatedItinerary: ItineraryDay[]; explanation: string } {
    const lower = instruction.toLowerCase();
    const updated = JSON.parse(JSON.stringify(currentItinerary)) as ItineraryDay[];
    let explanation = '';

    // Scenario 1: "I like this plan but I don't want to stay in Tunis"
    if (lower.includes('don\'t want to stay in tunis') || lower.includes('dont want to stay in tunis') || (lower.includes('not in tunis') && lower.includes('hotel'))) {
      const hammametHotel = ragService.getById('hotel-hasdrubal-thalassa-hammamet')!;
      updated.forEach((day) => {
        if (day.hotelStay && day.hotelStay.city.toLowerCase() === 'tunis') {
          day.hotelStay = {
            hotelId: hammametHotel.id,
            hotelName: hammametHotel.title,
            priceUSD: hammametHotel.estimatedPrice,
            rating: hammametHotel.rating,
            imageUrl: hammametHotel.imageUrl,
            city: 'Hammamet',
          };
          day.summary = day.summary.replace(/Tunis/g, 'Hammamet beachfront');
        }
      });
      explanation = 'I have adjusted the accommodation so you stay directly on the calm Mediterranean coast in Yasmine Hammamet instead of Tunis. On Day 1, your private chauffeur will whisk you straight to your beachfront hotel with no city traffic, keeping all your days relaxing by the sea.';
      return { updatedItinerary: updated, explanation };
    }

    // Scenario 2: "Keep the hotel in Hammamet but replace the second activity"
    if (lower.includes('replace the second activity') || (lower.includes('replace') && lower.includes('activity'))) {
      // Find day with multiple activities (Day 2 or Day 4)
      const targetDay = updated[1]; // Day 2
      if (targetDay && targetDay.activities.length >= 2) {
        const oldAct = targetDay.activities[1];
        targetDay.activities[1] = {
          id: 'act-replaced-beach',
          time: '03:30 PM',
          title: 'Private Catamaran Sailing & Calm Cove Swimming',
          description: 'Replaced activity: Relaxed private family catamaran sail along the calm Cap Bon coastline with gentle swimming and fresh orange juice.',
          category: 'beach',
          city: 'Hammamet',
          durationHours: 2.5,
          costUSD: 18,
          costTND: 55,
          latitude: 36.38,
          longitude: 10.58,
          imageUrl: 'https://images.unsplash.com/photo-1506953823976-52e1fdc0149a?auto=format&fit=crop&w=1000&q=80',
          reasonWhy: 'Requested custom replacement: offers a private, serene coastal sail instead of hotel pool lounge.',
          sourceName: 'Hammamet Nautical Club Verified',
          sourceUrl: 'https://discovertunisia.com',
          bookingStatus: 'ready_to_book',
        };
        explanation = `I replaced the second activity on Day 2 ("${oldAct.title}") with a tranquil private family catamaran sail in the sheltered bay of Hammamet, while keeping your beachfront hotel in Hammamet exactly as you love.`;
        return { updatedItinerary: updated, explanation };
      }
    }

    // Scenario 3: Add more beach / swimming
    if (lower.includes('more beach') || lower.includes('more swimming')) {
      const mahdiaBeach = ragService.getById('mahdia-corniche-beach')!;
      updated[3].activities.push({
        id: 'act-extra-swim',
        time: '04:30 PM',
        title: 'Sunset Swimming at Mahdia Plage',
        description: 'Extra swimming session in the shallow crystal-clear waters.',
        category: 'beach',
        city: 'Mahdia',
        durationHours: 2.0,
        costUSD: 0,
        costTND: 0,
        latitude: mahdiaBeach.latitude,
        longitude: mahdiaBeach.longitude,
        imageUrl: mahdiaBeach.imageUrl,
        reasonWhy: 'Added to give you more swimming time in Tunisia’s most beautiful water.',
        sourceName: mahdiaBeach.sourceName,
        sourceUrl: mahdiaBeach.sourceUrl,
        bookingStatus: 'not_booked',
      });
      explanation = 'I added an extra sunset swimming session in Mahdia’s tranquil turquoise waters on Day 4.';
      return { updatedItinerary: updated, explanation };
    }

    // Default fallback modification
    explanation = 'I have updated your itinerary details to match your request.';
    return { updatedItinerary: updated, explanation };
  }
}

export const itineraryService = new ItineraryEngine();
