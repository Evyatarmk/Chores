import React from "react";
import { View, Text, TouchableOpacity, StyleSheet, Dimensions } from "react-native";
import { Avatar } from '@rneui/themed';
import { BarChart } from "react-native-chart-kit";
import { useUserAndHome } from "./Context/UserAndHomeContext";
import { useRouter } from "expo-router";
import NormalHeader from "./Components/NormalHeader";
import Icon from 'react-native-vector-icons/MaterialIcons';
import PageWithMenu from "./Components/PageWithMenu";

const ProfileScreen = () => {
  const router = useRouter();
  const { user, home, logout } = useUserAndHome();
  const screenWidth = Dimensions.get("window").width;
  const handleEdit = () => {
    router.push({
      pathname: "./EditProfileScreen",
    })
  };
  // נתונים אמיתיים מהמשתמש, אם אין נרצה להחזיר נתונים ברירת מחדל
  const taskStats = user?.tasksStats?.completedTasksByMonth || {};

  // אם אין נתונים, נמלא בנתונים לדוגמה
  const data = {
    labels: Object.keys(taskStats).map((month) => {
      // המרה מהמפתחות 1, 2, 3 לשמות חודשים
      const monthNames = ["ינואר", "פברואר", "מרץ"];
      return monthNames[parseInt(month) - 1] || `חודש ${month}`;
    }),
    datasets: [
      {
        data: Object.values(taskStats), // כמות המשימות שהושלמו לכל חודש
        color: (opacity = 1) => `rgba(76, 175, 80, ${opacity})`, // צבע הבר
        strokeWidth: 2, // עובי הקו של הבר
        fill: true, // מילוי בר בעמודה
      },
    ],
  };

  const chartConfig = {
    backgroundColor: "#f4f4f4",
    backgroundGradientFrom: "#f4f4f4",
    backgroundGradientTo: "#f4f4f4",
    decimalPlaces: 0,
    color: (opacity = 1) => `rgba(76, 175, 80, ${opacity})`, // צבע הגרף
    labelColor: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`, // צבע התוויות
    style: {
      borderRadius: 10,
    },
    propsForDots: {
      r: "6",
      strokeWidth: "2",
      stroke: "#ffa726",
    },
    propsForBackgroundLines: {
      strokeWidth: 0.5,
      stroke: "#D3D3D3", // צבע קווים לרקע
    },
  };

  return (
    <PageWithMenu>
      <NormalHeader title="אזור אישי" targetScreen="/"/>
      <View style={styles.profileCard}>
        <Avatar
          source={{ uri: user?.profilePicture || "https://via.placeholder.com/150" }}
          size="large"
          rounded
        />
        <Text style={styles.name}>{user?.name}</Text>
        <Text style={styles.code}>קוד הבית: {home?.code}</Text>
        <TouchableOpacity style={styles.editIcon} onPress={handleEdit}>
          <Icon name="edit" size={18} color="#fff" />
        </TouchableOpacity>
      </View>
      
        


      <Text style={styles.subTitle}>משימות שבוצעו</Text>
      <BarChart
        data={data}
        width={screenWidth - 40}
        height={220}
        yAxisLabel=""
        chartConfig={chartConfig}
        fromZero
        showValuesOnTopOfBars
        style={styles.chart}
      />
      <Text style={styles.subTitle}>חברי הבית</Text>
      <View style={styles.membersList}>
        {home?.members?.length > 0 ? (
          home.members.map((member) => (
            <View key={member.id} style={styles.memberItem}>
              <Text style={styles.memberName}>{member.name}</Text>
              <Text style={styles.memberRole}>
                {member.id === user.id ? "אתה" : member.role === "admin" ? "מנהל" : "חבר"}
              </Text>
            </View>
          ))
        ) : (
          <Text style={styles.noMembers}>אין חברים בבית</Text>
        )}
      </View>
      <TouchableOpacity onPress={() => logout()} style={styles.logoutButton}>
        <Icon name="exit-to-app" size={24} color="#fff" />
        <Text style={styles.logoutText}>התנתקות</Text>
      </TouchableOpacity>
    </PageWithMenu>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#e0e5ec",
  },
  profileCard: {
    padding: 20,
    borderRadius: 15,
    alignItems: "center",
    backgroundColor: "#fff",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    marginBottom: 20,
    position: "relative",
  },
  editIcon: {
    position: "absolute",
    top: 10,
    right: 10,
    backgroundColor: "#4CAF50",
    padding: 6,
    borderRadius: 20,
    elevation: 3,
  },
  name: {
    fontSize: 22,
    fontWeight: "bold",
    marginVertical: 10,
    color: "#333",
  },
  code: {
    fontSize: 12,
    color: "#555",
    marginBottom: 10,
  },
  subTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 10,
    textAlign: "center",
    
  },
  chart: {
    marginVertical: 10,
    borderRadius: 10,
    alignSelf: "center",
    
  },
  membersList: {
    backgroundColor: "#fff",
    borderRadius: 10,
    padding: 15,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  memberItem: {
    flexDirection: "row-reverse",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  memberName: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
  },
  memberRole: {
    fontSize: 16,
    color: "#888",
  },
  noMembers: {
    fontSize: 16,
    color: "#888",
    textAlign: "center",
    paddingVertical: 10,
  },
  logoutButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#ff5555",
    paddingVertical: 12,
    paddingHorizontal: 25,
    borderRadius: 25,
    marginTop: 20,
    alignSelf: "center",
  },
  logoutText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "bold",
    marginLeft: 10,
  },
});

export default ProfileScreen;
