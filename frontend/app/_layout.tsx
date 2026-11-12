import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { StyleSheet } from 'react-native';

export default function RootLayout() {
  return (
    <GestureHandlerRootView style={styles.container}>
      <StatusBar style="auto" />
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="campaign/[id]" options={{ headerShown: false, animation: 'slide_from_right' }} />
        <Stack.Screen name="back/[id]" options={{ headerShown: false, animation: 'slide_from_bottom' }} />
        <Stack.Screen name="create/step1" options={{ headerShown: false, animation: 'slide_from_right' }} />
        <Stack.Screen name="create/step2" options={{ headerShown: false, animation: 'slide_from_right' }} />
        <Stack.Screen name="create/step3" options={{ headerShown: false, animation: 'slide_from_right' }} />
        <Stack.Screen name="create/step4" options={{ headerShown: false, animation: 'slide_from_right' }} />
        <Stack.Screen name="create/step5" options={{ headerShown: false, animation: 'slide_from_right' }} />
        <Stack.Screen name="auth/login" options={{ headerShown: false, animation: 'slide_from_bottom' }} />
        <Stack.Screen name="auth/signup" options={{ headerShown: false, animation: 'slide_from_bottom' }} />
        <Stack.Screen name="profile/campaign-detail" options={{ headerShown: false, animation: 'slide_from_right' }} />
        <Stack.Screen name="info/how-it-works" options={{ headerShown: false, animation: 'slide_from_right' }} />
        <Stack.Screen name="info/about" options={{ headerShown: false, animation: 'slide_from_right' }} />
        <Stack.Screen name="info/faq" options={{ headerShown: false, animation: 'slide_from_right' }} />
      </Stack>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
