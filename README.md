# Mini School Management Frontend

Modern, responsive frontend for the Mini School Management System built with Next.js 15, TypeScript, and shadcn/ui.

## Features

- **Role-based Dashboards**: Admin, Teacher, and Student specific interfaces
- **Student Management**: Create, update, and manage student records
- **Class Management**: Create classes and assign teachers
- **Enrollment System**: Enroll students with capacity limits
- **Real-time Updates**: Auto-refresh data every 30 seconds
- **Responsive Design**: Mobile-friendly interface
- **Modern UI**: Built with shadcn/ui components and Tailwind CSS

## Tech Stack

- **Framework**: Next.js 15 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **UI Components**: shadcn/ui
- **Forms**: React Hook Form + Zod validation
- **HTTP Client**: Axios
- **Authentication**: JWT with cookies
- **Icons**: Lucide React

## Project Structure

```
src/
├── app/                    # Next.js App Router pages
│   ├── admin/             # Admin dashboard
│   ├── teacher/           # Teacher dashboard
│   ├── student/           # Student dashboard
│   ├── students/          # Student management
│   ├── classes/           # Class management
│   ├── enrollment/        # Enrollment management
│   ├── login/             # Login page
│   ├── register/          # Registration page
│   └── settings/          # Settings page
├── components/            # Reusable components
│   ├── auth/              # Authentication components
│   ├── layout/            # Layout components
│   ├── students/          # Student-related components
│   └── ui/                # shadcn/ui components
├── contexts/              # React contexts
├── lib/                   # Utilities and API calls
└── types/                 # TypeScript type definitions
```

## Getting Started

### Prerequisites

- Node.js 18+
- npm or yarn
- Backend API running (see backend repository)

### Installation

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```
3. Set up environment variables (see Environment Variables section)
4. Start the development server:
   ```bash
   npm run dev
   ```

The application will be available at `http://localhost:3001`

## Environment Variables

Create a `.env.local` file with the following variables:

```bash
# Backend API URL
NEXT_PUBLIC_API_URL=http://localhost:3000

# Environment
NODE_ENV=development
```

For production deployment, set:

```bash
NEXT_PUBLIC_API_URL=https://your-backend-api.vercel.app
NODE_ENV=production
```

## Features by Role

### Admin Dashboard

- View all students, teachers, and classes
- Create and manage classes
- Assign teachers to classes
- Enroll students in classes
- View comprehensive statistics
- Manage user accounts

### Teacher Dashboard

- View assigned classes and students
- Enroll students in their classes
- Access teaching-focused statistics
- View upcoming classes

### Student Dashboard

- View assigned classes and instructors
- Access personal statistics
- View class details and schedules

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint
- `npm run type-check` - Run TypeScript type checking

## Authentication

The application uses JWT-based authentication with the following flow:

1. User registers/logs in through the backend API
2. JWT tokens are stored in HTTP-only cookies
3. Axios interceptors handle token refresh automatically
4. Role-based routing protects different sections

## API Integration

The frontend communicates with the backend API through:

- **Axios instance** (`src/lib/api.ts`) with interceptors
- **Service modules** for different entities:
  - `src/lib/auth.ts` - Authentication
  - `src/lib/students.ts` - Student management
  - `src/lib/classes.ts` - Class management
  - `src/lib/admin.ts` - Admin operations

## Deployment

This frontend is configured for deployment on Vercel.

### Vercel Deployment

1. Connect your GitHub repository to Vercel
2. Set the following environment variables:
   - `NEXT_PUBLIC_API_URL` (your backend API URL)
   - `NODE_ENV=production`
3. Deploy

### Docker Deployment

```bash
# Build the image
docker build -t mini-school-frontend .

# Run the container
docker run -p 3001:3001 --env-file .env mini-school-frontend
```

## UI Components

Built with shadcn/ui components:

- **Button** - Various button styles
- **Input** - Form inputs
- **Card** - Content containers
- **Table** - Data tables
- **Dialog** - Modal dialogs
- **Select** - Dropdown selects
- **Badge** - Status indicators
- **Toast** - Notifications

## Responsive Design

- Mobile-first approach
- Responsive navigation with sidebar
- Adaptive layouts for different screen sizes
- Touch-friendly interfaces

## Security Features

- JWT token management
- Role-based access control
- Protected routes
- Input validation with Zod
- XSS protection
- CSRF protection through cookies

## Performance Optimizations

- Next.js 15 optimizations
- Image optimization
- Code splitting
- Lazy loading
- Caching strategies

## Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

This project is licensed under the ISC License.
