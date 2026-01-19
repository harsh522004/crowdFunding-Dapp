import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import "./Pages/HomePage.tsx";

import {
  createBrowserRouter,
  createRoutesFromElements,
  Route,
  RouterProvider,
} from "react-router-dom";
import Layout from "./components/Layout.tsx";
import HomePage from "./Pages/HomePage.tsx";
import CreateCampaignPage from "./Pages/CreateCampaignPage.tsx";
import MyCampaignsPage from "./Pages/MyCampaignsPage.tsx";
import CampaignDetailPage from "./Pages/CampaignDetailPage.tsx";

const router = createBrowserRouter(
  createRoutesFromElements(
    <Route path="/" element={<Layout></Layout>}>
      <Route index element={<HomePage></HomePage>}></Route>\
      <Route
        path="create"
        element={<CreateCampaignPage></CreateCampaignPage>}
      ></Route>
      <Route
        path="my-campaigns"
        element={<MyCampaignsPage></MyCampaignsPage>}
      ></Route>
      <Route
        path="campaign/:address"
        element={<CampaignDetailPage></CampaignDetailPage>}
      ></Route>
    </Route>,
  ),
);
createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <RouterProvider router={router} />
  </StrictMode>,
);
