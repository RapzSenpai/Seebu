CONSOLATRIX COLLEGE OF TOLEDO CITY INC.
COLLEGE OF COMPUTER STUDIES

Software Requirements Specifications
for

**SeeBu: A Mobile Tourism Guide Application for Tourist Destinations in Cebu, Philippines**

---

## Change History

| Version | Date       | Author           | Description                          |
|---------|------------|------------------|--------------------------------------|
| 01      | July 2026  | [Your Group Name] | Initial release of the SRS document |

---

## Table of Contents

| Section | Title |
|---------|-------|
| | Change History |
| | Table of Contents |
| 1 | Introduction |
| 1.1 | Purpose |
| 1.2 | Scope |
| 1.3 | Definitions, Acronyms and Abbreviations |
| 1.4 | References |
| 2 | Overall Description |
| 2.1 | Product perspective |
| 2.2 | User characteristics |
| 2.4 | Constraints |
| 2.5 | Assumptions and dependencies |
| 3 | Specific Requirements |
| 3.1 | External interface requirements |
| 3.1.1 | Hardware interfaces |
| 3.1.2 | Software interfaces |
| 3.1.3 | Communications interfaces |
| 3.2 | Functional requirements |
| | Module 1 – User Management |
| | Module 2 – Destination Exploration |
| | Module 3 – Maps and Navigation |
| | Module 4 – Settings and Preferences |
| | Module 5 – Admin Panel |
| 3.4 | Non-functional requirements |

---

# 1. Introduction

## 1.1 Purpose

The purpose of this Software Requirements Specification (SRS) is to provide a comprehensive description of **SeeBu**, a mobile tourism guide application developed to help travelers discover, explore, and navigate popular tourist destinations in Cebu, Philippines. The application enables users to browse categorized destination listings, search for tourist spots, view detailed location information, access interactive maps, connect with verified local tour guides, and manage their personal accounts through a centralized mobile platform.

This document defines the functional and non-functional requirements necessary for the successful design, development, implementation, and maintenance of the system. It serves as a guide for developers, testers, project advisers, and stakeholders by providing a clear understanding of the system's features, constraints, and expected behavior throughout the software development lifecycle.

## 1.2 Scope

SeeBu is a cross-platform mobile tourism guide application developed to support local and international travelers in Cebu by providing a centralized digital platform where users can discover tourist destinations, view spot details, access map-based navigation, and manage their travel preferences. The platform aims to increase the visibility of Cebu’s top attractions while offering users a convenient, secure, and user-friendly mobile travel experience.

**Key features of the application include:**

- **Destination Explorer:** Users can browse curated tourist spots in Cebu by category, search for specific destinations, and view images, descriptions, locations, and coordinates.
- **Interactive Maps:** The system displays tourist spot markers on a map and supports location-based services for navigation.
- **Spot Detail View:** Users can view detailed information about each destination, including category, description, location, images, and verified local tour guide contacts.
- **User Account Management:** The system provides secure registration, login, logout, and profile management for registered users.
- **Profile Management:** Users can update their display name, profile photo, email, and password.
- **Settings and Preferences:** Users can switch between light and dark mode, manage notification preferences, and log out of the application.
- **Tour Guide Directory:** Selected destinations include verified local tour guide listings with contact information, specialty, and ratings.

The product is not intended to provide nationwide travel services, online booking, or advanced logistics management. During the implementation of this project, the application is specifically designed to support tourist destination discovery and navigation in Cebu, Philippines. Features such as integrated online payment, real-time booking, live chat, admin dashboard, offline map support, and multi-language support are outside the scope of the system.

**Application Benefits:**

- **Tourists and Travelers:** Easily discover Cebu destinations, plan trips, view spot details, and navigate to locations using a single mobile app.
- **Local Tour Guides:** Gain visibility through verified guide listings attached to relevant tourist spots.
- **Tourism Industry:** Promote Cebu as a travel destination through a modern, mobile-first digital platform.
- **Local Community:** Support tourism-related economic activity by making destination information more accessible.

**The objectives of SeeBu are to:**

