
# Tribes

<p align="center">
  <img src="public/images/tribes-logo.svg" alt="Tribes Logo" width="120" />
</p>

<p align="center">
  A decentralized community platform for creating, joining, and collaborating in web3 tribes.
</p>

## Overview

Tribes is a web3-native platform that enables users to create and join communities (tribes) with shared interests and goals. Leveraging blockchain technology, Tribes provides a decentralized way for communities to form, govern themselves, and collaborate in a trustless environment.

## Features

- **Decentralized Communities**: Create and join tribes that exist on the blockchain
- **Web3 Authentication**: Connect with your wallet for seamless, secure authentication
- **User Profiles**: Customize your username and avatar for identity within tribes
- **Tribe Management**: Create, join, and manage membership in various tribes
- **Discussion Forums**: Engage in discussions within tribes through topic-based forums
- **NFT Integration**: Exclusive tribes with NFT-gated membership requirements
- **Responsive Design**: Beautiful UI that works across all devices

## Tech Stack

- **Frontend**: React, TypeScript, Tailwind CSS, Vite
- **Backend**: Express.js, Node.js
- **Database**: Prisma ORM with SQL database
- **Blockchain**: Ethereum/EVM compatible chains
- **Web3**: wagmi, viem, ethers.js
- **Styling**: Tailwind CSS, Framer Motion for animations
- **State Management**: Redux Toolkit

## Getting Started

### Prerequisites

- Node.js (v16+)
- npm or yarn
- Git

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/your-organization/tribes.git
   cd tribes
   ```

2. Install dependencies:
   ```bash
   npm install
   # or
   yarn install
   ```

3. Set up environment variables:
   ```bash
   cp .env.example .env
   ```
   Edit the `.env` file with your configuration.

4. Initialize the database:
   ```bash
   npm run prisma:generate
   npm run prisma:migrate
   npm run init
   ```

### Development

Run the development server:

```bash
# Run frontend and backend concurrently
npm run dev

# Run frontend only
npm run dev:frontend

# Run backend only
npm run dev:backend
```

### Building for Production

```bash
# Build the application
npm run build

# Start the production server
npm run start
```

## Project Structure

```
/
├── public/            # Static assets
├── src/               # Frontend source code
│   ├── abi/           # Blockchain contract ABIs
│   ├── app/           # Core application components
│   ├── components/    # Reusable UI components
│   ├── contexts/      # React contexts
│   ├── hooks/         # Custom React hooks
│   ├── screens/       # Main application screens
│   ├── services/      # Service layer for API interactions
│   ├── store/         # Redux store configuration
│   ├── styles/        # Global styles
│   ├── types/         # TypeScript type definitions
│   └── utils/         # Utility functions
├── server/            # Backend API server
│   ├── routes/        # API routes
│   ├── database.js    # Database connection
│   └── index.js       # Server entry point
├── prisma/            # Database schema and migrations
└── scripts/           # Utility scripts
```

## Key Concepts

### Tribes

Tribes are the core entities in the platform, representing communities with shared interests. Each tribe has:

- A name and description
- An optional cover image
- Membership requirements (open or NFT-gated)
- Discussion topics
- Members list

### Topics

Within tribes, members can create discussion topics and post messages. Topics help organize conversations and keep discussions focused.

### TribesSDK

The TribesSDK is the core interface for interacting with the platform's functionality. It provides methods for:

- Creating and joining tribes
- Fetching tribe information
- Managing user profiles
- Posting messages
- Interacting with tribe content

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Support

For support, please open an issue on the repository or contact the development team.

---

<p align="center">Built with ❤️ by the Astrix Team</p>

