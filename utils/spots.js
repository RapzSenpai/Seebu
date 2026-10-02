// Shared tourist-spot catalog for SeeBu.
// Extracted from screens/ExploreScreen.js so Explore, the Maps tab, and the
// Admin panel all render and count the exact same list.

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
    }
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
        { vehicle: "Tricycle", fare: "₱80–₱150", frequency: "On demand" },
        { vehicle: "Van", fare: "₱150–₱250", frequency: "Every 30 mins" }
      ]
    }
  },
  { 
    id: 3, 
    type: "History", 
    title: "Magellan's Cross", 
    loc: "Cebu City", 
    coords: { latitude: 10.2936, longitude: 123.9019 }, 
    img: "https://www.vacationhive.com/images/spots/cebu-magellans-cross-banner.png", 
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
    }
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
    }
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
    }
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
    }
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
    }
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
    }
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
    }
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
    }
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
    }
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
    }
  }
];