- Provide a centralized mobile platform for discovering tourist destinations in Cebu.
- Enable users to browse, search, and filter destinations by category and location.
- Integrate interactive maps and GPS-based location services for tourist spots.
- Offer detailed destination information with images, descriptions, and coordinates.
- Provide secure user authentication and profile management using Firebase.
- Include verified local tour guide information for selected destinations.
- Support theme customization and user preference settings.
- Promote digital tourism and improve the travel planning experience in Cebu.

## 1.3 Definitions, Acronyms and Abbreviations

| Term | Definition |
|------|------------|
| **SeeBu** | The name of the mobile tourism guide application developed for tourist destinations in Cebu, Philippines. The name reflects the project goal of helping users "see Cebu." |
| **User / Traveler** | A registered individual who uses the application to browse destinations, view spot details, access maps, and manage a personal account. |
| **Guest User** | An unregistered user who can access the login and registration screens but cannot use the main application features until authenticated. |
| **Tourist Spot / Destination** | A location in Cebu listed in the application, such as a beach, waterfall, historical landmark, or adventure site. |
| **Category** | A classification used to group destinations, including Nature, Beach, History, and Adventure. |
| **Tour Guide** | A verified local guide listed under a destination who offers services such as trekking, diving, or historical tours. |
| **Explore Screen** | The main screen where users browse and search for tourist destinations. |
| **Spot Detail Screen** | The screen that displays full information about a selected tourist destination. |
| **Map View** | The interactive map interface showing destination markers and user location. |
| **Firebase Authentication** | A cloud-based authentication service used for user registration, login, and account security. |
| **Cloud Firestore** | A NoSQL cloud database used to store user profile information. |
| **GPS** | Global Positioning System, used to determine the user's current location for map and navigation features. |
| **LBS** | Location-Based Services, features that use geographic data to provide navigation and destination information. |
| **Expo** | A framework and platform used to develop and run the React Native mobile application. |
| **React Native** | A JavaScript framework used to build cross-platform mobile applications for Android and iOS. |
| **AsyncStorage** | A local storage system used to persist user authentication sessions on mobile devices. |
| **SRS** | Software Requirements Specification, the formal document describing system requirements. |
| **UI/UX** | User Interface and User Experience, referring to the design and usability of the application. |

## 1.4 References

1. **IEEE Standard for Software Requirements Specifications**
   - Title: IEEE Std 830-1998
   - Date: 1998
   - Publishing Organization: Institute of Electrical and Electronics Engineers (IEEE)
   - Source: IEEE Xplore Digital Library

2. **React Native Documentation**
   - Title: React Native Documentation
   - Date: Ongoing
   - Publishing Organization: Meta Open Source
   - Source: https://reactnative.dev/

3. **Expo Documentation**
   - Title: Expo Documentation
   - Date: Ongoing
   - Publishing Organization: Expo
   - Source: https://docs.expo.dev/

4. **Firebase Documentation**
   - Title: Firebase Documentation
   - Date: Ongoing
   - Publishing Organization: Google LLC
   - Source: https://firebase.google.com/docs

5. **Cloud Firestore Documentation**
   - Title: Cloud Firestore Documentation
   - Date: Ongoing
   - Publishing Organization: Google LLC
   - Source: https://firebase.google.com/docs/firestore

6. **React Navigation Documentation**
   - Title: React Navigation Documentation
   - Date: Ongoing
   - Publishing Organization: React Navigation
   - Source: https://reactnavigation.org/

7. **Department of Tourism Philippines**
   - Title: Tourism Statistics and Regional Promotions
   - Date: 2024
   - Publishing Organization: Department of Tourism, Philippines

8. **Google Maps Platform Documentation**
   - Title: Maps SDK for Mobile
   - Date: Ongoing
   - Publishing Organization: Google LLC
   - Source: https://developers.google.com/maps

---

# 2. Overall Description

## 2.1 Product perspective

**SeeBu: A Mobile Tourism Guide Application for Tourist Destinations in Cebu, Philippines** is a cross-platform mobile application developed using **React Native with Expo** for the front-end, **Firebase Authentication** for user authentication, **Cloud Firestore** for database management, **React Native Maps** for map visualization, and **Expo Location** for GPS-based services.

The system is a stand-alone mobile application that provides separate interfaces for guest users and registered travelers. It enables users to explore Cebu tourist destinations, view detailed spot information, access interactive maps, manage personal profiles, and customize application settings. Although the application is designed specifically for Cebu, its modular architecture allows future enhancements and expansion to other provinces or regions.

