# 🧬 Core Logic & Emergency Pipelines

Core pipelines, process flows, and operational fundamentals for **LifeLine+**.

## 🚨 Emergency Pipeline

```mermaid
flowchart TD
    A["User taps Emergency"] --> B["Check Firebase/local session"]
    B -->|No session| C["Open LoginModal"]
    C --> D["Google auth or email fallback"]
    B -->|Session exists| E["Read navigator.geolocation"]
    D --> E
    E --> F["GET /api/nearest-services type=hospital openNow=true"]
    F --> G["Pick nearest hospital"]
    G --> H["GET /api/routes/emergency"]
    H --> I["Rank Directions routes by traffic ETA"]
    I --> J["Render route cards + map polylines"]
    J --> K["Find nearby ambulances"]
    K --> L["POST /api/ambulance-request/request"]
    L --> M["Socket.io tracking"]
```

## 🚑 Ambulance Booking Logic

```mermaid
sequenceDiagram
    actor User
    participant FE as React Emergency Page
    participant BE as Express Ambulance Route
    participant WS as Socket.io
    participant Store as Memory + Firestore optional

    User->>FE: Select ambulance
    FE->>BE: POST /api/ambulance-request/request
    BE->>Store: Save request as searching
    BE->>WS: Emit new_ambulance_request to ambulance rooms
    BE-->>FE: Return requestId + 5-minute window
    FE->>WS: join_request(requestId)
    BE->>BE: Wait production window or dev simulation timeout
    BE->>Store: Mark accepted + assignedAmbulance
    BE->>WS: ambulance_assigned
    loop Every 3 seconds
        BE->>WS: location_update
        WS-->>FE: Move ambulance marker
    end
    BE->>WS: ambulance_arrived
```

## 🗺️ Route Ranking Logic

```mermaid
flowchart LR
    A["origin + destination"] --> B["Directions API alternatives=true"]
    B --> C["Normalize each route"]
    C --> D["duration_in_traffic or duration"]
    D --> E["Sort ascending"]
    E --> F["fastest=true for first route"]
    F --> G["MapView decodes polyline"]
    G --> H["Traffic layer visible"]
```

## 🚗 Civilian Mode Verification

```mermaid
flowchart TD
    A["No ambulance or direct civilian mode"] --> B["User submits vehicle number, purpose, contact"]
    B --> C["POST /api/verify/civilian"]
    C --> D["Gemini strict JSON prompt"]
    D --> E{"approved?"}
    E -->|Yes| F["Create tempVehicleId"]
    F --> G["Enable tracking + route priority flags"]
    G --> H["POST /api/police/alert"]
    H --> I["Socket.io track_civilian every 5s"]
    E -->|No| J["Show safer alternatives"]
```

## 🚓 Police Alert Flow

```mermaid
sequenceDiagram
    participant FE as Emergency Page
    participant BE as Police Route
    participant Places as Google Places API
    participant WS as Socket.io

    FE->>BE: POST /api/police/alert
    BE->>BE: Extract route start/end points
    loop Up to 5 route points
        BE->>Places: Nearby Search type=police
        Places-->>BE: Stations
    end
    BE->>BE: Dedupe and rank by distance
    BE->>WS: police_alert
    BE-->>FE: stationsNotified + station list
```

## 🏥 Doctor Booking Flow

```mermaid
flowchart TD
    A["Doctors page opens"] --> B["Read user location"]
    B --> C["GET /api/booking/doctors"]
    C --> D["Google Places doctor/clinic search"]
    D --> E["Apply specialty, rating, availability filters"]
    E --> F["Render cards"]
    F --> G["User selects doctor"]
    G --> H["GET /api/booking/slots/:doctorId"]
    H --> I["User confirms slot"]
    I --> J["POST /api/booking/appointment"]
    J --> K["Store booking + show confirmation"]
```

## 🔐 Auth Logic

```mermaid
flowchart LR
    A["App mount"] --> B["Read lifeline_user from localStorage"]
    B --> C{"Firebase configured?"}
    C -->|Yes| D["onAuthStateChanged"]
    D --> E["Normalize Firebase user"]
    C -->|No| F["Use local fallback session"]
    E --> G["Persist normalized session"]
    F --> G
    G --> H["Expose user via AuthContext"]
```

## 📡 Realtime Notification Rules

| Trigger | Room | Event |
| --- | --- | --- |
| User signs into emergency page | `user_{userId}` | User-specific status updates |
| Ambulance request created | `ambulance_{ambulanceId}` | `new_ambulance_request` |
| Request screen active | `request_{requestId}` | Tracking updates |
| Driver accepted | `user_{userId}` and `request_{requestId}` | `ambulance_assigned` |
| Driver GPS changes | `user_{userId}` and `request_{requestId}` | `location_update` |
| Civilian tracking enabled | `civilian_{vehicleId}` | `civilian_location` |
| Police alert sent | Global | `police_alert` |

## 🧯 Failure Handling

| Failure | Recovery |
| --- | --- |
| Geolocation denied | Use Kolkata fallback coordinates and keep user informed |
| Google Places returns zero results | Show empty state or doctor fallback where applicable |
| Directions API fails | Keep destination selected and allow retry |
| Gemini returns invalid JSON | Deny civilian activation safely |
| Firebase Admin unavailable | Continue with in-memory state |
| Socket disconnects | Socket.io reconnects using websocket/polling transports |

## 🚀 Production Scaling Path

```mermaid
flowchart TD
    A["Current implementation"] --> B["Firestore persistence"]
    B --> C["Redis pub/sub for Socket.io scale-out"]
    C --> D["Dedicated ambulance driver app"]
    D --> E["Verified hospital/police partner dashboard"]
    E --> F["Audit logs + DPDP compliance controls"]
```

Connected docs: [README.md](README.md), [INSTRUCTIONS.md](INSTRUCTIONS.md), [ARCHITECTURE.md](ARCHITECTURE.md), and [LICENSE](LICENSE).
