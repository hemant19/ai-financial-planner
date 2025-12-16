import { type RouteConfig, index, layout, route } from "@react-router/dev/routes";

export default [
  layout("routes/layout.tsx", [
    index("routes/dashboard.tsx"),
    route("indian-equities", "routes/indian-equities.tsx"),
    route("us-stocks", "routes/us-stocks.tsx"),
    route("fixed-deposits", "routes/fixed-deposits.tsx"),
  ]),
] satisfies RouteConfig;
