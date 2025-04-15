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
     NEXT_PUBLIC_FIREBASE_API_KEY=
     FIREBASE_AUTH_DOMAIN=
     FIREBASE_PROJECT_ID=
     FIREBASE_STORAGE_BUCKET=
     FIREBASE_MESSAGING_SENDER_ID=
     FIREBASE_APP_ID=

     # Google Gemini API
     GEMINI_API_KEY=

     # Unsplash API (optional)
     NEXT_PUBLIC_UNSPLASH_ACCESS_KEY=
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

## �� Acknowledgments

- Bible verses provided by [bible-api.com](https://bible-api.com/)
- Images from [Unsplash](https://unsplash.com/)
- AI powered by [Google Gemini](https://ai.google.dev/)
