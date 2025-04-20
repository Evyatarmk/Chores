import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { useUserAndHome } from "./Context/UserAndHomeContext";
import PageWithMenu from "./Components/PageWithMenu";
import { useApiUrl } from "./Context/ApiUrlProvider";
import NormalHeader from "./Components/NormalHeader";
import { Icon } from '@rneui/base';
import { useRouter } from "expo-router";

const SettingsScreen = () => {
  const router = useRouter();

  const settings = [
    { title: "לעבור בית", onPress: () =>   router.push("/ChangeHomeScreen")},
    { title: "הבית שלי", onPress: () => console.log("הבית שלי") },
    {
      title: "התנתק", onPress: () => {
        setUser(null);
        setHome(null);
      }
    },
    {title: "עריכת קטגוריות", onPress: () =>   router.push("/EditCategoryScreen") }
  ];

  return (
    <PageWithMenu>
      <NormalHeader title="הגדרות" />
      <View style={styles.container}>
        {settings.map((item, index) => (
          <TouchableOpacity key={index} style={styles.settingRow} onPress={item.onPress}>
            <Icon
              type="ionicon"
              name="chevron-forward-outline"
              size={20}
              color="#999"
              style={{ transform: [{ rotate: '180deg' }] }}
            />
            <Text style={styles.settingText}>{item.title}</Text>
          </TouchableOpacity>
        ))}
      </View>
    </PageWithMenu>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 16,
  },
  settingRow: {
    backgroundColor: "#fff",
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderRadius: 12,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 1,
  },
  settingText: {
    fontSize: 16,
    color: "#333",
  },
});

export default SettingsScreen;
