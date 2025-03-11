import { Stack } from "expo-router";
import { GroceryProvider } from "./Context/GroceryContext";
import { TaskProvider } from "./Context/TaskContext";
import { UserAndHomeProvider } from "./Context/UserAndHomeContext";
import { ApiUrlProvider } from "./Context/ApiUrlProvider";

export default function RootLayout() {
  return (
    <ApiUrlProvider>
    <UserAndHomeProvider>
        <TaskProvider>
          <GroceryProvider>
            <Stack
              screenOptions={{
                headerShown: false,
                headerStyle: { backgroundColor: "#f4511e" },
                headerTintColor: "#fff",
                headerTitleStyle: { fontWeight: "bold" },
              }}
            >
              <Stack.Screen name="index" />
              <Stack.Screen name="TasksListScreen" />
              <Stack.Screen name="GroceryListsScreen" />
              <Stack.Screen name="GroceryItemsScreen" />
              <Stack.Screen name="AddGroceryListScreen" />
              <Stack.Screen name="AddGroceryItemScreen" />
              <Stack.Screen name="RegisterScreen" />
              <Stack.Screen name="LoginScreen" />
              <Stack.Screen name="ProfileScreen"/> 
            </Stack>
          </GroceryProvider>
        </TaskProvider>
    </UserAndHomeProvider>
    </ApiUrlProvider>
  );
}

