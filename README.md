# TrendView - Seasonal Trend Analysis

A modern web application for analyzing seasonal patterns in time-series data. Built with Vite, React, TypeScript, Tailwind CSS, shadcn/ui, and Firebase.

## Features

- **Google Authentication**: Secure sign-in with Google via Firebase Auth
- **CSV Upload & Processing**: Upload time-series data with flexible column mapping
- **Season Detection**: Automatically identify season start, end, and duration
- **Advanced Analytics**: 
  - Configurable rolling windows and thresholds
  - Dynamic (percentile-based) or static threshold modes
  - Multiple intensity metrics (area, peak, average)
- **Rich Visualizations**: 
  - Season tables with export to CSV
  - Top bloom years bar charts
  - Year-over-year comparisons
- **User Management**: Admin panel for viewing and managing users
- **Dark Mode Support**: Beautiful UI that adapts to system preferences

## Tech Stack

- **Frontend**: Vite + React + TypeScript
- **Styling**: Tailwind CSS + shadcn/ui
- **Charts**: Recharts
- **Backend**: Firebase (Auth, Firestore, Storage)
- **CSV Parsing**: PapaParse

## Getting Started

### Prerequisites

- Node.js (v18 or higher)
- A Firebase project with Auth, Firestore, and Storage enabled

### Environment Setup

1. Clone the repository:
```bash
git clone <YOUR_GIT_URL>
cd <YOUR_PROJECT_NAME>
```

2. Install dependencies:
```bash
npm install
```

3. Configure Firebase:
   - Create a Firebase project at https://console.firebase.google.com
   - Enable Google authentication in Firebase Auth
   - Create a Firestore database
   - Enable Firebase Storage
   
4. Add your Firebase configuration via Lovable Secrets UI or create a `.env` file:
```env
VITE_FIREBASE_API_KEY=your_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_auth_domain
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_APP_ID=your_app_id
VITE_FIREBASE_STORAGE_BUCKET=your_storage_bucket
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
VITE_FIREBASE_MEASUREMENT_ID=your_measurement_id
```

### Firebase Security Rules

#### Firestore Rules
```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /users/{userId} {
      allow read: if request.auth != null;
      allow write: if request.auth.uid == userId;
    }
    
    match /datasets/{userId}/{document=**} {
      allow read, write: if request.auth.uid == userId;
    }
  }
}
```

#### Storage Rules
```javascript
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    match /datasets/{userId}/{allPaths=**} {
      allow read, write: if request.auth.uid == userId;
    }
  }
}
```

### Running the Application

```bash
# Development mode
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview

# Lint code
npm run lint
```

The app will be available at `http://localhost:8080`

## CSV Format

Your CSV file should contain the following columns:

```csv
date,value,location
2024-01-01,42.5,Station A
2024-01-02,45.2,Station A
2024-01-03,48.1,Station A
```

- **date**: Date in YYYY-MM-DD, DD/MM/YYYY, or ISO format
- **value**: Numeric value (e.g., bloom intensity, temperature)
- **location** (optional): Station or site identifier

## Season Detection Algorithm

The algorithm detects seasonal patterns using:

1. **Rolling Window Smoothing**: Applies a moving average to reduce noise (default: 5 days)

2. **Threshold Calculation**:
   - **Dynamic Mode**: Uses a percentile of historical values (P90 or P95)
   - **Static Mode**: Uses a fixed numeric threshold

3. **Season Start Detection**: First day when rolling mean ≥ threshold and persists for N days (default: 7)

4. **Season End Detection**: First day after season start when value drops below threshold and stays below for M days (default: 7)

5. **Intensity Metrics**:
   - **Area**: Sum of all values within the season
   - **Peak**: Maximum value within the season
   - **Average**: Mean value within the season

## User Roles

- **Regular User**: Can upload data and run analyses
- **Admin**: Can access user management panel and view all users

To make a user an admin, manually set `isAdmin: true` in their Firestore document.

## Project Structure

```
src/
├── auth/               # Authentication context and guards
├── components/         # Reusable UI components
│   ├── trends/        # Trend analysis components
│   └── ui/            # shadcn/ui components
├── lib/               # Utilities and helpers
│   ├── firebase.ts    # Firebase initialization
│   └── trendAnalysis.ts # Core analysis logic
├── pages/             # Route pages
│   ├── Home.tsx       # Landing page
│   ├── Dashboard.tsx  # User dashboard
│   ├── Trends.tsx     # Trend analysis tool
│   └── Admin.tsx      # Admin panel
└── App.tsx            # Main app component
```

## Performance Considerations

- CSV files up to 2MB are processed on the client
- For larger files, consider implementing Web Workers or server-side processing
- Season detection runs synchronously but uses setTimeout to maintain UI responsiveness

## License

MIT

## Support

For issues and questions, please open an issue on GitHub.
