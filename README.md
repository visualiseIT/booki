# Booki - Modern Appointment Booking Platform

Booki is a powerful and flexible appointment booking platform that enables service providers to create customized booking pages for their clients. Built with modern technologies and real-time capabilities.

## Features

- 🔐 Secure authentication with Clerk
- 📅 Real-time appointment booking
- ✨ Customizable provider profiles
- 📧 Automated email notifications
- 🌐 Public booking pages
- ⚡ Real-time availability updates
- 🎨 Modern, responsive UI
- 🌍 Timezone support

## Tech Stack

- **Frontend**: Next.js 14, TypeScript, TailwindCSS
- **Backend**: Convex (Real-time Database)
- **Authentication**: Clerk
- **Email**: Resend
- **Deployment**: Vercel

## Quick Start

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```
3. Set up environment variables:
   ```bash
   cp .env.example .env.local
   ```
4. Configure your environment variables:
   - NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY
   - CLERK_SECRET_KEY
   - NEXT_PUBLIC_CONVEX_URL
   - RESEND_API_KEY

5. Run the development server:
   ```bash
   npm run dev
   ```

## Deploy Your Own

Deploy your own version of Booki using Vercel:

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https%3A%2F%2Fgithub.com%2FvisualiseIT%2Fbooki&env=NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY,CLERK_SECRET_KEY,NEXT_PUBLIC_CONVEX_URL,RESEND_API_KEY&project-name=booki&repository-name=booki&integration-ids=oac_7uYNbc9CdDAZmNqbt3LEkO3a,oac_KfIFnjXqCl4YJCHnt1bDTBI1,oac_3VVZ8LCjsv8TRvpgr9MozShA&skippable-integrations=2)


## Environment Variables

To run this project, you'll need to add the following environment variables to your .env.local file:

```bash
# Clerk Authentication
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=your_clerk_publishable_key
CLERK_SECRET_KEY=your_clerk_secret_key

# Convex
NEXT_PUBLIC_CONVEX_URL=your_convex_deployment_url

# Resend
RESEND_API_KEY=your_resend_api_key
```

## Development

For detailed development guidelines and project structure, please refer to our [Development Plan](./development-plan.md).

## Contributing

Contributions are welcome! Please read our [Contributing Guide](CONTRIBUTING.md) for details on our code of conduct and the process for submitting pull requests.

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
