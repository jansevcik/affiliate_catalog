
# EhubWeb - Affiliate E-commerce Catalog

Modern affiliate product catalog built with Next.js, Prisma, and PostgreSQL. Allows importing products from XML feeds and managing affiliate programs.

## Features

- 🛍️ **Product Catalog** - Browse products from multiple affiliate programs
- 📂 **Category Management** - Hierarchical category structure
- 🔍 **Advanced Search** - Search products with filters and sorting
- 📱 **Responsive Design** - Works on desktop and mobile
- 👤 **User Authentication** - NextAuth.js with admin roles
- ⚙️ **Admin Panel** - Manage affiliate programs and imports
- 📄 **XML Import** - Import products from XML feeds (Heureka, Zbozi, Google Shopping)
- 💝 **Wishlist** - Save favorite products

## Technology Stack

- **Framework:** Next.js 14 with App Router
- **Database:** PostgreSQL with Prisma ORM
- **Authentication:** NextAuth.js
- **Styling:** Tailwind CSS + shadcn/ui
- **Language:** TypeScript

## Getting Started

### Prerequisites

- Node.js 18+
- PostgreSQL database
- Yarn package manager

### Installation

1. Clone the repository:
```bash
git clone https://github.com/yourusername/ehubweb.git
cd ehubweb
```

2. Install dependencies:
```bash
cd app
yarn install
```

3. Set up environment variables:
```bash
cp .env.example .env
# Edit .env with your database and auth settings
```

4. Set up the database:
```bash
yarn prisma migrate dev
yarn prisma db seed
```

5. Start the development server:
```bash
yarn dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Admin Access

Default admin credentials:
- Email: sevcik.jan@seznam.cz
- Password: Jan80!

## Database Schema

The application includes:
- **Users** - User accounts with admin roles
- **AffiliatePrograms** - Affiliate program configurations
- **Products** - Product catalog with attributes
- **Categories** - Hierarchical category structure
- **ProductImports** - Import history and logs
- **Wishlists** - User wishlists

## API Endpoints

- `/api/products` - Product listing and search
- `/api/categories` - Category management
- `/api/affiliate-programs` - Affiliate program management
- `/api/affiliate/import` - XML import functionality
- `/api/auth/*` - NextAuth.js authentication

## Development

### Code Structure

```
app/
├── app/                    # Next.js app directory
├── components/            # React components
├── lib/                   # Utility libraries
├── prisma/               # Database schema and migrations
└── public/               # Static assets
```

### Key Components

- `AdminPage` - Admin dashboard
- `ProductGrid` - Product listing
- `CategorySidebar` - Category navigation
- `XmlImportForm` - XML import interface

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

MIT License
