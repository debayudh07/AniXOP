import { Stack } from "expo-router";
import "../global.css";

import { GluestackUIProvider } from '@/components/ui/gluestack-ui-provider';
import '@/global.css';

export default function RootLayout() {
  return (
    
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
        name="(tabs)" 
      />
    </Stack>
    </GluestackUIProvider>
  
  );
}
