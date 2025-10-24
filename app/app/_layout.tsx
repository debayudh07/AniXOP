import { Stack } from "expo-router";
import "../global.css";

import { GluestackUIProvider } from '@/components/ui/gluestack-ui-provider';
import '@/global.css';

export default function RootLayout() {
  return (
    
    <GluestackUIProvider mode="dark">
      <Stack
      screenOptions={{
        headerStyle: {
          backgroundColor: "#F2F2F7",
        },
        headerTitleStyle: {
          fontWeight: "600",
        },
      }}
    >
      <Stack.Screen 
        name="index" 
        options={{ 
          title: "AniXOP",
          headerShown: true 
        }} 
      />
      <Stack.Screen 
        name="(tabs)" 
        options={{ 
          headerShown: false 
        }} 
      />
    </Stack>
    </GluestackUIProvider>
  
  );
}