### Modular Decomposition

**Module 1: User Management**

- Transaction 1.1: User Registration
- Transaction 1.2: User Authentication (Login/Logout)
- Transaction 1.3: User Profile Management

**Module 2: Destination Exploration**

- Transaction 2.1: Browse Tourist Destinations
- Transaction 2.2: Search and Filter Destinations
- Transaction 2.3: View Spot Details

**Module 3: Maps and Navigation**

- Transaction 3.1: View Destination Map
- Transaction 3.2: Display User Location
- Transaction 3.3: Open External Navigation

**Module 4: Settings and Preferences**

- Transaction 4.1: Toggle Light/Dark Theme
- Transaction 4.2: Manage Notification Preferences
- Transaction 4.3: Logout Confirmation

## 2.2 User characteristics

The SeeBu system is designed for two types of users with specific roles and privileges:

### 1. Guest User

- **Role:** Unregistered user who has not yet created an account.
- **Privileges:**
  - Access the Login screen.
  - Access the Register screen.
  - Create a new account.
  - Reset password through email (if supported).

### 2. Registered User (Traveler)

- **Role:** Primary user of the system who explores tourist destinations in Cebu.
- **Privileges:**
  - Log in and log out of the application.
  - Browse tourist destinations by category.
  - Search destinations by name or location.
  - View detailed information about each tourist spot.
  - Access interactive maps with destination markers.
  - View verified local tour guide listings.
  - Contact tour guides through provided phone numbers.
  - Update profile information including name and profile photo.
  - Change account email and password.
  - Switch between light and dark mode.
  - Manage notification preferences.
  - View travel-related stats such as visited, wishlist, and saved spots.

## 2.4 Constraints

The system under consideration, SeeBu, has several constraints that limit its architectural development and operational flexibility:

1. **Regulatory Policies:**
   - It must adhere to the regulations and framework for handling any data of any type (user account data) as stipulated in the Philippine Data Privacy Act of 2012.

2. **Hardware Limitations:**
   - The system is accessible from standard Android and iOS mobile devices with internet connectivity and GPS capability.
   - Location-based features require devices with location services enabled.

3. **Interfaces to Other Applications:**
   - The system interfaces with third-party software to perform its services, including Firebase Authentication and Cloud Firestore for authentication and database management, React Native Maps for map display, and external map applications for turn-by-turn navigation.

4. **Parallel Operation:**
   - The system should support multiple users simultaneously browsing destinations, viewing maps, and managing profiles.

5. **Audit Functions:**
   - The system should maintain user account records and profile data in Cloud Firestore for retrieval and updates.

6. **Reliability Requirements:**
   - The system should provide reliable service and maintain data consistency while supporting multiple users and authentication sessions.

7. **Criticality of the Application:**
   - Medium criticality. Although the system is important for travel planning and tourism promotion, it is not a life-critical application. Scheduled maintenance and temporary downtime are acceptable.

8. **Safety and Security Considerations:**
   - The system implements secure authentication to protect user accounts and profile information. Firebase Authentication is used to manage user login and account security. Cloud Firestore is used to securely store and manage application data.

## 2.5 Assumptions and dependencies

Several assumptions were made during the design and development of the SeeBu system, which, if changed, could impact the system requirements:

1. **Assumption 1:** The application will be deployed as a cross-platform mobile application using React Native with Expo. If these technologies are changed, modifications to the system architecture and implementation may be required.

2. **Assumption 2:** Users will access the application through Android or iOS mobile devices with modern operating systems that support React Native and Expo applications.

3. **Assumption 3:** The application will primarily serve tourists and travelers exploring destinations in Cebu, Philippines. Expansion to other regions may require additional system enhancements.

4. **Assumption 4:** Tourist spot data will be stored locally within the application during the initial implementation phase, with user profile data stored in Cloud Firestore.

5. **Assumption 5:** Tour guide listings will use predefined or mock data during the initial implementation and may be expanded to a dynamic backend in future versions.

6. **Dependency 1:** The system depends on a stable internet connection for users to register, log in, retrieve profile data, and load destination images.

7. **Dependency 2:** The system depends on third-party services such as Firebase Authentication and Cloud Firestore for authentication and database management. Service interruptions may affect system functionality.

