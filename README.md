# Factor DAO TokenList Frontend

The frontend is accessible at: [https://factor-tokenlist-frontend.vercel.app/](https://factor-tokenlist-frontend.vercel.app/)

This application provides an explorer interface for the Factor DAO TokenList, allowing users to browse tokens across multiple DeFi protocols and filter by various building blocks.

## Features

- Browse tokens across multiple blockchain networks
- Filter by protocol (Aave, Compound, Pendle, Silo, etc.)
- Filter by building blocks (Borrow, Lend, Provide Liquidity, etc.)
- Modern and responsive UI with dark mode support
- Detailed token information with protocol logos

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Technology Stack

- [Next.js](https://nextjs.org) - React framework
- [TypeScript](https://www.typescriptlang.org/) - Type-safe JavaScript
- [Tailwind CSS](https://tailwindcss.com/) - CSS framework
- [React Query](https://tanstack.com/query/latest) - Data fetching and state management
- [@factordao/tokenlist](https://github.com/Factor-fi/factor-tokenlist) - Token list package

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgments

- [Factor DAO](https://factor.fi) - Creator of the token list
- [Next.js](https://nextjs.org) - The web framework used
- [Vercel](https://vercel.com) - Deployment platform

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
