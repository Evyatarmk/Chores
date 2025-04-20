import { Stack } from "expo-router";
import { ListsProvider } from "./Context/ListsContext";
import { TaskProvider } from "./Context/TaskContext";
import { UserAndHomeProvider } from "./Context/UserAndHomeContext";
import { ApiUrlProvider } from "./Context/ApiUrlProvider";
import { CategoryProvider } from "./Context/CategoryContext";
import { ItemHistoryProvider } from "./Context/ItemHistoryContext";
import { StoriesProvider } from "./Context/StoriesContext";
import { NotificationProvider } from './Context/NotificationContext';
import AutoLogin from "./AutoLogin";

export default function RootLayout() {
  return (
    <NotificationProvider>
    <ApiUrlProvider>
      <UserAndHomeProvider>
      <StoriesProvider>
        <CategoryProvider>
          <TaskProvider>
            <ListsProvider>
              <ItemHistoryProvider>
              <AutoLogin/>
              <Stack
                screenOptions={{
                  headerShown: false,
                  animation: "none", 
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
                <Stack.Screen name="TaskEditScreen" />
                <Stack.Screen name="HomePageScreen" />
                <Stack.Screen name="ChatScreen" />
                <Stack.Screen name="SettingsScreen" />
                <Stack.Screen name="ChangeHomeScreen" />
                <Stack.Screen name= "EditCategoryScreen"/>
              </Stack>
              </ItemHistoryProvider>
            </ListsProvider>
          </TaskProvider>
        </CategoryProvider>
      </StoriesProvider>
      </UserAndHomeProvider>
    </ApiUrlProvider>
    </NotificationProvider>
  );
}