8. **Dependency 3:** Map and location features depend on device GPS capability and permission grants from the user.

9. **Dependency 4:** External navigation features depend on third-party map applications installed on the user's device.

---

# 3. Specific Requirements

## 3.1 External interface requirements

### 3.1.1 Hardware interfaces

The SeeBu system has minimal hardware dependencies as it is designed to run on standard mobile devices. However, the following hardware-related requirements must be met:

- **Server Requirements:**
  - Since the system uses Firebase as a cloud-based service, no dedicated physical server is required for deployment and data storage.

- **Supported Devices:**
  - Android smartphones and tablets capable of running Expo-based React Native applications.
  - iOS smartphones and tablets capable of running Expo-based React Native applications.
  - Devices with GPS/location services for map and navigation features.
  - A stable internet connection is required for users to register, log in, retrieve profile data, and load destination content.

### 3.1.2 Software interfaces

The system integrates several software components to function properly. The following software interfaces are required:

- **Operating System:**
  - Android and iOS operating systems that support Expo and React Native applications.

- **Database Management System:**
  - Cloud Firestore is used as the NoSQL database to store user profile information.

- **Front-End Framework:**
  - React Native with Expo is used to develop the mobile user interface and manage client-side functionality.

- **Third-Party Integrations:**
  - Firebase Authentication is used for user registration, login, logout, and authentication management.
  - Cloud Firestore is used as the cloud-based NoSQL database for storing user profile data.
  - React Native Maps is used to display interactive maps and destination markers.
  - Expo Location is used to access the user's current GPS location.
  - Expo Image Picker is used for selecting and updating profile photos.

- **Other Frameworks/Libraries:**
  - React Navigation is used to manage navigation between screens and tab-based routing within the application.
  - Firebase SDK is used to integrate Firebase Authentication and Cloud Firestore services into the application.
  - AsyncStorage is used to persist authentication sessions on mobile devices.
  - Lucide React Native and Expo Vector Icons are used for UI icons.

### 3.1.3 Communications interfaces

The SeeBu system requires certain network configurations and protocols for communication between users and third-party services.

- **Network Protocols:**
  - The system uses HTTPS to ensure secure communication between users and the application, particularly when handling user credentials and profile information.
  - The network should support TCP/IP protocols to ensure reliable data transmission.

- **Internet Connectivity:**
  - A stable internet connection is required for users to access authentication, profile management, and online destination content.

- **Cloud Services Communication:**
  - The system communicates with Firebase Authentication and Cloud Firestore through secure internet connections to manage authentication and data storage.

- **Location Services Communication:**
  - The system communicates with the device's GPS and location services to display the user's current location on the map.

- **External Application Communication:**
  - The system may open external map applications for turn-by-turn navigation using device linking protocols.

---

## 3.2 Functional requirements

---

### Module 1 – User Management

#### 1.1 Transaction Name: User Registration

- **Use Case Diagram**

  *[Insert Use Case Diagram Here]*

- **Use Case Description**

  The guest user registers by providing the required information, including full name, email address, and password. The system validates the entered information, creates the user account through Firebase Authentication, stores the user profile in Cloud Firestore, and automatically redirects the user to the main application interface.

  **Preconditions:**
  - The guest user has not yet registered an account.
  - The Register screen is accessible.
  - The user provides all required registration information.

  **Postconditions:**
  - The user account is created successfully.
  - The user profile is stored in Cloud Firestore.
  - The user is automatically redirected to the main application tabs.

  **Main Success Scenario:**
  1. The guest user opens the Register screen and completes the registration form.
  2. The user clicks the Sign Up button.
  3. The system validates the registration information.
  4. The system creates the user account using Firebase Authentication.
  5. The system stores the user's profile information in Cloud Firestore.
  6. The system redirects the user to the main application interface.

  **Extensions:**
  - If validation fails, the system displays an error message and prompts the user to correct the input.
  - If the email is already registered, the system displays an appropriate error message.

- **Activity Diagram**

  *[Insert Activity Diagram Here]*

- **Wireframe**

  *[Insert Register Screen Wireframe Here]*

---

#### 1.2 Transaction Name: User Login

- **Use Case Diagram**

  *[Insert Use Case Diagram Here]*

