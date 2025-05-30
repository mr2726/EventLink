
# EventLink

EventLink is a Next.js application designed to help users create, customize, and share beautiful digital event invitations.

## Core Features

*   **Event Creation:** Easily input event details like name, date, time, location, description, and images.
*   **Customizable Invitations:** Tailor the look and feel of your event pages with color and font customization, including detailed RSVP button styling.
*   **RSVP Functionality:** Allow guests to RSVP directly on the event page, providing their name, email, or phone number as configured by the event creator.
*   **Shareable Links:** Generate unique links for each event to share with your guests. Event sharing can be a premium feature.
*   **Event Statistics:** Track page views and detailed RSVP responses (including guest details) for your events.
*   **AI-Powered Tag Suggestions:** Get relevant tag suggestions for your events to improve organization.
*   **User Authentication:** A basic login/registration system (client-side for this prototype).
*   **Premium Feature Simulation:** Event link sharing can be "unlocked" via a simulated Lemon Squeezy payment flow.

## Tech Stack

*   [Next.js](https://nextjs.org/) (with App Router)
*   [React](https://reactjs.org/)
*   [TypeScript](https://www.typescriptlang.org/)
*   [Tailwind CSS](https://tailwindcss.com/)
*   [ShadCN UI](https://ui.shadcn.com/)
*   [Genkit](https://firebase.google.com/docs/genkit) (for AI features)
*   [Firebase Firestore](https://firebase.google.com/docs/firestore) (for data storage)
*   [Lemon Squeezy](https://www.lemonsqueezy.com/) (for simulated payment processing)

## Getting Started

To get started with this project locally:

1.  **Clone the repository.**
2.  **Install dependencies:**
    ```bash
    npm install
    # or
    yarn install
    # or
    pnpm install
    ```
3.  **Set up Firebase:**
    *   Create a Firebase project in the [Firebase Console](https://console.firebase.google.com/).
    *   Enable Firestore database.
    *   Obtain your Firebase project's configuration credentials.
    *   Update the Firebase configuration in `src/lib/firebase.ts` with your project's details.
    *   Set up Firestore Security Rules. Basic rules are provided in project discussions, but ensure they match your security needs. For development, you might need permissive rules:
        ```json
        rules_version = '2';
        service cloud.firestore {
          match /databases/{database}/documents {
            match /events/{eventId} {
              allow read: if true;
              allow create: if true; // Or more specific to your auth
              allow update: if true; // Or more specific to your auth
              allow delete: if true; // Or more specific to your auth
            }
          }
        }
        ```
4.  **Set up Lemon Squeezy (Optional for Full Simulation):**
    *   If you intend to test the webhook flow:
        *   Create a Lemon Squeezy account and a product.
        *   In your Lemon Squeezy store settings, go to Webhooks.
        *   Create a new webhook. The "Payload URL" will be your deployed application's API endpoint (e.g., `https://your-app-domain.com/api/lemonsqueezy-webhook`). For local testing, you might need a tool like `ngrok` to expose your local server to the internet.
        *   Note the "Signing secret" provided by Lemon Squeezy.
        *   Create a `.env.local` file in your project root (if it doesn't exist, copy `.env` and rename it).
        *   Add your Lemon Squeezy signing secret to `.env.local`:
            ```
            LEMONSQUEEZY_WEBHOOK_SECRET="your_lemonsqueezy_webhook_signing_secret_here"
            ```
        *   Ensure the checkout URL in `src/app/event/[id]/page.tsx` points to your Lemon Squeezy product.

5.  **Run the development server:**
    ```bash
    npm run dev
    ```
    The application should now be running on `http://localhost:9002` (or your configured port).

6.  **Run Genkit (for AI features, in a separate terminal):**
    ```bash
    npm run genkit:dev
    ```

## Project Structure

*   `src/app/`: Contains the Next.js pages and layouts using the App Router.
    *   `src/app/api/`: Contains API route handlers.
*   `src/components/`: Shared React components, including UI components from ShadCN.
*   `src/lib/`: Utility functions, Firebase configuration, and type definitions.
*   `src/hooks/`: Custom React hooks for state management and data fetching.
*   `src/ai/`: Genkit flows and AI-related logic.
*   `src/contexts/`: React context providers (e.g., for authentication).

Explore the `src/app/page.tsx` file to see the main entry point for the application.
