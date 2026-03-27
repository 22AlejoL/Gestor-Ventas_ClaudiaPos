# ClaudiaPOS 🚀 - Modern SaaS Point of Sale System

ClaudiaPOS is a high-performance, aesthetically pleasing **SaaS Point of Sale (POS)** and business management solution. Built with a modern tech stack (React 19 + Vite), it offers a seamless experience for multi-role retail operations, from street-level sellers to regional administrators.

---

## ✨ Key Features

- **🛍️ Multi-Role Ecosystem:**
  - **SELLER:** Fast terminal interface for processing sales (Cash, Card, Digital), cart management, and shift summaries.
  - **OWNER:** In-depth business health dashboard with interactive charts, performance reports, and inventory control.
  - **SUPER_ADMIN:** Ecosystem-wide oversight to manage multiple businesses, owners, and system-wide metrics.
- **📊 Advanced Data Visualization:** Interactive sales trends, payment method breakdowns, and inventory health using `Recharts`.
- **📦 Inventory Intelligence:** Real-time stock alerts, "unlimited" stock indicators, and easy product editing.
- **🪄 Premium UI/UX:** Smooth transitions and micro-animations powered by `Framer Motion` (Motion), utilizing a clean `Tailwind CSS 4` design system.
- **⚡ Built for Speed:** Instant-load performance using `Vite` and `TypeScript` for type-safety across the entire POS flow.

---

## 🛠️ Tech Stack

- **Framework:** [React 19](https://react.dev/)
- **Language:** [TypeScript](https://www.typescriptlang.org/)
- **Styling:** [Tailwind CSS 4](https://tailwindcss.com/)
- **Icons:** [Lucide React](https://lucide.dev/)
- **Animations:** [Motion (Framer Motion)](https://motion.dev/)
- **Charts:** [Recharts](https://recharts.org/)
- **Bundler:** [Vite](https://vitejs.dev/)

---

## 🚀 Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) (LTS recommended)

### Installation

1.  **Clone the repository:**
    ```bash
    git clone https://github.com/your-username/claudiapos.git
    cd Gestor-Ventas_ClaudiaPos
    ```

2.  **Install dependencies:**
    ```bash
    npm install
    ```

3.  **Run in development mode:**
    ```bash
    npm run dev
    ```

---

## 🔐 Authentication (Current Flow)

Authentication is handled with Supabase Auth using real credentials (`email` + `password`) from the login screen.

After login, the app resolves permissions from the `profiles` table and enables routes based on role:
- **SUPER_ADMIN**
- **OWNER**
- **SELLER**

Notes:
- The UI role is no longer assigned from email string patterns.
- User/role provisioning for admin flows is done through the `manage-users` Supabase function.

### Required Environment Variables

Create `.env.local` with:

```bash
VITE_SUPABASE_URL=...
VITE_SUPABASE_ANON_KEY=...
VITE_DATA_SOURCE=supabase
# Optional when using local Express for products/sales
# VITE_DATA_SOURCE=local
# VITE_LOCAL_API_BASE_URL=http://localhost:3001
```

---

## 🏗️ Project Structure

- `src/App.tsx`: Main application monolith containing core views and routing.
- `src/types.ts`: Core data models and TypeScript definitions.
- `src/main.tsx`: Application entry point.
- `tailwind.config.js`: Custom design system configuration.
- `src/services/api.ts`: Main data service for products/sales/business reads.
- `src/server/index.ts`: Local Express server for file-backed endpoints (`/api/products`, `/api/sales`) used as a lightweight local backend option.

---

## 🔮 Future Roadmap

- [ ] Transition from Local State to Global State (Zustand/Redux).
- [ ] Backend integration with Express (already in `package.json`).
- [ ] Database persistence (PostgreSQL/MongoDB).
- [ ] AI-powered sales forecasting.