- **Use Case Description**

  **Actors:** Registered User

  **Description:** The registered user enters their email address and password to access the SeeBu application. The system validates the login credentials, authenticates the user through Firebase Authentication, and redirects the user to the main application interface.

  **Preconditions:**
  - The user must be registered.
  - The Login screen is accessible.
  - The user provides valid login credentials.

  **Postconditions:**
  - The user is authenticated successfully.
  - The user is redirected to the main application tabs.

  **Main Success Scenario:**
  1. The registered user opens the Login screen.
  2. The user enters their email address and password.
  3. The user clicks the Login button.
  4. The system validates the login credentials and authenticates the user.
  5. The system redirects the user to the main application interface.

  **Extensions:**
  - If the credentials are invalid, the system displays an error message.
  - If the user forgot their password, the system may provide a password reset option via email.

- **Activity Diagram**

  *[Insert Activity Diagram Here]*

- **Wireframe**

  *[Insert Login Screen Wireframe Here]*

---

#### 1.3 Transaction Name: User Profile Management

- **Use Case Diagram**

  *[Insert Use Case Diagram Here]*

- **Use Case Description**

  The registered user views and updates their profile information, including display name, profile photo, email address, and password. The system retrieves the current profile from Cloud Firestore, allows the user to make changes, validates the updated information, and saves the changes to the database.

  **Preconditions:**
  - The user must be logged in.
  - The Profile screen is accessible.
  - The user's profile record exists in Cloud Firestore.

  **Postconditions:**
  - The updated profile information is saved in Cloud Firestore.
  - The updated profile details are displayed on the Profile screen.

  **Main Success Scenario:**
  1. The user opens the Profile screen.
  2. The system retrieves and displays the user's current profile information.
  3. The user edits the desired profile fields or selects a new profile photo.
  4. The user saves the changes.
  5. The system validates the updated information.
  6. The system updates the profile record in Cloud Firestore.
  7. The system displays the updated profile information.

  **Extensions:**
  - If validation fails, the system prompts the user to correct the input.
  - If image picker permission is denied, the system displays a permission error message.

- **Activity Diagram**

  *[Insert Activity Diagram Here]*

- **Wireframe**

  *[Insert Profile Screen Wireframe Here]*

---

### Module 2 – Destination Exploration

#### 2.1 Transaction Name: Browse Tourist Destinations

- **Use Case Diagram**

  *[Insert Use Case Diagram Here]*

- **Use Case Description**

  The registered user browses a list of curated tourist destinations in Cebu through the Explore screen. The system displays destination cards with images, titles, categories, locations, and short descriptions. The user may filter destinations by category such as Nature, Beach, History, and Adventure.

  **Preconditions:**
  - The user must be logged in.
  - The Explore screen is accessible.
  - Destination data is available in the application.

  **Postconditions:**
  - The user views the list of available tourist destinations.
  - The user may select a destination for detailed viewing.

  **Main Success Scenario:**
  1. The user opens the Explore screen.
  2. The system displays the list of tourist destinations.
  3. The user scrolls through the destination cards.
  4. The user optionally selects a category filter.
  5. The system updates the displayed list based on the selected filter.
  6. The user taps a destination to view more details.

  **Extensions:**
  - If no destinations match the selected filter, the system displays an empty state message.

- **Activity Diagram**

  *[Insert Activity Diagram Here]*

- **Wireframe**

  *[Insert Explore Screen Wireframe Here]*

---

#### 2.2 Transaction Name: Search and Filter Destinations

- **Use Case Diagram**

  *[Insert Use Case Diagram Here]*

- **Use Case Description**

  The registered user searches for a specific tourist destination by entering keywords such as destination name or location. The system filters the destination list in real time and displays matching results.

  **Preconditions:**
  - The user must be logged in.
  - The Explore screen is accessible.
  - Destination data is available in the application.

  **Postconditions:**
  - The system displays destinations that match the search query.
  - The user may select a destination from the filtered results.

  **Main Success Scenario:**
  1. The user opens the Explore screen.
  2. The user enters a search keyword in the search bar.
  3. The system filters the destination list based on the entered keyword.
  4. The system displays the matching destinations.
  5. The user selects a destination from the search results.

  **Extensions:**
  - If no destination matches the search query, the system displays a "no results found" message.

