# ShipFlow ERP: frontend demo

A clickable React demo of the **Shipping ERP Management System (China → India)**, built from the Mariox SOW in the parent folder.
All data is mocked in memory (`src/data/mock.js`), with about 12 months of generated history (79 shipments, 103 inquiries, 18 clients).
Refreshing the page resets it. Only the logged-in user and theme are kept.

## Run

```bash
npm install
npm run dev      # http://localhost:5173
```

Sign in with a user email and password (shared separately). Passwords are set per department; inactive accounts are blocked.

## Modules (SOW §6)

| Module | Route | Visible to |
| --- | --- | --- |
| Login & role-based access | `/login` | all |
| Dashboard | `/` | all |
| Analytics (KPIs, revenue/margin, funnel, transit, partners, lanes) | `/analytics` | Admin, Management, Sales |
| Client management (permanent shipping mark) | `/clients` | Admin, Management, Sales |
| Inquiry & quotation (rate comparison, versions, accept/reject) | `/inquiries` | Admin, Management, Sales |
| Shipment management + lifecycle detail | `/shipments`, `/shipments/:id` | all |
| China warehouse & dispatch (receiving, delivery note) | `/warehouse` | Admin, Management, China Ops |
| Final delivery (instructions, method, POD) | `/delivery` | Admin, Management, India Ops |
| Reports: 6 registers with filters, pagination and CSV export | `/reports` | all |
| Admin panel (users, role matrix, master data) | `/admin` | Admin |

All tables paginate with a rows-per-page selector; ops boards use "load more".

Stack: React 19, Vite, Tailwind CSS v4, React Router, Recharts, lucide-react. Light and dark themes.
