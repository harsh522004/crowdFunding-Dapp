
import { createRoot } from "react-dom/client";
import "./index.css";
import "./Pages/HomePage.tsx";

import {
  createBrowserRouter,
  createRoutesFromElements,
  Route,
  RouterProvider,
} from "react-router-dom";
import '@rainbow-me/rainbowkit/styles.css';

import Layout from "./components/Layout.tsx";
import HomePage from "./Pages/HomePage.tsx";
import CreateCampaignPage from "./Pages/CreateCampaignPage.tsx";
import MyCampaignsPage from "./Pages/MyCampaignsPage.tsx";
import CampaignDetailPage from "./Pages/CampaignDetailPage.tsx";
import { WagmiProvider } from 'wagmi';
import { RainbowKitProvider } from '@rainbow-me/rainbowkit';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

import { config } from "./wagmiConfig.ts";

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

const queryClient = new QueryClient();
createRoot(document.getElementById("root")!).render(

  <WagmiProvider config={config}>
    <QueryClientProvider client={queryClient}>
      <RainbowKitProvider initialChain={config.chains[0]} >
        <RouterProvider router={router}></RouterProvider>
      </RainbowKitProvider>
    </QueryClientProvider>
  </WagmiProvider>
);
