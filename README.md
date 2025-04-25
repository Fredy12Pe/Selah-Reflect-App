# Selah - Christian Devotional App 🙏

A mobile-first Christian devotional app built with Next.js, Firebase, and Google's Gemini AI. Selah helps users engage with daily scripture through AI-powered reflections, journaling, and curated spiritual resources.

## ✨ Features

- 📱 **Mobile-First Design**

  - Optimized for mobile devices
  - Touch-friendly interface
  - Responsive typography and spacing

- 🙏 **Daily Devotionals**

  - Daily scripture passages
  - Guided reflection questions
  - Beautiful mountain/landscape imagery

- ✍️ **Personal Journaling**

  - Save personal reflections
  - Track spiritual growth
  - Secure and private storage

- 🤖 **AI-Powered Insights**

  - Ask questions about scripture
  - Get biblically-grounded responses
  - Save AI reflections to journal

- 🎯 **Curated Resources**

  - Related videos and podcasts
  - Study materials
  - Additional context

- 🔐 **Secure Authentication**
  - Email/password authentication
  - Protected user data
  - Firebase security rules

## 🛠️ Tech Stack

- **Framework**: [Next.js 14](https://nextjs.org/) (App Router)
- **Styling**: [Tailwind CSS](https://tailwindcss.com/)
- **Authentication/Database**: [Firebase](https://firebase.google.com/)
- **AI**: [Google Gemini Pro](https://ai.google.dev/)
- **Deployment**: [Vercel](https://vercel.com)
- **Bible API**: [bible-api.com](https://bible-api.com/)
- **Images**: [Unsplash API](https://unsplash.com/developers)

## 🚀 Getting Started

1. **Clone the repository**

   ```bash
   git clone https://github.com/yourusername/selah-reflect-app.git
   cd selah-reflect-app
   ```

2. **Install dependencies**

   ```bash
   npm install
   ```

3. **Set up environment variables**

   - Copy `.env.example` to `.env.local`
   - Fill in your API keys:

     ```env
     # Firebase Configuration
     NEXT_PUBLIC_FIREBASE_API_KEY=your_firebase_api_key
     FIREBASE_AUTH_DOMAIN=your_firebase_auth_domain
     FIREBASE_PROJECT_ID=your_firebase_project_id
     FIREBASE_STORAGE_BUCKET=your_firebase_storage_bucket
     FIREBASE_MESSAGING_SENDER_ID=your_firebase_messaging_sender_id
     FIREBASE_APP_ID=your_firebase_app_id

     # Google Gemini API
     NEXT_PUBLIC_GEMINI_API_KEY=your_gemini_api_key

     # Unsplash API (optional)
     NEXT_PUBLIC_UNSPLASH_ACCESS_KEY=your_unsplash_api_key_here

     # Bible API
     NEXT_PUBLIC_BIBLE_API_KEY=your_bible_api_key

     # OpenAI API
     NEXT_PUBLIC_OPENAI_API_KEY=your_openai_api_key_here
     ```

4. **Start the development server**

   ```bash
   npm run dev
   ```

5. **Open in your browser**
   - Visit [http://localhost:3000](http://localhost:3000)
   - Use mobile device emulation in Chrome DevTools

## 📱 Components

- **DevotionHeader**: Displays the daily verse with a beautiful background image
- **JournalEntry**: Allows users to write and save personal reflections
- **ReflectWithAI**: Interface for AI-powered scripture insights
- **ResourceCard**: Displays related videos, podcasts, and articles

## 🔧 Configuration

### Firebase Setup

1. Create a Firebase project at [console.firebase.google.com](https://console.firebase.google.com)
2. Enable Authentication with Email/Password
3. Create a Firestore database
4. Add your app and copy configuration values
5. Update `.env.local` with your Firebase config

### Google Gemini API

1. Visit [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Generate an API key
3. Add to `.env.local` as `GEMINI_API_KEY`

## 📦 Deployment

The app is optimized for deployment on Vercel:

1. Push your code to GitHub
2. Import the project in Vercel
3. Configure environment variables
4. Deploy!

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 📄 Acknowledgments

- Bible verses provided by [bible-api.com](https://bible-api.com/)
- Images from [Unsplash](https://unsplash.com/)
- AI powered by [Google Gemini](https://ai.google.dev/)

## Environment Setup

This application requires the following environment variables to be set in a `.env.local` file at the root of the project:

```
# Firebase Configuration
NEXT_PUBLIC_FIREBASE_API_KEY=your_firebase_api_key
FIREBASE_AUTH_DOMAIN=your_firebase_auth_domain
FIREBASE_PROJECT_ID=your_firebase_project_id
FIREBASE_STORAGE_BUCKET=your_firebase_storage_bucket
FIREBASE_MESSAGING_SENDER_ID=your_firebase_messaging_sender_id
FIREBASE_APP_ID=your_firebase_app_id

# Bible API
NEXT_PUBLIC_BIBLE_API_KEY=your_bible_api_key

# Google Gemini API
NEXT_PUBLIC_GEMINI_API_KEY=your_gemini_api_key

# Unsplash API
NEXT_PUBLIC_UNSPLASH_ACCESS_KEY=your_unsplash_api_key_here

# OpenAI API
NEXT_PUBLIC_OPENAI_API_KEY=your_openai_api_key_here
```

To use the application:

1. Create a `.env.local` file in the root directory
2. Add your API keys as shown above
3. Run the application with `npm run dev`

### Getting API Keys

- **OpenAI API Key**: Sign up at [OpenAI Platform](https://platform.openai.com/) to get your API key for the Reflect with AI feature.
- **Unsplash API Key**: Sign up at [Unsplash Developers](https://unsplash.com/developers) to get your API key for background images.
- **Firebase**: Set up a project in the [Firebase Console](https://console.firebase.google.com/).

## Dynamic Background Images with Unsplash API

The app uses Unsplash API to display beautiful, relevant background images for each devotion. To set this up:

1. Sign up for a free Unsplash Developer account at [https://unsplash.com/developers](https://unsplash.com/developers)
2. Create a new application and copy your Access Key
3. Add the key to your `.env.local` file:
   ```
   NEXT_PUBLIC_UNSPLASH_ACCESS_KEY=your_unsplash_access_key_here
   ```

Even without an API key, the app will fall back to using Unsplash's source URLs which don't require API authentication but have more limited functionality.

### Using the DynamicBackground Component

The app includes a `DynamicBackground` component that can be used in your own pages:

```tsx
import DynamicBackground from "@/app/components/DynamicBackground";

export default function MyPage() {
  return (
    <DynamicBackground
      date="2024-04-28"
      query="bible,nature,mountains"
      showAttribution={true}
      className="h-screen flex flex-col"
    >
      {/* Your content here */}
      <h1 className="text-white text-4xl">Hello World</h1>
    </DynamicBackground>
  );
}
```

Available props:

- `date`: ISO date string (YYYY-MM-DD) - used to ensure same image shown all day
- `query`: Search terms for images (comma-separated)
- `overlayOpacity`: Darkness of overlay (0-1, default: 0.6)
- `imageType`: Type of image ('devotion', 'hymn', 'resources')
- `showAttribution`: Whether to show image attribution
- `priority`: Whether image should have loading priority
- `useApi`: Whether to use Unsplash API (requires key) or direct URLs
- `className`: Additional CSS classes

## Deployment to Netlify

The app is configured to deploy to Netlify with special handling for Firebase and SSR/SSG issues.

### Option 1: Using the Deployment Script (Recommended)

Simply run:

```
npm run deploy       # For a preview deployment
npm run deploy:prod  # For production deployment
```

The script will:

- Build your application with special handling for Firebase
- Check if you're logged in to Netlify
- Guide you through the site setup process if needed
- Deploy your application

### Option 2: Deploy via Netlify UI

1. Push your code to a Git repository (GitHub, GitLab, or Bitbucket)

2. Log in to your Netlify account and click "New site from Git"

3. Select your repository and configure build settings:

   - Build command: `node netlify-build.js`
   - Publish directory: `.next`

4. Click "Deploy site"

### Firebase and Netlify Build Issues

This project includes special handling for common Firebase initialization issues during Netlify builds. The custom build script (`netlify-build.js`) creates a temporary environment that prevents Firebase services from initializing during the static generation phase, which avoids "Service storage is not available" errors commonly seen when deploying Firebase apps to Netlify.

### Environment Variables

Make sure to set these environment variables in the Netlify UI:

- `NEXT_PUBLIC_FIREBASE_API_KEY`
- `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN`
- `NEXT_PUBLIC_FIREBASE_PROJECT_ID`
- `NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET`
- `NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID`
- `NEXT_PUBLIC_FIREBASE_APP_ID`
- `NEXT_PUBLIC_UNSPLASH_ACCESS_KEY`
- Any other environment variables your application uses

## PWA Features

The app is configured as a Progressive Web App and can be installed on mobile devices:

- On iOS: Use the "Add to Home Screen" option in the share menu
- On Android: Tap "Install App" when prompted or use "Add to Home Screen" in the browser menu
- On desktop: Look for the install icon in the address bar

## Development

```
npm install
npm run dev
```

## Building Icons

To regenerate the PWA icons and splash screen:

```
node scripts/generate-icons.js
node scripts/generate-splash.js
```