- **Activity Diagram**

  *[Insert Activity Diagram Here]*

- **Wireframe**

  *[Insert Search Feature Wireframe Here]*

---

#### 2.3 Transaction Name: View Spot Details

- **Use Case Diagram**

  *[Insert Use Case Diagram Here]*

- **Use Case Description**

  The registered user selects a tourist destination and views its detailed information, including title, category, location, description, image, map coordinates, and verified local tour guide listings.

  **Preconditions:**
  - The user must be logged in.
  - A destination must be selected from the Explore screen or map.
  - Spot detail data must be available.

  **Postconditions:**
  - The system displays the full details of the selected destination.
  - The user may contact a tour guide or open map navigation.

  **Main Success Scenario:**
  1. The user selects a destination from the Explore screen or map.
  2. The system opens the Spot Detail screen.
  3. The system displays the destination image, title, category, location, and description.
  4. The system displays the destination's map location and guide listings.
  5. The user optionally contacts a guide or opens navigation.

  **Extensions:**
  - If guide contact information is unavailable, the system hides or disables the contact action.

- **Activity Diagram**

  *[Insert Activity Diagram Here]*

- **Wireframe**

  *[Insert Spot Detail Screen Wireframe Here]*

---

### Module 3 – Maps and Navigation

#### 3.1 Transaction Name: View Destination Map

- **Use Case Diagram**

  *[Insert Use Case Diagram Here]*

- **Use Case Description**

  The registered user opens the map interface to view tourist destination markers across Cebu. The system displays an interactive map with pins representing available destinations.

  **Preconditions:**
  - The user must be logged in.
  - The Maps screen or map modal is accessible.
  - Map services are available on the device.

  **Postconditions:**
  - The system displays destination markers on the map.
  - The user may select a marker to view destination details.

  **Main Success Scenario:**
  1. The user opens the Maps screen or map view from the Explore screen.
  2. The system loads the interactive map.
  3. The system displays markers for all available destinations.
  4. The user taps a marker to view spot information.

  **Extensions:**
  - If map services fail to load, the system displays an error message.

- **Activity Diagram**

  *[Insert Activity Diagram Here]*

- **Wireframe**

  *[Insert Map Screen Wireframe Here]*

---

#### 3.2 Transaction Name: Display User Location

- **Use Case Diagram**

  *[Insert Use Case Diagram Here]*

- **Use Case Description**

  The registered user enables location services so the system can display their current position on the map relative to nearby tourist destinations.

  **Preconditions:**
  - The user must be logged in.
  - The map screen is open.
  - The device supports GPS/location services.

  **Postconditions:**
  - The user's current location is displayed on the map.
  - The user can compare their location with destination markers.

  **Main Success Scenario:**
  1. The user opens the map screen.
  2. The system requests location permission from the user.
  3. The user grants location access.
  4. The system retrieves the user's current coordinates using Expo Location.
  5. The system displays the user's location on the map.

  **Extensions:**
  - If the user denies location permission, the system continues to show destination markers without user location.

- **Activity Diagram**

  *[Insert Activity Diagram Here]*

- **Wireframe**

  *[Insert User Location Map Wireframe Here]*

---

#### 3.3 Transaction Name: Open External Navigation

- **Use Case Diagram**

  *[Insert Use Case Diagram Here]*

- **Use Case Description**

  The registered user opens an external map application to navigate to a selected tourist destination using the destination's coordinates.

  **Preconditions:**
  - The user must be logged in.
  - A destination must be selected.
  - The destination must have valid coordinates.
  - An external map application must be available on the device.

  **Postconditions:**
  - The external map application opens with the destination location.
  - The user may begin navigation to the selected spot.

  **Main Success Scenario:**
  1. The user views a destination's details or map marker.
  2. The user taps the navigation button.
  3. The system retrieves the destination coordinates.
  4. The system opens the external map application with the destination location.

  **Extensions:**
  - If no map application is available, the system displays an error message.

- **Activity Diagram**

  *[Insert Activity Diagram Here]*

- **Wireframe**

  *[Insert Navigation Action Wireframe Here]*

---

### Module 4 – Settings and Preferences

#### 4.1 Transaction Name: Toggle Light/Dark Theme

