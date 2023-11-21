import { Links, LiveReload, Meta, Outlet, Scripts } from "@remix-run/react";
import React from "react"; // Add this import statement

import HelloWorld from "./routes/hello";
import TransactionsTable from "./routes/TransactionsTable";

export default function App() {

  return (
    <html>
      <head>
        <link rel="icon" href="data:image/x-icon;base64,AA" />
        <Meta />
        <Links />
      </head>
      <body>
        <HelloWorld />
        <TransactionsTable />
        <Outlet />
        <Scripts />
        <LiveReload />
      </body>
    </html>
  );
}
