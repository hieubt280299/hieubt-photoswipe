import React from "react";
import ReactDOM from "react-dom";
import Examples from "./Examples";
import { createRoot } from "react-dom/client";

const domNode: any = document.getElementById("examples-root");
const root = createRoot(domNode);

root.render(
  <React.StrictMode>
    <Examples />
  </React.StrictMode>
);
