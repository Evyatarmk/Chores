import React, { useEffect, useState } from "react";
import { View, Text, TouchableOpacity, StyleSheet, Dimensions, ScrollView, Image } from "react-native";
import { Avatar } from '@rneui/themed';
import { BarChart } from "react-native-chart-kit";
import { useUserAndHome } from "./Context/UserAndHomeContext";
import { useRouter } from "expo-router";
import NormalHeader from "./Components/NormalHeader";
import Icon from 'react-native-vector-icons/MaterialIcons';
import PageWithMenu from "./Components/PageWithMenu";
import { useApiUrl } from "./Context/ApiUrlProvider";




const ProfileScreen = () => {
  const { baseUrl } = useApiUrl();
  const router = useRouter();
  const { user, home, logout } = useUserAndHome();
  console.log(home)
  const screenWidth = Dimensions.get("window").width;
  const handleEdit = () => {
    router.push({
      pathname: "./EditProfileScreen",
    })
  };

  const [data, setData] = useState([]);

  useEffect(() => {
    if (user?.id) {
      fetch(`${baseUrl}/Tasks/completedTasksPerMonth/${user.id}`)
        .then((res) => res.json())
        .then((result) => {
          const mappedData = result.map(item => ({
            name: `${item.month}/${item.year}`,
            completedTasks: item.completedTasks
          }));
          setData(mappedData);
        })
        .catch((error) => console.error('Error fetching task data:', error));
    }
  }, [user?.id]);





  return (
    <PageWithMenu>
      <NormalHeader title="אזור אישי" targetScreen="/" />
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <View style={styles.profileCard}>
          <Image
            source={user?.profilePicture ? { uri: user?.profilePicture } : require('./images/userImage.jpg')}
            style={styles.userImage}
          />
          <Text style={styles.name}>{user?.name}</Text>
          <Text style={styles.code}>קוד הבית: {home?.code}</Text>
          <TouchableOpacity style={styles.editIcon} onPress={handleEdit}>
            <Icon name="edit" size={18} color="#fff" />
          </TouchableOpacity>
        </View>


        <Text style={styles.subTitle}>משימות שבוצעו</Text>
        <View style={{ alignItems: 'center', paddingHorizontal: 20 }}>
        <BarChart
          data={{
            labels: data.map(item => item.name),
            datasets: [
              {
                data: data.map(item => item.completedTasks),
              },
            ],
          }}
          width={screenWidth - 40} // add margin
          height={260}
          fromZero={true} // start y-axis from zero
          showValuesOnTopOfBars={true} // show numbers on bars
          yAxisLabel=""
          chartConfig={{
            backgroundColor: "#4c669f",
            backgroundGradientFrom: "#6a11cb",
            backgroundGradientTo: "#2575fc",
            decimalPlaces: 0,
            barPercentage: 0.7,
            color: (opacity = 1) => `rgba(255, 255, 255, ${opacity})`,
            labelColor: (opacity = 1) => `rgba(255, 255, 255, ${opacity})`,
            style: {
              borderRadius: 16,
            },
            propsForBackgroundLines: {
              stroke: "#e3e3e3",
              strokeDasharray: "", // solid lines
            },
          }}
          verticalLabelRotation={25}
        />
        </View>

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
      </ScrollView>
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
  userImage: {
    width: 60,
    height: 60,
    marginLeft: 10,
    borderRadius: 30,
    backgroundColor: "#ddd",
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
  scrollContainer: {
    paddingBottom: 20, // כדי להוסיף רווח בתחתית
  },
});

export default ProfileScreen;
