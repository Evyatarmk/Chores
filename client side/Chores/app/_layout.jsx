import { Stack } from "expo-router";
import { ListsProvider } from "./Context/ListsContext";
import { TaskProvider } from "./Context/TaskContext";
import { UserAndHomeProvider } from "./Context/UserAndHomeContext";
import { ApiUrlProvider } from "./Context/ApiUrlProvider";
import { CategoryProvider } from "./Context/CategoryContext";
import { StoriesProvider } from "./Context/StoriesContext";
import AutoLogin from "./AutoLogin";

export default function RootLayout() {
  return (
    <ApiUrlProvider>
      <UserAndHomeProvider>
      <StoriesProvider>
        <CategoryProvider>
          <TaskProvider>
            <ListsProvider>
              <AutoLogin/>
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
                <Stack.Screen name="ListsScreen" />
                <Stack.Screen name="ListItemsScreen" />
                <Stack.Screen name="AddListScreen" />
                <Stack.Screen name="AddListItemsScreen" />
                <Stack.Screen name="RegisterScreen" />
                <Stack.Screen name="LoginScreen" />
                <Stack.Screen name="ProfileScreen" />
                <Stack.Screen name="EditProfileScreen" />
                <Stack.Screen name="AddTaskScreen" />
                <Stack.Screen name="TaskDetailsScreen" />
                <Stack.Screen name="HomePageScreen" />
              </Stack>
            </ListsProvider>
          </TaskProvider>
        </CategoryProvider>
      </StoriesProvider>
      </UserAndHomeProvider>
    </ApiUrlProvider>
  );
}