- **Use Case Diagram**

  *[Insert Use Case Diagram Here]*

- **Use Case Description**

  The registered user switches the application's appearance between light mode and dark mode through the Settings screen. The system updates the theme across all screens using the global theme context.

  **Preconditions:**
  - The user must be logged in.
  - The Settings screen is accessible.

  **Postconditions:**
  - The selected theme is applied across the application.
  - The user's theme preference is reflected immediately.

  **Main Success Scenario:**
  1. The user opens the Settings screen.
  2. The user toggles the dark mode switch.
  3. The system updates the application's color theme.
  4. The updated theme is applied to all visible screens.

  **Extensions:**
  - None.

- **Activity Diagram**

  *[Insert Activity Diagram Here]*

- **Wireframe**

  *[Insert Settings Screen Wireframe Here]*

---

#### 4.2 Transaction Name: Manage Notification Preferences

- **Use Case Diagram**

  *[Insert Use Case Diagram Here]*

- **Use Case Description**

  The registered user enables or disables notification preferences through the Settings screen.

  **Preconditions:**
  - The user must be logged in.
  - The Settings screen is accessible.

  **Postconditions:**
  - The notification preference is updated in the application.

  **Main Success Scenario:**
  1. The user opens the Settings screen.
  2. The user toggles the notification switch.
  3. The system saves the updated notification preference.

  **Extensions:**
  - If device notification permissions are required in future versions, the system may request permission from the user.

- **Activity Diagram**

  *[Insert Activity Diagram Here]*

- **Wireframe**

  *[Insert Notification Settings Wireframe Here]*

---

#### 4.3 Transaction Name: Logout

- **Use Case Diagram**

  *[Insert Use Case Diagram Here]*

- **Use Case Description**

  The registered user logs out of the SeeBu application through the Settings screen. The system displays a confirmation modal, ends the user's authenticated session, and redirects the user to the Login screen.

  **Preconditions:**
  - The user must be logged in.
  - The Settings screen is accessible.

  **Postconditions:**
  - The user's session is terminated.
  - The user is redirected to the Login screen.

  **Main Success Scenario:**
  1. The user opens the Settings screen.
  2. The user selects the Logout option.
  3. The system displays a logout confirmation modal.
  4. The user confirms logout.
  5. The system signs the user out using Firebase Authentication.
  6. The system redirects the user to the Login screen.

  **Extensions:**
  - If the user cancels the logout action, the system closes the modal and returns to the Settings screen.

- **Activity Diagram**

  *[Insert Activity Diagram Here]*

- **Wireframe**

  *[Insert Logout Modal Wireframe Here]*

---

### Module 5 – Admin Panel

#### 5.1 Transaction Name: View Admin Panel Report

- **Use Case Diagram**

  *[Insert Use Case Diagram Here — see DIAGRAMS.md Section 5.1]*

- **Use Case Description**

  **Actors:** Administrator

  **Description:** The administrator accesses the Admin Panel from the Settings screen to view a system overview report and a list of registered users. The system verifies the user's admin role, retrieves user data from Cloud Firestore (or the mock user store on web), displays aggregate statistics including total users, listed tourist spots, admin count, and regular user count, and presents a read-only list of all registered users with their display name, email, interests, and role badge.

  **Preconditions:**
  - The administrator must be logged in with a valid authenticated session.
  - The user's account must have the role set to `admin` in Cloud Firestore or the mock auth profile.
  - The Settings screen is accessible.
  - The application has an active network connection (for mobile Firestore retrieval).

  **Postconditions:**
  - The Admin Panel screen is displayed with current system statistics.
  - The registered users list is populated with the latest available user data.
  - No user data is modified during this transaction.

  **Main Success Scenario:**
  1. The administrator opens the Settings screen.
  2. The system displays the "Admin Panel" menu option (visible only to admin users).
  3. The administrator selects the Admin Panel option.
  4. The system verifies the user's admin role through UserContext.
  5. The system navigates to the Admin Panel screen and displays a loading indicator.
  6. The system retrieves all registered users from Cloud Firestore (mobile) or the mock user store (web).
  7. The system calculates and displays overview statistics: Total Users, Spots Listed, Admins, and Regular Users.
  8. The system displays the Registered Users section with each user's name, email, interests, and role badge.
  9. The system displays the Quick Info section with demo login credentials for testing.
  10. The administrator reviews the system overview report and registered user list.

  **Extensions:**
  - If the user is not an administrator, the system hides the Admin Panel menu item in Settings and redirects non-admin users away from the Admin screen.
  - If user data retrieval fails, the system displays an empty user list and shows zero counts for user-related statistics.
  - If no registered users exist, the system displays an empty state message: "No users found."
  - If the administrator taps the back button, the system returns to the Settings screen.

