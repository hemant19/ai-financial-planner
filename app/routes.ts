import { type RouteConfig, index, layout, route } from "@react-router/dev/routes";

export default [
  // Public Landing Page (Root)
  index("routes/landing.tsx"),

  // Main Application Routes
  layout("routes/layout.tsx", [
    route("dashboard", "routes/dashboard.tsx"),
    route("indian-equities", "routes/indian-equities.tsx"),
    route("indian-mutual-funds", "routes/indian-mutual-funds.tsx"),
    route("us-stocks", "routes/us-stocks.tsx"),
    route("fixed-deposits", "routes/fixed-deposits.tsx"),
    route("equity/:holdingId", "routes/equity.$holdingId.tsx"),
    route("advisor", "routes/advisor.tsx"),
  ]),


  // Login route: accessible to all
  route("login", "routes/login.tsx"),
] satisfies RouteConfig;

