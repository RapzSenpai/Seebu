// Shared tourist-spot catalog for SeeBu.
// Extracted from screens/ExploreScreen.js so Explore, the Maps tab, and the
// Admin panel all render and count the exact same list.
//
// Schema (all fields after `transport` are OPTIONAL — old spots keep working):
//   longDesc      detailed description (About)
//   photos        extra photo URLs; UI falls back to [img]
//   address       full address (Location)
//   howToGetThere short transit summary (Location)
//   hours         opening hours (Hours/Fees)
//   fees          entrance / activity fees (Hours/Fees)
//   bestTime      best time to visit (Tips)
//   duration      suggested visit length (Tips)
//   tips          travel tips (Tips)
//   itinerary     [{ t, title, text }] suggested plan (Itinerary)
//   rating        aggregate 0-5 (header + previews)
//   reviewsCount  total review count
//   reviews       [{ n, r, t }] sample reviews (Reviews)

export const cebuSpots = [
  {
    id: 1,
    type: "Nature",
    title: "Kawasan Falls",
    loc: "Badian",
    coords: { latitude: 9.8034, longitude: 123.3744 },
    img: "https://sugbo.ph/wp-content/uploads/2020/06/Kawasan-Falls-Cebu-The-Island-Nomad-1-1536x1023.jpg",
    desc: "A three-stage cascade of turquoise water, famous for canyoneering adventures.",
    estimatedExpense: "₱250–₱450",
    transport: {
      terminal: "South Bus Terminal (Cebu City)",
      fare: "₱210–₱280",
      schedule: "Every 30 mins (3AM–9PM)",
      instructions: "Take a bus to Badian, then ride a tricycle or habal-habal to the falls entrance.",
      options: [
        { vehicle: "Bus", fare: "₱210–₱280", frequency: "Every 30 mins" },
        { vehicle: "Tricycle", fare: "₱100–₱180", frequency: "On demand" },
        { vehicle: "Habal-habal", fare: "₱120–₱200", frequency: "On demand" }
      ]
    },
    longDesc: "Kawasan's three turquoise tiers cut through Badian's jungle canyon. The first falls is an easy trek and swim; upstream stages are reached by guided canyoneering — jumps, slides, and floats down the river.",
    address: "Matutinao, Badian, Cebu 6031",
    howToGetThere: "Bus to Badian + tricycle to Matutinao jump-off, then 30-min trek or canyoneering entry upstream.",
    hours: "6:00 AM – 5:00 PM daily",
    fees: "Entrance ₱45 • Canyoneering from ₱1,500/person with accredited guide (required)",
    bestTime: "Dry season (Nov–May), weekday mornings",
    duration: "Half day (4–6 hrs with canyoneering)",
    tips: [
      "Wear aqua shoes — rocks are slippery.",
      "Book canyoneering with an accredited operator only.",
      "Bring a dry bag; leave valuables at the jump-off."
    ],
    itinerary: [
      { t: "8:00 AM", title: "Arrive + briefing", text: "Register at Matutinao and meet your canyoneering guide." },
      { t: "9:00 AM", title: "Canyoneering downstream", text: "Jumps and floats through the canyon to the main falls." },
      { t: "1:00 PM", title: "Swim + lunch", text: "Swim the turquoise basin, eat at riverside stalls, head back." }
    ],
    rating: 4.8,
    reviewsCount: 1240,
    reviews: [
      { n: "Marina D.", r: 5, t: "Canyoneering highlight of our Cebu trip. Water unreal." },
      { n: "Jake T.", r: 5, t: "Go early to beat crowds. Guide was excellent." }
    ]
  },
  {
    id: 2,
    type: "Adventure",
    title: "Oslob Whale Sharks",
    loc: "Oslob",
    coords: { latitude: 9.4638, longitude: 123.3811 },
    img: "https://i0.wp.com/www.projectlupad.com/wp-content/uploads/2018/02/Whale-Shark-Oslob-Cebu-Philippines-Aerial-View-Project-LUPAD.jpeg",
    desc: "A world-famous site where you can swim alongside gentle whale shark giants.",
    estimatedExpense: "₱300–₱600",
    transport: {
      terminal: "South Bus Terminal (Cebu City)",
      fare: "₱220–₱320",
      schedule: "Every 20 mins (4AM–8PM)",
      instructions: "Ride a bus to Oslob, then take a tricycle to the whale shark area.",
      options: [
        { vehicle: "Bus", fare: "₱220–₱320", frequency: "Every 20 mins" },
        { vehicle: "Tricycle", fare: "₱70–₱130", frequency: "On demand" },
        { vehicle: "Van", fare: "₱150–₱250", frequency: "Every 30 mins" }
      ]
    },
    longDesc: "At Tan-awan Bay, local fishermen attract resident whale sharks (butanding) close to shore. After a mandatory briefing you get 30 minutes in the water — snorkel or dive beside animals up to 12 meters long.",
    address: "Tan-awan, Oslob, Cebu 6025",
    howToGetThere: "Bus to Oslob town, tricycle to the Tan-awan briefing center.",
    hours: "6:00 – 11:30 AM daily (cutoff varies with crowd)",
    fees: "Snorkel ₱500 local / ₱1,000 foreign • Dive ₱1,500+",
    bestTime: "Early morning on weekdays; avoid holidays",
    duration: "Half day (incl. Tumalog combo)",
    tips: [
      "No touching, no flash photography — 4m distance rule.",
      "Arrive before 7 AM to skip the long queue.",
      "Pair with Tumalog Falls, 15 mins away."
    ],
    itinerary: [
      { t: "6:00 AM", title: "Briefing + gear", text: "Register, watch the orientation, gear up." },
      { t: "7:00 AM", title: "Swim", text: "30 minutes with the whale sharks." },
      { t: "9:00 AM", title: "Side trips", text: "Tumalog Falls or Sumilon sandbar after." }
    ],
    rating: 4.6,
    reviewsCount: 2100,
    reviews: [
      { n: "Sofia R.", r: 5, t: "Surreal to float next to something that big." },
      { n: "Kenji M.", r: 4, t: "Amazing animals, but go super early — queues grow fast." }
    ]
  },
  {
    id: 3,
    type: "History",
    title: "Magellan's Cross",
    loc: "Cebu City",
    coords: { latitude: 10.2936, longitude: 123.9019 },
    img: "https://upload.wikimedia.org/wikipedia/commons/0/06/Cebu_magellans_cross_exterior.jpg",
    desc: "A significant historical landmark planted by Portuguese and Spanish explorers in 1521.",
    estimatedExpense: "₱80–₱180",
    transport: {
      terminal: "Cebu City Proper",
      fare: "₱20–₱50",
      schedule: "Every 10 mins (5AM–10PM)",
      instructions: "Use a jeepney, taxi, or ride-hailing app for a short city trip.",
      options: [
        { vehicle: "Jeepney", fare: "₱12–₱20", frequency: "Every 10 mins" },
        { vehicle: "Taxi", fare: "₱80–₱150", frequency: "24/7" },
        { vehicle: "Ride-hailing", fare: "₱90–₱180", frequency: "24/7" }
      ]
    },
    longDesc: "Planted in 1521 by Magellan's expedition, the cross marks the birth of Christianity in the Philippines. The original is encased in tindalo wood inside an octagonal chapel whose ceiling shows the baptism of Rajah Humabon.",
    address: "Magallanes St, Cebu City 6000 (beside Basilica del Sto. Niño)",
    howToGetThere: "Any downtown jeepney or short taxi/Grab ride; walkable from Colon.",
    hours: "8:00 AM – 6:00 PM daily",
    fees: "Free (donations welcome)",
    bestTime: "Weekday mornings; Sundays are packed",
    duration: "30–45 mins (pair with the Basilica + Fort San Pedro)",
    tips: [
      "Combine with Basilica del Sto. Niño next door.",
      "Watch belongings — downtown gets busy.",
      "Look up: the ceiling mural tells the 1521 story."
    ],
    itinerary: [
      { t: "9:00 AM", title: "The Cross", text: "See the cross and chapel ceiling." },
      { t: "9:30 AM", title: "Basilica", text: "Walk to the Basilica museum and church." },
      { t: "11:00 AM", title: "Fort San Pedro", text: "Finish the heritage triangle on foot." }
    ],
    rating: 4.5,
    reviewsCount: 3200,
    reviews: [
      { n: "Paolo G.", r: 5, t: "Small site, huge history. Basilica combo is a must." }
    ]
  },
  {
    id: 4,
    type: "Beach",
    title: "Pescador Island",
    loc: "Moalboal",
    coords: { latitude: 9.9234, longitude: 123.3661 },
    img: "https://cdn.getyourguide.com/img/location/5a9d5ab495f1f.jpeg/88.jpg",
    desc: "A world-class diving spot known for the 'Sardine Run' and vibrant coral reefs.",
    estimatedExpense: "₱350–₱700",
    transport: {
      terminal: "South Bus Terminal (Cebu City)",
      fare: "₱180–₱280",
      schedule: "Every 30 mins (4AM–8PM)",
      instructions: "Board a bus for Moalboal, then take a tricycle to the jump-off point.",
      options: [
        { vehicle: "Bus", fare: "₱180–₱280", frequency: "Every 30 mins" },
        { vehicle: "Tricycle", fare: "₱60–₱120", frequency: "On demand" },
        { vehicle: "Habal-habal", fare: "₱80–₱150", frequency: "On demand" }
      ]
    },
    longDesc: "A tiny limestone islet off Moalboal with wall dives, sea turtles, and schools of sardines swirling in tornado formations. The Sardine Run is visible even while snorkeling from Panagsama Beach.",
    address: "Pescador Island, Moalboal, Cebu 6032",
    howToGetThere: "Bus to Moalboal, tricycle to Panagsama Beach, then 15-min pump boat.",
    hours: "Boat tours from 6:00 AM",
    fees: "Island hopping ₱1,500–₱2,500/boat (split up to 6) • Dive ₱1,800+",
    bestTime: "March–May for calm seas and visibility",
    duration: "Half to full day",
    tips: [
      "Snorkel the Sardine Run at Panagsama if boats are full.",
      "Bring reef-safe sunscreen.",
      "Turtles feed near the drop-off at 8–10m."
    ],
    itinerary: [
      { t: "6:00 AM", title: "Boat out", text: "Head to Pescador for the morning dive/snorkel." },
      { t: "10:00 AM", title: "Sardine Run", text: "Snorkel the sardine school off Panagsama." },
      { t: "2:00 PM", title: "White Beach", text: "Chill at Moalboal's White Beach for sunset." }
    ],
    rating: 4.7,
    reviewsCount: 860
  },
  {
    id: 5,
    type: "Nature",
    title: "Sirao Flower Garden",
    loc: "Busay",
    coords: { latitude: 10.4035, longitude: 123.8694 },
    img: "https://sugbo.ph/wp-content/uploads/2017/12/new-sirao-flower-garden-farm4.jpg",
    desc: "Known as the 'Little Amsterdam' of Cebu, featuring vibrant celosia flowers.",
    estimatedExpense: "₱150–₱300",
    transport: {
      terminal: "Cebu City Proper",
      fare: "₱60–₱120",
      schedule: "Every 15 mins (6AM–10PM)",
      instructions: "Ride a taxi or habal-habal uphill to the garden entrance.",
      options: [
        { vehicle: "Taxi", fare: "₱120–₱220", frequency: "24/7" },
        { vehicle: "Habal-habal", fare: "₱70–₱120", frequency: "On demand" },
        { vehicle: "Private car", fare: "₱150–₱250", frequency: "24/7" }
      ]
    },
    longDesc: "Terraced highland beds of red and yellow celosia — Cebu's 'Little Amsterdam' — plus sunflower lanes, photo props, and a giant hand overlooking the hills. Best paired with Temple of Leah nearby.",
    address: "Sirao, Busay, Cebu City 6000",
    howToGetThere: "Taxi or habal-habal uphill from JY Square; ~30 mins from downtown.",
    hours: "6:00 AM – 6:30 PM daily",
    fees: "Entrance ₱100",
    bestTime: "Golden hour (4–6 PM) for photos",
    duration: "1–2 hrs",
    tips: [
      "Visit on weekdays — weekends queue for photo spots.",
      "Bring a jacket; Busay is cooler than the city.",
      "Pair with Temple of Leah, 10 mins away."
    ],
    itinerary: [
      { t: "3:00 PM", title: "Garden stroll", text: "Flower lanes and photo props." },
      { t: "4:30 PM", title: "Golden hour", text: "Giant hand deck at sunset light." },
      { t: "5:30 PM", title: "Temple of Leah", text: "Catch dusk at the temple nearby." }
    ],
    rating: 4.4,
    reviewsCount: 1500
  },
  {
    id: 6,
    type: "History",
    title: "Temple of Leah",
    loc: "Busay",
    coords: { latitude: 10.3697, longitude: 123.8732 },
    img: "https://sugbo.ph/wp-content/uploads/2020/03/Temple-of-Leah-Busay-Cebu-1-1024x575.jpg",
    desc: "A massive Roman-style shrine built as a symbol of undying love.",
    estimatedExpense: "₱120–₱250",
    transport: {
      terminal: "Cebu City Proper",
      fare: "₱60–₱120",
      schedule: "Every 15 mins (6AM–10PM)",
      instructions: "A taxi or habal-habal is the easiest way to reach this hilltop shrine.",
      options: [
        { vehicle: "Taxi", fare: "₱110–₱200", frequency: "24/7" },
        { vehicle: "Habal-habal", fare: "₱70–₱120", frequency: "On demand" },
        { vehicle: "Van", fare: "₱100–₱180", frequency: "Every 20 mins" }
      ]
    },
    longDesc: "A sprawling Greco-Roman edifice of columns, lions, and sweeping staircases, built as a mausoleum and monument to Leah Adarna. The rooftop deck gives panoramic views over Cebu City.",
    address: "Roosevelt, Busay, Cebu City 6000",
    howToGetThere: "Taxi or habal-habal from downtown; steep uphill, ~25 mins.",
    hours: "6:00 AM – 11:00 PM daily",
    fees: "Entrance ₱80",
    bestTime: "Late afternoon for sunset over the city",
    duration: "1–2 hrs",
    tips: [
      "Stay for sunset — city lights switch on below.",
      "Wear comfy shoes; lots of stairs.",
      "Small café inside for refreshments."
    ],
    itinerary: [
      { t: "4:00 PM", title: "Explore halls", text: "Statues, library, and Leah's gallery." },
      { t: "5:30 PM", title: "Sunset deck", text: "Rooftop panorama as the sun drops." },
      { t: "7:00 PM", title: "Dinner in Busay", text: "Mountain-view restaurants on the way down." }
    ],
    rating: 4.5,
    reviewsCount: 2800,
    reviews: [
      { n: "Andrea L.", r: 5, t: "Greece in Cebu! Sunset views are unreal." },
      { n: "Miguel S.", r: 4, t: "Grand and romantic. Gets crowded at golden hour." }
    ]
  },
  {
    id: 7,
    type: "Beach",
    title: "Virgin Island",
    loc: "Bantayan Island",
    coords: { latitude: 11.2345, longitude: 123.7123 },
    img: "https://i.pinimg.com/originals/7b/ad/df/7baddf5c13554193d6bd34da40bb391e.jpg",
    desc: "Crystal clear waters and white powdery sand perfect for a relaxing getaway.",
    estimatedExpense: "₱400–₱800",
    transport: {
      terminal: "Hagnaya Port (Cebu)",
      fare: "₱250–₱400",
      schedule: "Every 1–2 hrs (5AM–5PM)",
      instructions: "Take a ferry from Hagnaya Port, then a tricycle or habal-habal to your stay.",
      options: [
        { vehicle: "Ferry", fare: "₱250–₱400", frequency: "Every 1–2 hrs" },
        { vehicle: "Tricycle", fare: "₱50–₱100", frequency: "On demand" },
        { vehicle: "Habal-habal", fare: "₱70–₱120", frequency: "On demand" }
      ]
    },
    longDesc: "A powder-white sandbar off Bantayan with knee-deep turquoise water for hundreds of meters. Go by pump boat from Santa Fe, wade, picnic, and snorkel the gentle reef edge.",
    address: "Virgin Island, Santa Fe, Bantayan Island, Cebu",
    howToGetThere: "Ferry Hagnaya → Santa Fe, then pump boat from Sugar Beach area.",
    hours: "Day trips 7:00 AM – 4:00 PM (tide-dependent)",
    fees: "Boat ₱2,000–₱3,000/group • Cottage rental on island",
    bestTime: "Summer (Mar–May) for the calmest seas",
    duration: "Full day",
    tips: [
      "Check tide charts — the sandbar shrinks at high tide.",
      "Pack food and water; little is sold on the islet.",
      "Bring reef shoes for the rocky patches."
    ],
    itinerary: [
      { t: "7:00 AM", title: "Ferry + boat", text: "Cross to Santa Fe, hop on the pump boat." },
      { t: "10:00 AM", title: "Sandbar", text: "Swim, picnic, and drone shots." },
      { t: "3:00 PM", title: "Back to Santa Fe", text: "Sunset drinks on the boardwalk." }
    ],
    rating: 4.6,
    reviewsCount: 540
  },
  {
    id: 8,
    type: "Nature",
    title: "Tumalog Falls",
    loc: "Oslob",
    coords: { latitude: 9.4842, longitude: 123.3683 },
    img: "https://www.travel-palawan.com/wp-content/uploads/2020/03/olsob-cebu-tumalog-falls.jpeg",
    desc: "A curtain-like waterfall known for its mossy walls and refreshing mist.",
    estimatedExpense: "₱220–₱400",
    transport: {
      terminal: "South Bus Terminal (Cebu City)",
      fare: "₱220–₱320",
      schedule: "Every 20 mins (4AM–8PM)",
      instructions: "Take a bus to Oslob, then use a tricycle or habal-habal to the site.",
      options: [
        { vehicle: "Bus", fare: "₱220–₱320", frequency: "Every 20 mins" },
        { vehicle: "Tricycle", fare: "₱70–₱130", frequency: "On demand" },
        { vehicle: "Habal-habal", fare: "₱90–₱160", frequency: "On demand" }
      ]
    },
    longDesc: "A wide, veil-like cascade draping a mossy cliff — softer and calmer than Kawasan. Habal-habal takes you most of the way down; the falls pool is shallow, misty, and photogenic.",
    address: "Luka, Oslob, Cebu 6025",
    howToGetThere: "Bus to Oslob, habal-habal from the highway jump-off.",
    hours: "7:00 AM – 5:00 PM (may close after heavy rain)",
    fees: "Entrance ₱20 + habal-habal ₱50/head",
    bestTime: "Mornings for the misty veil effect",
    duration: "1–2 hrs",
    tips: [
      "Swimming is limited — enjoy the mist and photos.",
      "Slippery path; wear grip footwear.",
      "Easy combo with the whale sharks."
    ],
    itinerary: [
      { t: "7:00 AM", title: "Whale sharks first", text: "Do Oslob early, falls after." },
      { t: "10:00 AM", title: "Tumalog", text: "Mist, photos, quick dip." },
      { t: "12:00 PM", title: "Lunch in town", text: "Seafood by the boulevard." }
    ],
    rating: 4.5,
    reviewsCount: 980
  },
  {
    id: 9,
    type: "History",
    title: "Fort San Pedro",
    loc: "Cebu City",
    coords: { latitude: 10.2925, longitude: 123.9059 },
    img: "https://www.roadaffair.com/wp-content/uploads/2019/08/fort-san-pedro-cebu-philippines-shutterstock_720035992.jpg",
    desc: "The oldest triangular bastion fort in the country, dating back to the 1700s.",
    estimatedExpense: "₱90–₱180",
    transport: {
      terminal: "Cebu City Proper",
      fare: "₱20–₱50",
      schedule: "Every 10 mins (5AM–10PM)",
      instructions: "Walk, take a jeepney, or grab a taxi from nearby city stops.",
      options: [
        { vehicle: "Jeepney", fare: "₱12–₱20", frequency: "Every 10 mins" },
        { vehicle: "Taxi", fare: "₱70–₱130", frequency: "24/7" },
        { vehicle: "Walking", fare: "₱0", frequency: "Any time" }
      ]
    },
    longDesc: "The country's oldest triangular fort, built in 1738 around a Spanish core. Walk the coral-stone walls, browse the small museum of Spanish-era artifacts, and rest in the walled garden by the sea.",
    address: "Plaza Independencia, Cebu City 6000",
    howToGetThere: "Walkable from Magellan's Cross area; any downtown jeepney.",
    hours: "8:00 AM – 7:00 PM daily",
    fees: "Entrance ₱30",
    bestTime: "Late afternoon for sea breeze and light",
    duration: "About 1 hr",
    tips: [
      "Finish the heritage triangle: Cross → Basilica → Fort.",
      "Museum labels are quick reads — 20 mins inside.",
      "Plaza Independencia is nice for sunset after."
    ],
    itinerary: [
      { t: "3:00 PM", title: "Fort walls", text: "Walk the ramparts and garden." },
      { t: "4:00 PM", title: "Museum", text: "Spanish-era documents and relics." },
      { t: "5:00 PM", title: "Plaza sunset", text: "Unwind across the street." }
    ],
    rating: 4.4,
    reviewsCount: 1900
  },
  {
    id: 10,
    type: "Beach",
    title: "White Beach",
    loc: "Camotes Islands",
    coords: { latitude: 10.6455, longitude: 124.3168 },
    img: "https://ik.imagekit.io/tvlk/blog/2023/03/shutterstock_1139732165.jpg?tr=dpr-2,w-675",
    desc: "A pristine stretch of sand away from the crowds, great for sunset watching.",
    estimatedExpense: "₱300–₱600",
    transport: {
      terminal: "Danao Port (Cebu)",
      fare: "₱220–₱350",
      schedule: "Every 1–2 hrs (5AM–5PM)",
      instructions: "Take a ferry from Danao Port, then a tricycle or habal-habal to the beach.",
      options: [
        { vehicle: "Ferry", fare: "₱220–₱350", frequency: "Every 1–2 hrs" },
        { vehicle: "Tricycle", fare: "₱40–₱80", frequency: "On demand" },
        { vehicle: "Habal-habal", fare: "₱60–₱100", frequency: "On demand" }
      ]
    },
    longDesc: "Camotes' quiet powder-sand beach on Santiago Bay — calm water, cottages for rent, and famous sunset views. Far less crowded than Mactan, ideal for an overnight escape.",
    address: "Santiago, San Francisco, Camotes Islands, Cebu",
    howToGetThere: "Ferry Danao → Consuelo Port, tricycle to Santiago Bay.",
    hours: "Open 24 hrs; cottage rentals 8 AM – 5 PM",
    fees: "Entrance ₱50–₱100 • Cottages ₱300–₱800",
    bestTime: "Dry season sunsets; weekdays for solitude",
    duration: "Half to full day (overnight recommended)",
    tips: [
      "Stay overnight — day trips feel rushed with ferry schedules.",
      "Try the island's famed danggit (dried fish).",
      "Rent a motorbike to tour lake + caves nearby."
    ],
    itinerary: [
      { t: "9:00 AM", title: "Ferry + beach", text: "Arrive, swim, claim a cottage." },
      { t: "2:00 PM", title: "Island loop", text: "Lake Danao and Bukilat Cave." },
      { t: "5:30 PM", title: "Sunset", text: "Santiago Bay sunset finale." }
    ],
    rating: 4.5,
    reviewsCount: 720
  },
  {
    id: 11,
    type: "Adventure",
    title: "10,000 Roses Cafe",
    loc: "Cordova",
    coords: { latitude: 10.2737, longitude: 123.9351 },
    img: "https://1.bp.blogspot.com/-V_Jw6sGHoUo/YRDbzvIeT7I/AAAAAAAAWFo/c-QYYmd61hkgMNghdRWSPHN-2y8lhkXNwCLcBGAsYHQ/s16000/1628494390753.jpg",
    desc: "A sea of white LED roses that light up at night with a view of the Cebu skyline.",
    estimatedExpense: "₱140–₱260",
    transport: {
      terminal: "Cebu City Proper",
      fare: "₱50–₱90",
      schedule: "Every 15 mins (5AM–11PM)",
      instructions: "Take a taxi or private car to Cordova for a short scenic ride.",
      options: [
        { vehicle: "Taxi", fare: "₱100–₱180", frequency: "24/7" },
        { vehicle: "Private car", fare: "₱120–₱220", frequency: "24/7" },
        { vehicle: "Van", fare: "₱80–₱140", frequency: "Every 20 mins" }
      ]
    },
    longDesc: "Ten thousand glowing LED roses spread toward the sea, lighting up at dusk against the Cebu skyline and the CCLEX bridge. A café, boardwalk, and photo decks complete the nighttime attraction.",
    address: "Day-as, Cordova, Cebu 6017",
    howToGetThere: "Taxi/Grab across the Marcelo Fernan Bridge; ~30 mins from the city.",
    hours: "10:00 AM – 10:00 PM (roses light at 6 PM)",
    fees: "Entrance ₱30 (consumable options available)",
    bestTime: "Blue hour, 6:00–7:00 PM",
    duration: "1–2 hrs",
    tips: [
      "Arrive by 5:30 PM to catch day-to-night transition.",
      "Pair with a Cordova seafood dinner.",
      "Tripods allowed; weekends are packed."
    ],
    itinerary: [
      { t: "5:30 PM", title: "Arrive", text: "Snacks at the café before dark." },
      { t: "6:30 PM", title: "Lights on", text: "Roses + skyline + bridge photos." },
      { t: "8:00 PM", title: "Dinner", text: "Seafood by the Cordova baywalk." }
    ],
    rating: 4.3,
    reviewsCount: 2600,
    reviews: [
      { n: "Chris P.", r: 4, t: "Cheesy but magical at night. Great date spot." }
    ]
  },
  {
    id: 12,
    type: "History",
    title: "Simala Shrine",
    loc: "Sibonga",
    coords: { latitude: 10.0039, longitude: 123.6033 },
    img: "https://gocebutours.com/wp-content/uploads/2023/04/simala-wideview-min.jpg",
    desc: "A castle-like church known for its miraculous reputation and grand architecture.",
    estimatedExpense: "₱180–₱320",
    transport: {
      terminal: "South Bus Terminal (Cebu City)",
      fare: "₱180–₱260",
      schedule: "Every 20 mins (4AM–8PM)",
      instructions: "Take a bus to Sibonga, then ride a tricycle to the shrine entrance.",
      options: [
        { vehicle: "Bus", fare: "₱180–₱260", frequency: "Every 20 mins" },
        { vehicle: "Tricycle", fare: "₱50–₱90", frequency: "On demand" },
        { vehicle: "Van", fare: "₱90–₱150", frequency: "Every 30 mins" }
      ]
    },
    longDesc: "The castle-like Monastery of the Holy Eucharist draws millions of pilgrims to its miraculous Virgin. Climb the grand staircases through ornate halls, light a candle, and view the hills from the towers.",
    address: "Lindogon, Sibonga, Cebu 6020",
    howToGetThere: "Bus to Sibonga crossing, tricycle uphill to the shrine.",
    hours: "6:00 AM – 7:00 PM (strict dress code: no shorts/sleeveless)",
    fees: "Free (candles from ₱20)",
    bestTime: "Weekday mornings; 13th of the month is packed",
    duration: "2–3 hrs",
    tips: [
      "Follow the dress code or rent a wrap at the gate.",
      "Bring coins for candle offerings.",
      "Expect long lines on Marian feast days."
    ],
    itinerary: [
      { t: "8:00 AM", title: "Arrive early", text: "Beat the pilgrim buses." },
      { t: "9:00 AM", title: "Shrine + mass", text: "Tour the halls, light candles." },
      { t: "12:00 PM", title: "Lunch", text: "Carinderias along the highway." }
    ],
    rating: 4.7,
    reviewsCount: 3400,
    reviews: [
      { n: "Rosa M.", r: 5, t: "Deeply moving place. Architecture is stunning." },
      { n: "Daniel K.", r: 5, t: "Go on a weekday. Weekend crowds are intense." }
    ]
  }
];
