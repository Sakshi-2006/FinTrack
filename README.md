# FinTrack

FinTrack is a lightweight expense tracking web app built with React and TypeScript. It helps users monitor their income and expenses, categorize spending, and keep a clearer view of their financial habits.

Live demo: https://expense-tracker-app-m77s.bolt.host

## Features

- Add, edit, and delete transactions.
- Track both income and expenses.
- Categorize spending for better financial visibility.
- View recent transaction history.
- Responsive interface for desktop and mobile screens.
- Built with Vite for fast local development and clean production builds.

## Tech Stack

- React 18
- TypeScript
- Vite
- Tailwind CSS
- Supabase
- Lucide React

## Getting Started

### Prerequisites

- Node.js 18+
- npm or yarn

### Installation

1. Clone the repository

   git clone https://github.com/Sakshi-2006/FinTrack.git
   cd FinTrack

2. Install dependencies

   npm install

3. Start the development server

   npm run dev

4. Build the app for production

   npm run build

## Environment Variables

This project uses Supabase. Create a `.env` file in the project root and add the following values if required:

- VITE_SUPABASE_URL
- VITE_SUPABASE_ANON_KEY

## Project Scripts

- `npm run dev` — start the Vite development server
- `npm run build` — create a production build
- `npm run preview` — preview the production build locally
- `npm run lint` — run ESLint
- `npm run typecheck` — run TypeScript checks

## Deployment

The app is currently deployed here:

https://expense-tracker-app-m77s.bolt.host

For deployment elsewhere, build the app with `npm run build` and serve the generated `dist` folder using a static host or your preferred hosting solution.

## Contributing

Contributions are welcome. Please open an issue before making substantial changes and submit a pull request with a clear explanation of your update.

## License

This project currently does not include a license file. Add one if you want to define usage and distribution terms.

## Contact

For questions or feedback, open an issue in the repository.
