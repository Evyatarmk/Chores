import { Stack } from "expo-router";
import { GroceryProvider } from "./Context/GroceryContext";

export default function RootLayout() {
return (
  <GroceryProvider>
  <Stack screenOptions={{
    headerShown: false,
    headerStyle: {
      backgroundColor: '#f4511e',
    },
    headerTintColor: '#fff',
    headerTitleStyle: {
      fontWeight: 'bold',
    },
  }}>
<Stack.Screen name="index" />
<Stack.Screen name="GroceryListsScreen" />
<Stack.Screen name="GroceryItemsScreen" />
<Stack.Screen name="AddGroceryListScreen" />
<Stack.Screen name="AddGroceryItemScreen" />
</Stack>
</GroceryProvider>
);
}
