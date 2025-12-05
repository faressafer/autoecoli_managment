# 🚗 AutoEcoli Management System

A comprehensive management platform for driving schools built with Next.js 16, Firebase, and TypeScript.

## 🌟 Features

- 👤 **User Authentication** - Firebase Auth with role-based access
- 🏫 **Auto-École Management** - Manage driving schools, packs, and payments
- 💰 **Treasury System** - Track income/expenses with real-time updates
- 📊 **Dashboard** - Analytics and metrics
- 🔔 **Notification System** - Real-time notifications for auto-écoles
- 📄 **Contract Management** - Handle contracts and conventions
- 📈 **Marketing Tools** - Campaign management and tracking
- 🧾 **Invoicing** - Generate and manage invoices

## 🚀 Getting Started

### Prerequisites

- Node.js 20+
- npm or yarn
- Firebase account

### Installation

1. Clone the repository:
```bash
git clone https://github.com/faressafer/autoecoli_managment.git
cd autoecoli_managment
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
Create a `.env.local` file in the root directory:
```env
# Firebase Client Config
NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_auth_domain
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_storage_bucket
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_messaging_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id
NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID=your_measurement_id

# Firebase Admin (Server-side)
FIREBASE_ADMIN_PROJECT_ID=your_project_id
FIREBASE_ADMIN_CLIENT_EMAIL=your_service_account_email
FIREBASE_ADMIN_PRIVATE_KEY="your_private_key"
```

4. Run the development server:
```bash
npm run dev
```

5. Open [http://localhost:3000](http://localhost:3000)

## 🐳 Docker Deployment

### Quick Build

**Windows:**
```bash
.\build-docker.bat
```

**Linux/Mac:**
```bash
chmod +x build-docker.sh
./build-docker.sh
```

### Run Container
```bash
docker run -p 3000:3000 --env-file .env autoecoli-management:latest
```

### Manual Docker Build
```bash
docker build \
  --build-arg NEXT_PUBLIC_FIREBASE_API_KEY="your_key" \
  --build-arg NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN="your_domain" \
  --build-arg NEXT_PUBLIC_FIREBASE_PROJECT_ID="your_project" \
  --build-arg NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET="your_bucket" \
  --build-arg NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID="your_sender_id" \
  --build-arg NEXT_PUBLIC_FIREBASE_APP_ID="your_app_id" \
  --build-arg NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID="your_measurement_id" \
  -t autoecoli-management:latest .
```

## ☁️ Cloud Deployment

### Google Cloud Run
```bash
gcloud builds submit --config cloudbuild.yaml
```

### Vercel
1. Import project to Vercel
2. Add environment variables in dashboard
3. Deploy automatically

See [QUICK_DEPLOY.md](./QUICK_DEPLOY.md) for detailed deployment instructions.

## 📚 Documentation

- [Deployment Fix Guide](./DEPLOYMENT_FIX.md) - Fixes for Firebase deployment errors
- [Quick Deployment Guide](./QUICK_DEPLOY.md) - Step-by-step deployment
- [Notification System for Auto-École](./NOTIFICATION_AUTOECOLE_PROMPT.md) - Implementation guide

## 🏗️ Project Structure

```
autoecoli_managment/
├── app/                    # Next.js App Router pages
│   ├── (main)/            # Main application routes
│   │   ├── dashboard/     # Dashboard page
│   │   ├── caisse/        # Treasury management
│   │   ├── notifications/ # Notification center
│   │   └── ...
│   └── (auth)/            # Authentication pages
├── components/            # React components
├── contexts/              # React contexts (Auth, Language)
├── lib/                   # Utilities and services
│   ├── firebase/         # Firebase configuration & services
│   └── types/            # TypeScript interfaces
├── public/               # Static assets
└── scripts/              # Build and utility scripts
```

## 🔧 Tech Stack

- **Framework:** Next.js 16 with App Router
- **Language:** TypeScript
- **Authentication:** Firebase Auth
- **Database:** Firebase Firestore
- **Storage:** Firebase Storage
- **Styling:** Tailwind CSS
- **Icons:** Lucide React
- **Deployment:** Docker, Google Cloud Run, Vercel

## 🔒 Security

- Role-based access control (Super Admin, Admin)
- Firebase security rules
- Environment variable protection
- Client-side route protection with ProtectedRoute

## 🐛 Troubleshooting

### Firebase Auth Errors
If you see `auth/invalid-api-key` or `client is offline`:
1. Ensure all environment variables are set
2. For Docker builds, pass build arguments
3. Check [DEPLOYMENT_FIX.md](./DEPLOYMENT_FIX.md)

### Build Failures
```bash
# Clear cache and rebuild
rm -rf .next node_modules
npm install
npm run build
```

## 📝 Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Open a Pull Request

## 📄 License

This project is private and proprietary.

## 👥 Authors

- **Fares Safer** - [@faressafer](https://github.com/faressafer)

## 🆘 Support

For issues and questions:
1. Check documentation in `/docs`
2. Review [DEPLOYMENT_FIX.md](./DEPLOYMENT_FIX.md)
3. Create an issue on GitHub

---

**Built with ❤️ for AutoEcoli**
