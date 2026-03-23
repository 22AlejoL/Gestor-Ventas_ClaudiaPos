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

## 🔐 Authentication (Demo Mode)

Access different views by using the following email patterns in the login screen:
- **Super Admin:** Any email containing `admin`
- **Business Owner:** Any email containing `owner`
- **Seller:** Any other email (default role)

---

## 🏗️ Project Structure

- `src/App.tsx`: Main application monolith containing core views and routing.
- `src/types.ts`: Core data models and TypeScript definitions.
- `src/main.tsx`: Application entry point.
- `tailwind.config.js`: Custom design system configuration.

---

## 🔮 Future Roadmap

- [ ] Transition from Local State to Global State (Zustand/Redux).
- [ ] Backend integration with Express (already in `package.json`).
- [ ] Database persistence (PostgreSQL/MongoDB).
- [ ] AI-powered sales forecasting using Google Gemini (dependency already included).
