# Personance Dashboard

**Your Personal Finance Management Dashboard**

The Personance dashboard application - a comprehensive personal finance management platform that helps you build wealth. Track your income, manage budgets, analyze assets vs liabilities, and progress toward financial independence with powerful insights and educational tools.

_Note: This is the dashboard application. The landing page is hosted separately._

## 💰 Key Features

### Financial Dashboard

- **Net Worth Tracking**: Monitor your assets, liabilities, and overall financial health
- **Cash Flow Analysis**: Track income vs expenses with detailed breakdowns
- **Financial Goals**: Set and monitor progress toward financial independence

### Rich Dad Poor Dad Integration

- **Cash Flow Quadrant**: Visualize income sources across Employee, Self-Employed, Business Owner, and Investor categories
- **Assets vs Liabilities**: Clear distinction between what puts money in vs takes money out of your pocket
- **Passive Income Tracker**: Monitor progress toward "escaping the rat race"

### Budgeting & Expense Management

- **Category-Based Budgets**: Create and track spending across different categories
- **Progress Monitoring**: Visual indicators of budget health and spending patterns
- **Recurring Transaction Management**: Handle regular income and expenses

### Wealth Building Tools

- **Investment Tracking**: Monitor stocks, real estate, and other assets
- **Educational Content**: Learn financial principles while managing your money
- **Action Items**: Specific steps to improve your financial position

### Prerequisites

