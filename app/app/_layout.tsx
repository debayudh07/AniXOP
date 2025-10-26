import "@walletconnect/react-native-compat";
import * as React from 'react';
import { Stack } from "expo-router";
import { StatusBar } from 'expo-status-bar';
import 'react-native-reanimated';
import { WagmiProvider } from "wagmi";
import { mainnet, polygon, arbitrum, avalanche, avalancheFuji, sepolia } from "@wagmi/core/chains";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  createAppKit,
  defaultWagmiConfig,
  AppKit,
} from "@reown/appkit-wagmi-react-native";

import "../global.css";
import { GluestackUIProvider } from '@/components/ui/gluestack-ui-provider';
import '@/global.css';
import { AuthProvider } from './context/AuthContext';

// 0. Setup queryClient
const queryClient = new QueryClient();

// 1. Get projectId at https://dashboard.reown.com
const projectId = "d7a02a53cb01499fb2e0b3e591b03637";

// 2. Create config
const metadata = {
  name: "AniXOP",
  description: "AniXOP Learning Platform",
  url: "https://anixop.com",
  icons: ["https://avatars.githubusercontent.com/u/179229932"],
  redirect: {
    native: "anixop://",
    universal: "anixop.com",
  },
};

const chains = [mainnet, polygon, arbitrum, avalanche, avalancheFuji , sepolia] as const;

const wagmiConfig = defaultWagmiConfig({ chains, projectId, metadata });

// 3. Create modal at module level
let appKitInitialized = false;

if (!appKitInitialized) {
  try {
    createAppKit({
      projectId,
      metadata,
      wagmiConfig,
      defaultChain: mainnet, // Optional
      enableAnalytics: true, // Optional - defaults to your Cloud configuration
    });
    appKitInitialized = true;
    console.log('AppKit created successfully');
  } catch (error) {
    console.error('Error creating AppKit:', error);
  }
}

export default function RootLayout() {

  return (
    <WagmiProvider config={wagmiConfig}>
      <QueryClientProvider client={queryClient}>
        <AuthProvider>
          <GluestackUIProvider mode="dark">
            <Stack
              screenOptions={{
                headerShown: false,
              }}
            >
              <Stack.Screen 
                name="index" 
              />
              <Stack.Screen 
                name="auth" 
              />
              <Stack.Screen 
                name="(tabs)" 
              />
              <Stack.Screen 
                name="concept/[id]"
                options={{
                  presentation: 'modal',
                }}
              />
            </Stack>
            <StatusBar style="light" />
          </GluestackUIProvider>
          <AppKit />
        </AuthProvider>
      </QueryClientProvider>
    </WagmiProvider>
  );
}
