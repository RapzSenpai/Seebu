# SeeBu — SRS Diagrams

Use these diagrams for your **Software Requirements Specifications** document.

## How to turn these into images (for Word/PDF)

1. Go to **[mermaid.live](https://mermaid.live)**
2. Copy one diagram code block below (everything between the ` ```mermaid ` lines)
3. Paste it on the left side of the editor
4. Click **Actions → PNG** or **SVG** to download
5. Insert the image into your Word document under the matching section

---

## 1. System Architecture Diagram

Paste under **Section 2.1 Product Perspective**

```mermaid
flowchart TB
    subgraph Mobile["SeeBu Mobile App (React Native + Expo)"]
        direction TB
        AUTH["Login / Register Screens"]
        EXPLORE["Explore Screen"]
        MAPS["Maps / Spot Detail Screen"]
        PROFILE["Profile Screen"]
        SETTINGS["Settings Screen"]
        NAV["React Navigation"]
        THEME["Theme Context"]
        MAPCOMP["Map Component"]
        LOC["Expo Location"]
    end

    subgraph Firebase["Firebase Cloud Services"]
        FBAUTH["Firebase Authentication"]
        FIRESTORE["Cloud Firestore"]
    end

    subgraph External["External Services"]
        RNMAPS["React Native Maps"]
        EXTMAP["External Map Apps"]
        GPS["Device GPS"]
    end

    AUTH --> FBAUTH
    PROFILE --> FIRESTORE
    EXPLORE --> MAPCOMP
    MAPS --> MAPCOMP
    MAPCOMP --> RNMAPS
    LOC --> GPS
    MAPS --> EXTMAP
    NAV --> AUTH
    NAV --> EXPLORE
    NAV --> MAPS
    NAV --> PROFILE
    NAV --> SETTINGS
    THEME --> EXPLORE
    THEME --> SETTINGS
```

---

## 2. Modular Decomposition Diagram

Paste under **Section 2.1 Modular Decomposition**

```mermaid
flowchart TD
    SEEBU["SeeBu Mobile Application"]

    SEEBU --> M1["Module 1: User Management"]
    SEEBU --> M2["Module 2: Destination Exploration"]
    SEEBU --> M3["Module 3: Maps and Navigation"]
    SEEBU --> M4["Module 4: Settings and Preferences"]

    M1 --> T11["1.1 User Registration"]
    M1 --> T12["1.2 User Login"]
    M1 --> T13["1.3 User Profile Management"]

    M2 --> T21["2.1 Browse Tourist Destinations"]
    M2 --> T22["2.2 Search and Filter Destinations"]
    M2 --> T23["2.3 View Spot Details"]

    M3 --> T31["3.1 View Destination Map"]
    M3 --> T32["3.2 Display User Location"]
    M3 --> T33["3.3 Open External Navigation"]

    M4 --> T41["4.1 Toggle Light/Dark Theme"]
    M4 --> T42["4.2 Manage Notification Preferences"]
    M4 --> T43["4.3 Logout"]

    SEEBU --> M5["Module 5: Admin Panel"]
    M5 --> T51["5.1 View Admin Panel Report"]
```

---

## 3. Overall Use Case Diagram

Paste at the start of **Section 3.2 Functional Requirements**

```mermaid
flowchart LR
    Guest(("Guest User"))
    Traveler(("Registered User<br/>(Traveler)"))

    subgraph SeeBu["SeeBu System"]
        direction TB
        UC1["Register Account"]
        UC2["Login"]
        UC3["Manage Profile"]
        UC4["Browse Destinations"]
        UC5["Search Destinations"]
        UC6["View Spot Details"]
        UC7["View Map"]
        UC8["Show User Location"]
        UC9["Open Navigation"]
        UC10["Toggle Theme"]
        UC11["Manage Notifications"]
        UC12["Logout"]
    end

    Guest --> UC1
    Guest --> UC2

    Traveler --> UC3
    Traveler --> UC4
    Traveler --> UC5
    Traveler --> UC6
    Traveler --> UC7
    Traveler --> UC8
    Traveler --> UC9
    Traveler --> UC10
    Traveler --> UC11
    Traveler --> UC12
```

---

# MODULE 1 — USER MANAGEMENT

---

## 1.1 User Registration — Use Case Diagram

```mermaid
flowchart TB
    Guest(("Guest User"))

    subgraph System["SeeBu System"]
        UC["Register Account"]
        VAL["Validate Registration Info"]
        CREATE["Create Firebase Account"]
        SAVE["Save Profile to Firestore"]
        REDIRECT["Redirect to Main App"]
    end

    Guest --> UC
    UC --> VAL
    VAL --> CREATE
    CREATE --> SAVE
    SAVE --> REDIRECT
```

---

## 1.1 User Registration — Activity Diagram

```mermaid
flowchart TD
    START([Start]) --> A["Guest opens Register Screen"]
    A --> B["Guest fills in name, email, and password"]
    B --> C["Guest taps Sign Up button"]
    C --> D{All fields valid?}
    D -->|No| E["System shows error message"]
    E --> B
    D -->|Yes| F["System creates account in Firebase Auth"]
    F --> G{Account created?}
    G -->|No| H["System shows registration error"]
    H --> B
    G -->|Yes| I["System saves user profile to Firestore"]
    I --> J["System redirects user to Main App"]
    J --> END([End])
```

---

## 1.2 User Login — Use Case Diagram

```mermaid
flowchart TB
    User(("Registered User"))

    subgraph System["SeeBu System"]
        UC["Login to SeeBu"]
        VAL["Validate Credentials"]
        AUTH["Authenticate via Firebase"]
        LOAD["Load User Session"]
        REDIRECT["Redirect to Main Tabs"]
    end

    User --> UC
    UC --> VAL
    VAL --> AUTH
    AUTH --> LOAD
    LOAD --> REDIRECT
```

---

## 1.2 User Login — Activity Diagram

```mermaid
flowchart TD
    START([Start]) --> A["User opens Login Screen"]
    A --> B["User enters email and password"]
    B --> C["User taps Login button"]
    C --> D{Fields filled?}
    D -->|No| E["System shows fill all fields error"]
    E --> B
    D -->|Yes| F["System validates credentials with Firebase"]
    F --> G{Credentials valid?}
    G -->|No| H["System shows login error message"]
    H --> B
    G -->|Yes| I["System loads authenticated session"]
    I --> J["System redirects to Explore / Main Tabs"]
    J --> END([End])
```

---

## 1.3 User Profile Management — Use Case Diagram

```mermaid
flowchart TB
    User(("Registered User"))

    subgraph System["SeeBu System"]
        UC["Manage Profile"]
        FETCH["Fetch Profile from Firestore"]
        EDIT["Edit Name / Photo / Email / Password"]
        SAVE["Save Updated Profile"]
    end

    User --> UC
    UC --> FETCH
    FETCH --> EDIT
    EDIT --> SAVE
```

---

## 1.3 User Profile Management — Activity Diagram

```mermaid
flowchart TD
    START([Start]) --> A["User opens Profile Screen"]
    A --> B["System fetches profile from Firestore"]
    B --> C["System displays current profile info"]
    C --> D["User taps Edit"]
    D --> E["User updates name, photo, email, or password"]
    E --> F["User taps Save"]
    F --> G{Input valid?}
    G -->|No| H["System shows validation error"]
    H --> E
    G -->|Yes| I["System updates profile in Firestore"]
    I --> J["System displays updated profile"]
    J --> END([End])
```

---

# MODULE 2 — DESTINATION EXPLORATION

---

## 2.1 Browse Tourist Destinations — Use Case Diagram

```mermaid
flowchart TB
    User(("Registered User"))

    subgraph System["SeeBu System"]
        UC["Browse Destinations"]
        LOAD["Load Destination List"]
        FILTER["Filter by Category"]
        SELECT["Select Destination"]
    end

    User --> UC
    UC --> LOAD
    LOAD --> FILTER
    FILTER --> SELECT
```

---

## 2.1 Browse Tourist Destinations — Activity Diagram

```mermaid
flowchart TD
    START([Start]) --> A["User opens Explore Screen"]
    A --> B["System loads 12 Cebu destinations"]
    B --> C["System displays destination cards"]
    C --> D{User selects category?}
    D -->|Yes| E["System filters by Nature / Beach / History / Adventure"]
    E --> F["System updates displayed list"]
    D -->|No| F
    F --> G{User taps a destination?}
    G -->|Yes| H["System opens Spot Detail Screen"]
    H --> END([End])
    G -->|No| C
```

---

## 2.2 Search and Filter Destinations — Use Case Diagram

```mermaid
flowchart TB
    User(("Registered User"))

    subgraph System["SeeBu System"]
        UC["Search Destinations"]
        INPUT["Enter Search Keyword"]
        FILTER["Filter Results"]
        DISPLAY["Display Matching Spots"]
    end

    User --> UC
    UC --> INPUT
    INPUT --> FILTER
    FILTER --> DISPLAY
```

---

## 2.2 Search and Filter Destinations — Activity Diagram

```mermaid
flowchart TD
    START([Start]) --> A["User opens Explore Screen"]
    A --> B["User types in search bar"]
    B --> C["System filters destinations by title or location"]
    C --> D{Results found?}
    D -->|Yes| E["System displays matching destinations"]
    E --> F{User selects a result?}
    F -->|Yes| G["System opens Spot Detail Screen"]
    G --> END([End])
    F -->|No| B
    D -->|No| H["System shows No Results Found"]
    H --> B
```

---

## 2.3 View Spot Details — Use Case Diagram

```mermaid
flowchart TB
    User(("Registered User"))

    subgraph System["SeeBu System"]
        UC["View Spot Details"]
        SHOW["Show Image, Title, Category, Location"]
        DESC["Show Description"]
        GUIDES["Show Tour Guide List"]
        MAP["Show Map Location"]
    end

    User --> UC
    UC --> SHOW
    SHOW --> DESC
    DESC --> GUIDES
    GUIDES --> MAP
```

---

## 2.3 View Spot Details — Activity Diagram

```mermaid
flowchart TD
    START([Start]) --> A["User selects a destination"]
    A --> B["System opens Spot Detail Screen"]
    B --> C["System displays image, title, category, and location"]
    C --> D["System displays full description"]
    D --> E["System displays verified tour guides"]
    E --> F["System displays map with destination marker"]
    F --> G{User action?}
    G -->|Contact Guide| H["System opens phone dialer"]
    G -->|Navigate| I["System opens external map app"]
    G -->|Back| J["User returns to Explore Screen"]
    H --> END([End])
    I --> END
    J --> END
```

---

# MODULE 3 — MAPS AND NAVIGATION

---

## 3.1 View Destination Map — Use Case Diagram

```mermaid
flowchart TB
    User(("Registered User"))

    subgraph System["SeeBu System"]
        UC["View Destination Map"]
        LOAD["Load Interactive Map"]
        MARKERS["Display Destination Markers"]
        SELECT["Select Marker"]
    end

    User --> UC
    UC --> LOAD
    LOAD --> MARKERS
    MARKERS --> SELECT
```

---

## 3.1 View Destination Map — Activity Diagram

```mermaid
flowchart TD
    START([Start]) --> A["User opens Maps tab or map modal"]
    A --> B["System loads React Native Maps"]
    B --> C{Map loaded?}
    C -->|No| D["System shows map error message"]
    D --> END([End])
    C -->|Yes| E["System displays markers for all destinations"]
    E --> F{User taps a marker?}
    F -->|Yes| G["System shows spot info / detail"]
    G --> END
    F -->|No| E
```

---

## 3.2 Display User Location — Use Case Diagram

```mermaid
flowchart TB
    User(("Registered User"))

    subgraph System["SeeBu System"]
        UC["Display User Location"]
        PERM["Request Location Permission"]
        GPS["Get GPS Coordinates"]
        PIN["Show User Pin on Map"]
    end

    User --> UC
    UC --> PERM
    PERM --> GPS
    GPS --> PIN
```

---

## 3.2 Display User Location — Activity Diagram

```mermaid
flowchart TD
    START([Start]) --> A["User opens map screen"]
    A --> B["System requests location permission"]
    B --> C{Permission granted?}
    C -->|No| D["System shows map without user location"]
    D --> END([End])
    C -->|Yes| E["System gets coordinates via Expo Location"]
    E --> F["System displays user location pin on map"]
    F --> G["User compares location with destination markers"]
    G --> END
```

---

## 3.3 Open External Navigation — Use Case Diagram

```mermaid
flowchart TB
    User(("Registered User"))

    subgraph System["SeeBu System"]
        UC["Open External Navigation"]
        COORDS["Get Destination Coordinates"]
        LINK["Generate Map Link"]
        OPEN["Open External Map App"]
    end

    User --> UC
    UC --> COORDS
    COORDS --> LINK
    LINK --> OPEN
```

---

## 3.3 Open External Navigation — Activity Diagram

```mermaid
flowchart TD
    START([Start]) --> A["User views destination details"]
    A --> B["User taps Navigate button"]
    B --> C["System retrieves destination coordinates"]
    C --> D{Map app available?}
    D -->|No| E["System shows error message"]
    E --> END([End])
    D -->|Yes| F["System opens Google Maps / device map app"]
    F --> G["User starts navigation to destination"]
    G --> END
```

---

# MODULE 4 — SETTINGS AND PREFERENCES

---

## 4.1 Toggle Light/Dark Theme — Use Case Diagram

```mermaid
flowchart TB
    User(("Registered User"))

    subgraph System["SeeBu System"]
        UC["Toggle Theme"]
        SWITCH["Switch Dark / Light Mode"]
        APPLY["Apply Theme to All Screens"]
    end

    User --> UC
    UC --> SWITCH
    SWITCH --> APPLY
```

---

## 4.1 Toggle Light/Dark Theme — Activity Diagram

```mermaid
flowchart TD
    START([Start]) --> A["User opens Settings Screen"]
    A --> B["User toggles Dark Mode switch"]
    B --> C["System updates Theme Context"]
    C --> D["System applies new colors to all screens"]
    D --> END([End])
```

---

## 4.2 Manage Notification Preferences — Use Case Diagram

```mermaid
flowchart TB
    User(("Registered User"))

    subgraph System["SeeBu System"]
        UC["Manage Notifications"]
        TOGGLE["Enable / Disable Notifications"]
        SAVE["Save Preference"]
    end

    User --> UC
    UC --> TOGGLE
    TOGGLE --> SAVE
```

---

## 4.2 Manage Notification Preferences — Activity Diagram

```mermaid
flowchart TD
    START([Start]) --> A["User opens Settings Screen"]
    A --> B["User toggles notification switch"]
    B --> C["System saves notification preference"]
    C --> D["System shows updated switch state"]
    D --> END([End])
```

---

## 4.3 Logout — Use Case Diagram

```mermaid
flowchart TB
    User(("Registered User"))

    subgraph System["SeeBu System"]
        UC["Logout"]
        CONFIRM["Show Confirmation Modal"]
        SIGNOUT["Sign Out from Firebase"]
        REDIRECT["Redirect to Login Screen"]
    end

    User --> UC
    UC --> CONFIRM
    CONFIRM --> SIGNOUT
    SIGNOUT --> REDIRECT
```

---

## 4.3 Logout — Activity Diagram

```mermaid
flowchart TD
    START([Start]) --> A["User opens Settings Screen"]
    A --> B["User taps Logout"]
    B --> C["System shows confirmation modal"]
    C --> D{User confirms?}
    D -->|No| E["System closes modal"]
    E --> END([End])
    D -->|Yes| F["System signs out via Firebase Auth"]
    F --> G["System redirects to Login Screen"]
    G --> END
```

---

## 5.1 View Admin Panel Report — Use Case Diagram

```mermaid
flowchart TB
    Admin(("Administrator"))

    subgraph System["SeeBu System"]
        UC["View Admin Panel Report"]
        VERIFY["Verify Admin Role"]
        FETCH["Fetch Registered Users"]
        STATS["Display Overview Statistics"]
        LIST["Display Registered Users List"]
        INFO["Display Quick Info"]
    end

    Admin --> UC
    UC --> VERIFY
    VERIFY --> FETCH
    FETCH --> STATS
    STATS --> LIST
    LIST --> INFO
```

---

## 5.1 View Admin Panel Report — Activity Diagram

```mermaid
flowchart TD
    START([Start]) --> A["Administrator opens Settings Screen"]
    A --> B{Is user admin?}
    B -->|No| C["Admin Panel option hidden"]
    C --> END([End])
    B -->|Yes| D["Administrator taps Admin Panel"]
    D --> E["System verifies admin role"]
    E --> F{Role confirmed?}
    F -->|No| G["System redirects back to Settings"]
    G --> END
    F -->|Yes| H["System navigates to Admin Panel"]
    H --> I["System fetches users from Firestore / Mock Auth"]
    I --> J{Data retrieved?}
    J -->|No| K["System shows empty user list"]
    J -->|Yes| L["System calculates statistics"]
    K --> M["System displays Overview cards"]
    L --> M
    M --> N["System displays Registered Users list"]
    N --> O["System displays Quick Info section"]
    O --> P{Administrator taps back?}
    P -->|Yes| Q["System returns to Settings Screen"]
    Q --> END
    P -->|No| O
```

---

## App Navigation Flow (Bonus — good for presentation)

```mermaid
flowchart TD
    START([App Launch]) --> CHECK{User logged in?}

    CHECK -->|No| LOGIN["Login Screen"]
    LOGIN --> REGISTER["Register Screen"]
    REGISTER --> LOGIN
    LOGIN -->|Success| MAIN

    CHECK -->|Yes| MAIN["Main Tabs"]

    MAIN --> EXPLORE["Explore Tab"]
    MAIN --> MAPS["Maps Tab"]
    MAIN --> SETTINGS["Settings Tab"]

    EXPLORE --> DETAIL["Spot Detail Screen"]
    MAPS --> DETAIL
    DETAIL --> GUIDE["Contact Tour Guide"]
    DETAIL --> NAV["Open Navigation"]

    SETTINGS --> THEME["Toggle Theme"]
    SETTINGS --> NOTIF["Toggle Notifications"]
    SETTINGS --> LOGOUT["Logout"]
    LOGOUT --> LOGIN

    SETTINGS --> PROFILE["Profile Screen"]
    PROFILE --> MAIN

    SETTINGS -->|Admin only| ADMIN["Admin Panel"]
    ADMIN --> STATS["View Overview Statistics"]
    ADMIN --> USERLIST["View Registered Users"]
    ADMIN --> SETTINGS
```

---

## Entity Relationship (Bonus — for documentation)

```mermaid
erDiagram
    USER ||--o{ PROFILE : has
    DESTINATION ||--o{ TOUR_GUIDE : includes

    USER {
        string uid PK
        string email
        string displayName
        string profileImg
    }

    PROFILE {
        string uid FK
        string displayName
        string profileImg
    }

    DESTINATION {
        int id PK
        string title
        string type
        string location
        float latitude
        float longitude
        string description
        string image
    }

    TOUR_GUIDE {
        string id PK
        string name
        string specialty
        string location
        float rating
        int reviews
        string contact
        boolean verified
    }
```

---

## Quick Reference — Which diagram goes where

| SRS Section | Diagram to use |
|-------------|----------------|
| 2.1 Product Perspective | System Architecture Diagram |
| 2.1 Modular Decomposition | Modular Decomposition Diagram |
| 3.2 Functional Requirements (intro) | Overall Use Case Diagram |
| 1.1 User Registration | 1.1 Use Case + Activity |
| 1.2 User Login | 1.2 Use Case + Activity |
| 1.3 User Profile Management | 1.3 Use Case + Activity |
| 2.1 Browse Destinations | 2.1 Use Case + Activity |
| 2.2 Search Destinations | 2.2 Use Case + Activity |
| 2.3 View Spot Details | 2.3 Use Case + Activity |
| 3.1 View Destination Map | 3.1 Use Case + Activity |
| 3.2 Display User Location | 3.2 Use Case + Activity |
| 3.3 Open External Navigation | 3.3 Use Case + Activity |
| 4.1 Toggle Theme | 4.1 Use Case + Activity |
| 4.2 Notifications | 4.2 Use Case + Activity |
| 4.3 Logout | 4.3 Use Case + Activity |
| 5.1 View Admin Panel Report | 5.1 Use Case + Activity |
