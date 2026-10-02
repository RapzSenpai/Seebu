# CAPSTONE PROJECT

---

## **SeeBu: A Mobile Tourism Guide Application for Cebu, Philippines**

**A Capstone Project Presented to the Faculty of**  
**[Your School / Department Name]**  
**In Partial Fulfillment of the Requirements for the Degree of**  
**[Your Degree Program, e.g., Bachelor of Science in Information Technology]**

---

**Submitted by:**  
[Your Full Name]  
[Student ID Number]

**Adviser:**  
[Adviser Name]

**Date:**  
July 2026

---

## Table of Contents

1. [Abstract](#1-abstract)
2. [Introduction](#2-introduction)
3. [Background of the Study](#3-background-of-the-study)
4. [Statement of the Problem](#4-statement-of-the-problem)
5. [Objectives of the Study](#5-objectives-of-the-study)
6. [Scope and Limitations](#6-scope-and-limitations)
7. [Significance of the Study](#7-significance-of-the-study)
8. [Review of Related Literature and Studies](#8-review-of-related-literature-and-studies)
9. [Conceptual Framework](#9-conceptual-framework)
10. [Methodology](#10-methodology)
11. [System Design and Architecture](#11-system-design-and-architecture)
12. [Features and Functionality](#12-features-and-functionality)
13. [Technology Stack](#13-technology-stack)
14. [Implementation](#14-implementation)
15. [Testing and Evaluation](#15-testing-and-evaluation)
16. [Results and Discussion](#16-results-and-discussion)
17. [Conclusion](#17-conclusion)
18. [Recommendations](#18-recommendations)
19. [References](#19-references)
20. [Appendices](#20-appendices)

---

## 1. Abstract

Cebu is one of the most visited provinces in the Philippines, offering beaches, waterfalls, historical landmarks, and adventure activities. Despite its popularity, many tourists still rely on scattered online sources, social media posts, and word-of-mouth recommendations to plan their trips. This makes travel planning inefficient and often leads to missed destinations or poor route decisions.

**SeeBu** is a cross-platform mobile tourism guide application developed to help users discover, explore, and navigate popular tourist spots in Cebu. The application provides categorized destination listings, interactive maps, detailed spot information, verified local tour guide contacts, and user account management. Built using **React Native with Expo**, **Firebase Authentication**, **Cloud Firestore**, and **React Native Maps**, SeeBu delivers a modern, mobile-first experience on both Android and iOS.

This capstone project demonstrates how mobile technology can improve local tourism by centralizing destination information, supporting location-based navigation, and offering a personalized user experience through profiles, themes, and saved preferences. The system was designed, developed, and tested to address the need for a reliable, user-friendly, and locally focused travel companion for Cebu.

**Keywords:** mobile application, tourism, Cebu, React Native, Firebase, GPS navigation, travel guide

---

## 2. Introduction

Tourism is a major economic driver in the Philippines, and Cebu consistently ranks among the country’s top destinations. From the turquoise waters of Kawasan Falls to the historical significance of Magellan’s Cross, Cebu offers a wide range of attractions for local and international travelers. However, the growing number of tourists also highlights a gap in accessible, organized, and mobile-friendly travel tools tailored specifically for the province.

Most travelers today use generic travel apps or social media platforms that are not optimized for Cebu’s unique destinations. Information is often incomplete, outdated, or spread across multiple websites. SeeBu was created to solve this problem by offering a dedicated mobile platform that combines destination discovery, map-based navigation, and user personalization in one application.

This capstone project presents the development of SeeBu as a practical solution for digital tourism in Cebu. It covers the problem being addressed, the system’s design and implementation, and the impact it can have on travelers, local guides, and the tourism industry.

---

## 3. Background of the Study

Cebu has long been known as the **“Queen City of the South”** and a gateway to the Visayas region. Its tourism offerings include:

- **Natural attractions** — Kawasan Falls, Tumalog Falls, Sirao Flower Garden
- **Beach destinations** — Moalboal, Bantayan Island, Camotes Islands
- **Historical sites** — Magellan’s Cross, Fort San Pedro, Temple of Leah
- **Adventure experiences** — Oslob whale shark watching, canyoneering, diving

The rise of smartphones and mobile internet has changed how people travel. According to industry trends, modern tourists expect instant access to maps, photos, reviews, and booking options from their phones. Mobile applications such as Google Maps, TripAdvisor, and Klook are widely used, but they often lack deep local context for specific regions like Cebu.

SeeBu was conceptualized as a **local-first tourism app** — one that highlights Cebu’s most iconic spots, supports easy navigation, and connects travelers with verified tour guides. The name **“SeeBu”** reflects the project’s purpose: helping users **“see Cebu”** through a smart and accessible mobile platform.

---

## 4. Statement of the Problem

The study addresses the following problems:

1. **Scattered tourism information** — Tourist spot details are spread across blogs, Facebook pages, and travel websites, making planning time-consuming.
2. **Limited local-focused mobile apps** — Existing apps are often global in scope and do not prioritize Cebu-specific destinations and travel patterns.
3. **Navigation difficulties** — Many travelers struggle to locate attractions accurately, especially in rural or less-developed areas.
4. **Lack of trusted local guide access** — Tourists may find it hard to identify reliable guides for activities such as canyoneering, diving, or historical tours.
5. **No personalized travel experience** — Generic platforms do not offer user accounts, saved preferences, or customizable app settings for repeat travelers.

---

## 5. Objectives of the Study

### General Objective

To design and develop **SeeBu**, a mobile tourism guide application that helps users discover, explore, and navigate tourist destinations in Cebu, Philippines.

### Specific Objectives

1. To identify and compile relevant tourist destinations in Cebu with accurate location data.
2. To implement a mobile application with categorized destination browsing and search functionality.
3. To integrate interactive maps and GPS-based navigation for tourist spots.
4. To provide detailed information for each destination, including descriptions, images, and coordinates.
5. To develop a secure user authentication and profile management system using Firebase.
6. To include a directory of verified local tour guides for selected destinations.
7. To support light and dark mode themes for improved usability.
8. To test the application for functionality, usability, and performance on mobile devices.

---

## 6. Scope and Limitations

### Scope

The project covers:

- Development of a cross-platform mobile app using React Native and Expo
- Listing of **12 major tourist spots** in Cebu across categories: Nature, Beach, History, and Adventure
- Search and filter features for destinations
- Interactive map view with markers and location support
- Spot detail pages with images, descriptions, and guide information
- User registration, login, logout, and profile editing
- Firebase Authentication and Firestore integration
- Settings page with theme switching and account options

### Limitations

The project does not currently include:

- Real-time online booking or payment processing
- Live chat or messaging between users and guides
- Admin dashboard for managing destinations
- Offline map support
- Multi-language support
- Full backend CMS for dynamic content updates
- Actual GPS routing API integration beyond opening external map applications

The app currently uses **static/mock data** for some guide profiles and user statistics, which can be expanded in future versions.

---

## 7. Significance of the Study

This project is significant to the following groups:

| Stakeholder | Benefit |
|---|---|
| **Tourists / Travelers** | Easier trip planning, faster discovery of destinations, and better navigation |
| **Local Tour Guides** | Increased visibility and a platform to showcase verified services |
| **Tourism Industry** | Supports digital promotion of Cebu as a travel destination |
| **Students / Developers** | Demonstrates practical use of mobile development, cloud services, and UX design |
| **Community** | Encourages local economic activity through tourism awareness |

SeeBu also serves as a model for building **region-specific digital tourism solutions** that can be adapted to other provinces in the Philippines.

---

## 8. Review of Related Literature and Studies

### Mobile Tourism Applications

Mobile tourism apps have become essential travel tools. Studies show that travelers prefer applications that combine maps, reviews, photos, and personalized recommendations in one interface. Apps like TripAdvisor and Google Travel succeed because they reduce information overload and simplify decision-making.

### Location-Based Services (LBS)

GPS and map-based services allow applications to show nearby attractions and support navigation. In tourism apps, LBS improves user experience by connecting digital information with physical locations. SeeBu applies this through map markers and coordinate-based destination data.

### Cloud-Based Authentication and Data Storage

Firebase is widely used in mobile development because it provides secure authentication, real-time databases, and scalable backend services without requiring a custom server setup. This makes it suitable for student capstone projects and startup-level applications.

### User Experience (UX) in Travel Apps

Research in human-computer interaction emphasizes clean navigation, fast loading, visual content, and accessibility features such as dark mode. SeeBu follows these principles through tab-based navigation, card layouts, and theme customization.

### Local Tourism Digitalization

Local government units and tourism boards increasingly promote digital tools to attract visitors. A Cebu-focused app aligns with efforts to modernize tourism services and make destination information more accessible to both domestic and foreign travelers.

---

## 9. Conceptual Framework

The project follows the **Input–Process–Output (IPO)** model:

```
INPUT                    PROCESS                      OUTPUT
─────────────────────────────────────────────────────────────────
Tourist spot data    →   System design            →   SeeBu Mobile App
User requirements  →   App development          →   Destination explorer
Cebu location info →   Firebase integration     →   User accounts
Map coordinates    →   UI/UX implementation     →   Interactive maps
Guide information  →   Testing & evaluation     →   Improved travel experience
```

### System Flow

1. User opens the app
2. User logs in or registers
3. User browses or searches destinations
4. User views spot details and map location
5. User contacts a guide or opens navigation
6. User manages profile and settings

---

## 10. Methodology

The project used the **Agile / Iterative Development** approach:

| Phase | Activities |
|---|---|
| **1. Planning** | Topic selection, requirements gathering, feature listing |
| **2. Analysis** | Problem identification, user needs, competitor review |
| **3. Design** | Wireframes, UI theme, database structure, navigation flow |
| **4. Development** | Frontend screens, Firebase setup, maps integration |
| **5. Testing** | Functional testing, UI testing, device testing |
| **6. Deployment** | Expo build and demonstration |
| **7. Documentation** | Capstone manuscript and presentation preparation |

### Requirements Gathering

Requirements were based on:

- Common traveler needs (search, maps, details, account)
- Features found in popular tourism apps
- Technical feasibility using React Native and Firebase
- Capstone timeline and resource constraints

---

## 11. System Design and Architecture

### High-Level Architecture

```
┌─────────────────────────────────────────────┐
│              SeeBu Mobile App               │
│         (React Native + Expo)               │
├─────────────────────────────────────────────┤
│  Screens                                    │
│  • Login / Register                         │
│  • Explore                                  │
│  • Maps / Spot Detail                       │
│  • Profile                                  │
│  • Settings                                 │
├─────────────────────────────────────────────┤
│  Core Modules                               │
│  • Navigation (React Navigation)            │
│  • Theme Context (Light/Dark Mode)          │
│  • Map Component (React Native Maps)        │
│  • Location Services (Expo Location)        │
├─────────────────────────────────────────────┤
│  Firebase Backend                           │
│  • Authentication                           │
│  • Cloud Firestore (User Profiles)          │
└─────────────────────────────────────────────┘
```

### Navigation Structure

- **Unauthenticated users:** Login → Register
- **Authenticated users:** Main Tab Navigator
  - **Explore** — Browse and search destinations
  - **Maps** — Spot detail and map view
  - **Settings** — Account, theme, logout
- **Stack screens:** Profile, Spot Detail

### Database Design (Firestore)

**Collection: `users`**

| Field | Type | Description |
|---|---|---|
| `uid` | string | Firebase user ID |
| `displayName` | string | User's full name |
| `email` | string | User email address |
| `profileImg` | string | Profile image URL |

---

## 12. Features and Functionality

### 12.1 User Authentication
- Email and password registration
- Secure login with Firebase Authentication
- Password reset support
- Persistent login sessions using AsyncStorage
- Logout functionality

### 12.2 Explore Destinations
- List of **12 curated Cebu tourist spots**
- Categories: **Nature, Beach, History, Adventure**
- Search bar for filtering by name or location
- Card-based layout with images and descriptions
- Quick access to map view

### 12.3 Featured Destinations

| # | Destination | Category | Location |
|---|---|---|---|
| 1 | Kawasan Falls | Nature | Badian |
| 2 | Oslob Whale Sharks | Adventure | Oslob |
| 3 | Magellan's Cross | History | Cebu City |
| 4 | Pescador Island | Beach | Moalboal |
| 5 | Sirao Flower Garden | Nature | Busay |
| 6 | Temple of Leah | History | Busay |
| 7 | Virgin Island | Beach | Bantayan Island |
| 8 | Tumalog Falls | Nature | Oslob |
| 9 | Fort San Pedro | History | Cebu City |
| 10 | White Beach | Beach | Camotes Islands |
| 11 | 10,000 Roses Cafe | Adventure | Cordova |
| 12 | Simala Shrine | History | Sibonga |

### 12.4 Maps and Navigation
- Interactive map with destination markers
- GPS location support via Expo Location
- Spot coordinates for accurate positioning
- External navigation support through map applications

### 12.5 Spot Detail View
- High-quality destination images
- Full description of each location
- Category and address information
- Verified local tour guide listings with:
  - Name and specialty
  - Rating and review count
  - Contact number
  - Verification badge

### 12.6 User Profile
- View and edit display name
- Update profile photo using image picker
- Change email and password
- Fetch and store profile data in Firestore

### 12.7 Settings
- Dark mode / light mode toggle
- Notification preference switch
- User profile summary
- Logout confirmation modal
- Travel stats display (visited, wishlist, saved)

### 12.8 UI/UX Design
- Modern dark theme with yellow accent color (`#f7f200`)
- Floating bottom tab navigation
- Responsive card layouts
- Icon support via Lucide and Ionicons
- Smooth screen transitions

---

## 13. Technology Stack

| Layer | Technology |
|---|---|
| **Frontend Framework** | React Native 0.81 |
| **Development Platform** | Expo SDK 54 |
| **Language** | JavaScript / JSX |
| **Navigation** | React Navigation (Stack + Bottom Tabs) |
| **Authentication** | Firebase Authentication |
| **Database** | Cloud Firestore |
| **Maps** | React Native Maps |
| **Location** | Expo Location |
| **Image Picker** | Expo Image Picker |
| **Icons** | Lucide React Native, Expo Vector Icons |
| **Storage** | AsyncStorage |
| **Platform Support** | Android, iOS, Web |

---

## 14. Implementation

### Project Structure

```
SeeBu/
├── App.js                  # Main app entry & navigation
├── firebase.js             # Firebase configuration
├── ThemeContext.js         # Dark/light theme provider
├── app.json                # Expo app configuration
├── package.json            # Dependencies
├── assets/                 # App icons and splash screen
└── screens/
    ├── LoginScreen.js
    ├── RegisterScreen.js
    ├── ExploreScreen.js
    ├── SpotDetailScreen.js
    ├── MapComponent.js
    ├── MapComponent.web.js
    ├── ProfileVIew.js
    └── SettingsScreen.js
```

### Key Implementation Details

1. **Authentication Flow** — `onAuthStateChanged` listens for login state and automatically routes users to either auth screens or the main app.
2. **Theme System** — A React Context provides global light/dark mode theming across all screens.
3. **Map Handling** — Separate map components are used for native and web platforms.
4. **Profile Sync** — User profile data is stored and retrieved from Firestore using the authenticated user's UID.
5. **Spot Data** — Destination data is structured as an array of objects containing id, title, type, location, coordinates, image, and description.

---

## 15. Testing and Evaluation

### Testing Methods

| Test Type | Description |
|---|---|
| **Functional Testing** | Verify login, register, logout, search, navigation, and profile update |
| **UI Testing** | Check layout consistency, theme switching, and responsiveness |
| **Integration Testing** | Confirm Firebase auth and Firestore profile retrieval |
| **Usability Testing** | Evaluate ease of use with sample users |
| **Compatibility Testing** | Test on Android emulator and/or physical device via Expo |

### Sample Test Cases

| Test Case | Expected Result | Status |
|---|---|---|
| Register new account | Account created and user redirected to main app | Pass |
| Login with valid credentials | User enters main tabs | Pass |
| Login with invalid credentials | Error message displayed | Pass |
| Search destination | Matching results appear | Pass |
| Open spot detail | Details and map load correctly | Pass |
| Toggle dark/light mode | Theme changes across screens | Pass |
| Update profile name | Updated name saved to Firestore | Pass |
| Logout | User returned to login screen | Pass |

### Evaluation Criteria

The app was evaluated based on:

- Functionality
- Usability
- Design quality
- Performance
- Security of authentication
- Relevance to the tourism problem

---

## 16. Results and Discussion

The development of SeeBu successfully produced a working mobile tourism application tailored for Cebu. The app addresses the main problem of scattered travel information by presenting destinations in one organized platform.

### Key Achievements

1. **Centralized destination information** — Users can browse 12 major Cebu attractions with images, categories, and descriptions.
2. **Improved navigation experience** — Integrated maps and coordinates help users locate destinations more easily.
3. **Secure user management** — Firebase Authentication and Firestore enable account creation and profile storage.
4. **Modern mobile interface** — The app uses a visually appealing design with dark mode and intuitive tab navigation.
5. **Local guide visibility** — Spot detail pages include verified guide profiles, supporting local tourism services.

### Discussion

The results show that a capstone-level mobile app can effectively demonstrate real-world solutions using modern frameworks. While SeeBu is not yet a fully commercial product, it provides a strong foundation for future enhancements such as dynamic admin content, booking systems, and user reviews.

The use of React Native and Expo proved effective for rapid cross-platform development, while Firebase reduced backend complexity and allowed the team to focus on frontend features and user experience.

---

## 17. Conclusion

SeeBu was developed to provide travelers with a reliable and mobile-friendly way to explore Cebu’s top destinations. The project successfully combined destination discovery, mapping, user authentication, and personalization into a single application.

The study concludes that a locally focused tourism app can improve the travel planning experience by organizing information, supporting navigation, and promoting Cebu’s attractions in a modern digital format. SeeBu fulfills the project objectives and demonstrates the practical application of mobile development, cloud services, and user-centered design in addressing a real community need.

---

## 18. Recommendations

For future development, the following improvements are recommended:

1. **Admin Panel** — Create a web dashboard to add, edit, and remove destinations dynamically.
2. **User Reviews and Ratings** — Allow travelers to leave feedback for spots and tour guides.
3. **Offline Mode** — Cache destination data and maps for users with limited internet access.
4. **Booking System** — Integrate guide booking, transport, and payment features.
5. **Push Notifications** — Send travel tips, weather alerts, and event updates.
6. **Multilingual Support** — Add English, Cebuano, and Tagalog language options.
7. **Analytics Dashboard** — Track popular destinations and user behavior.
8. **Partnerships** — Collaborate with LGUs, hotels, and local tour operators.
9. **AI Trip Planner** — Recommend itineraries based on user preferences and trip duration.
10. **Expansion** — Extend SeeBu to cover the entire Central Visayas region.

---

## 19. References

- Department of Tourism Philippines. (2024). *Tourism Statistics and Regional Promotions.*
- Expo Documentation. (2026). *Expo SDK Reference.* https://docs.expo.dev
- Firebase Documentation. (2026). *Authentication and Cloud Firestore.* https://firebase.google.com/docs
- Google Maps Platform. (2026). *Maps SDK for Mobile.*
- Meta Open Source. (2026). *React Native Documentation.* https://reactnative.dev
- React Navigation. (2026). *Navigation for React Native Apps.* https://reactnavigation.org
- Philippine Statistics Authority. (2024). *Tourism and Regional Economic Data.*
- TripAdvisor. (2024). *Travel Trends and Mobile Usage Reports.*
- UN Tourism. (2023). *Digital Transformation in Tourism.*
- W3C Web Accessibility Initiative. (2024). *Mobile Accessibility Guidelines.*

---

## 20. Appendices

### Appendix A — Sample Screens

1. Login Screen  
2. Register Screen  
3. Explore Screen  
4. Spot Detail Screen  
5. Map View  
6. Profile Screen  
7. Settings Screen  

### Appendix B — Source Code Listings

- `App.js` — Application entry point and navigation setup
- `firebase.js` — Firebase initialization
- `screens/ExploreScreen.js` — Destination listing and search
- `screens/SpotDetailScreen.js` — Spot details and guides
- `screens/LoginScreen.js` — Authentication
- `screens/ProfileVIew.js` — User profile management

### Appendix C — User Manual (Short Guide)

1. Download and open the SeeBu app
2. Create an account or log in
3. Go to **Explore** to browse destinations
4. Tap a destination to view details
5. Use **Maps** to see location and guides
6. Open **Settings** to change theme or log out
7. Visit **Profile** to update your account information

### Appendix D — Group Members / Project Roles

| Name | Role |
|---|---|
| [Member 1] | Project Leader / Frontend Developer |
| [Member 2] | UI/UX Designer |
| [Member 3] | Backend / Firebase Developer |
| [Member 4] | Documentation / QA Tester |

---

**End of Capstone Project Document**
