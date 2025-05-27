# EventLink

EventLink is a Next.js application designed to help users create, customize, and share beautiful digital event invitations.

## Core Features

*   **Event Creation:** Easily input event details like name, date, time, location, description, and images.
*   **Customizable Invitations:** Tailor the look and feel of your event pages with color and font customization.
*   **RSVP Functionality:** Allow guests to RSVP directly on the event page.
*   **Shareable Links:** Generate unique links for each event to share with your guests.
*   **Event Statistics:** Track page views and RSVP responses for your events.
*   **AI-Powered Tag Suggestions:** Get relevant tag suggestions for your events to improve organization.

## Tech Stack

*   [Next.js](https://nextjs.org/) (with App Router)
*   [React](https://reactjs.org/)
*   [TypeScript](https://www.typescriptlang.org/)
*   [Tailwind CSS](https://tailwindcss.com/)
*   [ShadCN UI](https://ui.shadcn.com/)
*   [Genkit](https://firebase.google.com/docs/genkit) (for AI features)
*   [Firebase Firestore](https://firebase.google.com/docs/firestore) (for data storage)

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
    *   Set up Firestore Security Rules. A basic starting point for development is provided in the project documentation or comments.
4.  **Run the development server:**
    ```bash
    npm run dev
    # or
    yarn dev
    # or
    pnpm dev
    ```
    The application should now be running on `http://localhost:9002` (or your configured port).

5.  **Run Genkit (for AI features, in a separate terminal):**
    ```bash
    npm run genkit:dev
    ```

## Project Structure

*   `src/app/`: Contains the Next.js pages and layouts using the App Router.
*   `src/components/`: Shared React components, including UI components from ShadCN.
*   `src/lib/`: Utility functions, Firebase configuration, and type definitions.
*   `src/hooks/`: Custom React hooks for state management and data fetching.
*   `src/ai/`: Genkit flows and AI-related logic.
*   `src/contexts/`: React context providers (e.g., for authentication).

Explore the `src/app/page.tsx` file to see the main entry point for the application.
