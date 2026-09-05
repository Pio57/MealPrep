/**
 * MealPrep
 * @format
 */

import { useEffect, type PropsWithChildren } from 'react';
import { LogBox, StatusBar, StyleSheet } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useSetAtom } from 'jotai';
import { queryClientAtom } from 'jotai-tanstack-query';
import { RootNavigator } from './src/Core/Navigation/RootNavigator';

const queryClient = new QueryClient();

// React Navigation's Android modal presentation still references the deprecated
// DrawerLayoutAndroid internally; harmless, but in dev the warning banner it
// triggers sits over on-screen controls and blocks taps, so it's silenced here
// (dev-only — LogBox doesn't exist in release builds).
LogBox.ignoreAllLogs();

/**
 * jotai-tanstack-query keeps its own reference to the QueryClient it drives.
 * This bridges it to the same instance backing <QueryClientProvider>, so a
 * screen using React Query's own hooks and one reading an atomWithQuery
 * share one cache.
 */
function QueryClientBridge({ children }: PropsWithChildren) {
  const setQueryClient = useSetAtom(queryClientAtom);

  useEffect(() => {
    setQueryClient(queryClient);
  }, [setQueryClient]);

  return children;
}

function App() {
  return (
    <GestureHandlerRootView style={styles.fill}>
      <StatusBar translucent backgroundColor="transparent" barStyle="dark-content" />
      <SafeAreaProvider>
        <QueryClientProvider client={queryClient}>
          <QueryClientBridge>
            <RootNavigator />
          </QueryClientBridge>
        </QueryClientProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({ fill: { flex: 1 } });

export default App;
