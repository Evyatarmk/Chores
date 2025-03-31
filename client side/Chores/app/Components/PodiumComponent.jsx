import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

const PodiumComponent = ({ contributors }) => {
  return (
    <View style={styles.container}>
      <Text style={styles.header}>Monthly Task Leaders</Text>
      {contributors.map((contributor, index) => (
        <View key={index} style={styles.contributorContainer}>
          <Text style={styles.rank}>#{index + 1}</Text>
          <Text style={styles.name}>{contributor.name}</Text>
          <Text style={styles.tasks}>{contributor.tasksCompleted} tasks</Text>
        </View>
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 20,
    backgroundColor: '#f0f0f0',
    borderRadius: 10,
    marginTop: 20,
  },
  header: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  contributorContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 5,
  },
  rank: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  name: {
    fontSize: 16,
    fontWeight: 'normal',
  },
  tasks: {
    fontSize: 16,
  }
});

export default PodiumComponent;