- **Activity Diagram**

  *[Insert Activity Diagram Here — see DIAGRAMS.md Section 5.1]*

- **Wireframe**

  *[Insert Admin Panel Wireframe Here — open admin-wireframe.html and export as PNG]*

---

## 3.4 Non-functional requirements

### Performance

SeeBu must meet the following performance criteria to ensure a smooth user experience for travelers exploring destinations in Cebu:

- **Response Time:**
  - The system should load the Explore screen and destination cards within 3 seconds under normal network conditions.
  - Search and filter actions should update results in under 1 second.
  - Login and registration processes should complete within 5 seconds under normal network conditions.

- **Concurrent Users:**
  - The system should support multiple concurrent users through Firebase cloud services without significant degradation in authentication and profile retrieval performance.

- **Database Performance:**
  - User profile retrieval and update operations in Cloud Firestore should execute within 1 second under normal network conditions.

- **Map Loading:**
  - The map screen should initialize and display destination markers within 3 seconds on supported mobile devices.

- **Image Loading:**
  - Destination and profile images should load progressively without blocking the main user interface.

### Security

Security is critical for SeeBu due to the sensitive nature of user account data. The following security measures must be implemented:

- **User Authentication:**
  - Use Firebase Authentication with secure password handling and encrypted authentication sessions.
  - Authentication state should persist securely on mobile devices using AsyncStorage.

- **Data Encryption:**
  - HTTPS should be enforced for all communication between the user and Firebase services to prevent data interception.

- **Access Control:**
  - Only authenticated users may access the main application features such as Explore, Maps, Profile, and Settings.
  - Guest users may access only Login and Register screens.

- **Input Validation:**
  - All form inputs, such as registration, login, and profile updates, should undergo validation to prevent invalid or malicious data submission.

- **Data Privacy:**
  - User account and profile data must be handled in accordance with the Philippine Data Privacy Act of 2012.

### Reliability

SeeBu must be reliable to ensure continuous availability for users exploring tourist destinations:

- **Uptime:**
  - The mobile application should remain functional for browsing locally stored destination data even when cloud profile synchronization is temporarily unavailable.

- **Error Handling:**
  - The system should provide graceful error handling for authentication failures, network errors, and map loading issues.
  - Users should receive clear error messages when an action fails.

- **Data Consistency:**
  - User profile updates should be saved reliably to Cloud Firestore.
  - Authentication state should remain consistent across app restarts.

- **Service Dependency Management:**
  - If Firebase services are temporarily unavailable, the system should inform the user and prevent incomplete or inconsistent profile updates.

---

**Document Version:** 01

**Software Requirements Specifications**

**SeeBu: A Mobile Tourism Guide Application for Tourist Destinations in Cebu, Philippines**

**Consolatrix College of Toledo City Inc.**
**College of Computer Studies**

---

## Appendix A – List of Supported Destinations

| No. | Destination | Category | Location |
|-----|-------------|----------|----------|
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

## Appendix B – Technology Stack

| Layer | Technology |
|-------|------------|
| Front-End Framework | React Native 0.81 |
| Development Platform | Expo SDK 54 |
| Language | JavaScript / JSX |
| Navigation | React Navigation |
| Authentication | Firebase Authentication |
| Database | Cloud Firestore |
| Maps | React Native Maps |
| Location | Expo Location |
| Image Picker | Expo Image Picker |
| Local Storage | AsyncStorage |
| Platform Support | Android, iOS, Web |

## Appendix C – Project Members

| Name | Role |
|------|------|
| [Member 1] | Project Leader / Mobile Developer |
| [Member 2] | UI/UX Designer |
| [Member 3] | Firebase / Backend Developer |
| [Member 4] | Documentation / QA Tester |

---

**End of Document**