- Node.js 18.17.0 or higher
- PostgreSQL database (we recommend [Neon](https://neon.tech/) for easy setup)
- Git

### 1. Clone and Setup

```bash
git clone https://github.com/Tony-Rako/Personance.git
cd Personance
npm install
```

### 2. Environment Configuration

Create a `.env` file in the root directory:

```env
# Database
DATABASE_URL="your_postgresql_connection_string"

# NextAuth.js
NEXTAUTH_SECRET="your_secret_key"
NEXTAUTH_URL="http://localhost:3000"

# OAuth Providers (optional)
GOOGLE_CLIENT_ID="your_google_client_id"
GOOGLE_CLIENT_SECRET="your_google_client_secret"
```

### 3. Database Setup

```bash
# Generate Prisma client
npx prisma generate

# Run database migrations
npx prisma db push

# (Optional) Seed with sample financial data
npx prisma db seed
```

### 4. Start Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to access your personal finance dashboard!

## 🛠️ Technology Stack

Personance is built with modern, robust technologies chosen for reliability, type safety, and excellent developer experience:

### Frontend

- **[Next.js 15](https://nextjs.org/)** - React framework with App Router for optimal performance
- **[TypeScript](https://www.typescriptlang.org/)** - Type safety for financial calculations and data integrity
- **[Tailwind CSS](https://tailwindcss.com/)** - Utility-first CSS for responsive financial dashboards
- **[shadcn/ui](https://ui.shadcn.com/)** - Beautiful, accessible UI components
- **[Recharts](https://recharts.org/)** - Financial data visualization and charts

### Backend & Database

- **[Prisma 6.5](https://prisma.io/)** - Type-safe database ORM with migrations
- **[PostgreSQL](https://postgresql.org/)** - Reliable database for financial data (via [Neon](https://neon.tech/))
- **[tRPC 11](https://trpc.io/)** - End-to-end type safety for financial APIs
- **[NextAuth.js 5](https://next-auth.js.org/)** - Secure authentication for financial data

### Development & Quality

- **[React Hook Form](https://react-hook-form.com/)** + **[Zod](https://zod.dev/)** - Form validation for financial inputs
- **[Vitest](https://vitest.dev/)** - Testing framework for financial calculations
- **[ESLint](https://eslint.org/)** + **[Prettier](https://prettier.io/)** - Code quality and consistency

## 📁 Project Structure

```
src/
├── app/                          # Next.js App Router
│   ├── dashboard/               # Financial dashboard pages
│   │   ├── budgeting/          # Budget management
│   │   ├── wealth-building/    # Rich Dad Poor Dad features
│   │   └── wealth/             # Net worth & investment tracking
│   ├── auth/                   # Authentication pages
│   └── api/                    # tRPC API routes
├── components/
│   ├── dashboard/              # Financial overview components
│   ├── budgeting/              # Budget-related components
│   ├── wealth-building/        # Cash Flow Quadrant, Assets vs Liabilities
│   ├── wealth/                 # Investment & net worth components
│   └── ui/                     # shadcn/ui base components
├── server/
│   └── api/                    # tRPC routers for financial operations
├── lib/                        # Financial utilities & calculations
├── hooks/                      # Custom React hooks for financial data
├── types/                      # TypeScript definitions for financial models
└── prisma/                     # Database schema & migrations
```

This structure separates financial concerns clearly, making it easy to extend and maintain wealth-building features.

## 🧪 Testing Financial Logic

```bash
npm run test        # Run all tests
npm run test:watch  # Run tests in watch mode
npm run test:ui     # Run tests with UI
npm run type-check  # TypeScript type checking
```

Financial applications require robust testing for:

- **Calculation Accuracy**: Ensure financial math is precise
- **Data Integrity**: Validate financial transactions and balances
- **User Security**: Test authentication and data protection
- **Component Reliability**: UI components handle edge cases properly

## 📝 Available Scripts

- `npm run dev` - Start development server with Turbopack
- `npm run build` - Build the application for production
- `npm run start` - Start the production server
- `npm run lint` - Run ESLint to check code quality
- `npm run type-check` - Run TypeScript compiler to check types
- `npx prisma studio` - Open database admin interface
- `npx prisma db push` - Apply schema changes to database

## 🤖 AI-Powered Development

### Claude Code Can Help You Build 10x Faster -

## 🚀 Deployment

**Database (Neon):**

1. Create account at [neon.tech](https://neon.tech/)
2. Create new project and get connection string
3. Add `DATABASE_URL` to your environment variables

**Application (Netlify):**

1. Connect your GitHub repository to [Coolify](https://coolify.io/) + [VPS](https://hostinger.com/)
2. Configure environment variables in Coolify dashboard
3. Deploy automatically on every push to main branch

**Environment Variables for Production:**

```env
DATABASE_URL="your_neon_connection_string"
NEXTAUTH_SECRET="your_production_secret"
NEXTAUTH_URL="https://your-domain.netlify.app"
```

## 📚 Financial Education Integration

### Rich Dad Poor Dad Principles

Personance implements core concepts from Robert Kiyosaki's teachings:

- **Assets vs Liabilities**: Clear categorization of what puts money in vs takes money out
- **Cash Flow Quadrant**: Track progression from Employee → Self-Employed → Business Owner → Investor
- **Passive Income Focus**: Monitor income streams that don't require active work
- **Financial Education**: Learn while managing your money with integrated tips and insights

### Learning Resources

- **Interactive Tutorials**: Learn financial concepts while using the app
- **Progress Tracking**: See your journey toward financial independence
- **Action Items**: Specific steps to improve your financial position
- **Educational Content**: Rich Dad principles integrated throughout the interface

## 🔒 Security & Privacy

Financial data requires extra security considerations:

- **Authentication**: Secure user authentication with NextAuth.js
- **Data Encryption**: Sensitive financial data is properly encrypted
- **Input Validation**: All financial inputs are validated with Zod schemas
- **Type Safety**: TypeScript ensures data integrity throughout the application
- **Database Security**: PostgreSQL with proper access controls and migrations

## 📞 Support & Contributing

### Issues & Feature Requests

- Open an issue on [GitHub](https://github.com/Tony-Rako/Personance/issues)
- Describe financial use cases and requirements clearly
- Include relevant financial scenarios in bug reports

### Contributing

1. Fork the repository
2. Create a feature branch for your financial feature
3. Ensure tests pass, especially financial calculations
4. Submit a pull request with clear description of changes

---

**Transform your financial future with Personance** 💰✨
