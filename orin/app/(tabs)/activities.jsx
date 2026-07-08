import { StyleSheet, TextInput, ScrollView, TouchableOpacity, Modal, Alert, View, ActivityIndicator, RefreshControl } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import ThemedView from '../../components/ThemedView';
import ThemedText from '../../components/ThemedText';
import { useState, useEffect, useCallback } from 'react';
import { Plus, X, Sparkles, RefreshCw } from 'lucide-react-native';
import { activitiesService } from '../../lib/activities';
import { Colors } from '../../constants/color';

export default function Activities() {
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');

  useEffect(() => {
    loadActivities();
  }, []);

  const loadActivities = async () => {
    try {
      const result = await activitiesService.list();
      console.log('Activities result:', result);
      setActivities(result.rows || result.documents || []);
    } catch (error) {
      console.error('Error loading activities:', error);
      if (error.message?.includes('not authorized')) {
        Alert.alert(
          'Setup Required',
          'Please create the "activities" table in Appwrite Console with proper permissions.',
          [{ text: 'OK' }]
        );
      } else {
        Alert.alert(
          'Error',
          'Failed to load activities. Please check your connection.',
          [{ text: 'OK' }]
        );
      }
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    loadActivities();
  }, []);

  const handleCreate = async () => {
    if (!name.trim()) {
      Alert.alert('Error', 'Please enter an activity name');
      return;
    }

    try {
      await activitiesService.create({ name, description });
      setName('');
      setDescription('');
      setModalVisible(false);
      loadActivities();
    } catch (error) {
      console.error('Error creating activity:', error);
      Alert.alert('Error', 'Failed to create activity');
    }
  };

  const handleDelete = async (id) => {
    try {
      await activitiesService.delete(id);
      loadActivities();
    } catch (error) {
      console.error('Error deleting activity:', error);
      Alert.alert('Error', 'Failed to delete activity');
    }
  };

  if (loading) {
    return (
      <LinearGradient
        colors={[Colors.gradientStart, Colors.gradientEnd]}
        style={styles.gradientContainer}
      >
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={Colors.iconColour} />
          <ThemedText style={styles.loadingText}>Loading your activities...</ThemedText>
        </View>
      </LinearGradient>
    );
  }

  return (
    <LinearGradient
      colors={[Colors.gradientStart, Colors.gradientEnd]}
      style={styles.gradientContainer}
    >
      <View style={styles.headerContainer}>
        <ThemedText title style={styles.header}>Your Activities</ThemedText>
        <View style={styles.iconContainer}>
          <Sparkles size={24} color={Colors.iconColour} />
        </View>
      </View>

      <ScrollView 
        style={styles.scrollView} 
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={[Colors.iconColour]}
            tintColor={Colors.iconColour}
          />
        }
      >
        {activities.length === 0 ? (
          <View style={styles.emptyContainer}>
            <ThemedText style={styles.emptyText}>No activities yet</ThemedText>
            <ThemedText style={styles.emptySubtext}>Tap the + button to add your first activity</ThemedText>
          </View>
        ) : (
          activities.map((activity, index) => (
            <View key={activity.$id} style={[styles.activityCard, { backgroundColor: index % 2 === 0 ? Colors.cardBackground : 'rgba(255, 255, 255, 0.4)' }]}>
              <ThemedText title style={styles.activityName}>{activity.name}</ThemedText>
              <ThemedText style={styles.activityDescription}>
                {activity.description || 'No description'}
              </ThemedText>
              <TouchableOpacity
                style={styles.deleteButton}
                onPress={() => handleDelete(activity.$id)}
              >
                <X size={18} color={Colors.iconColour} strokeWidth={1.5} />
              </TouchableOpacity>
            </View>
          ))
        )}
        <View style={styles.bottomSpacer} />
      </ScrollView>

      <TouchableOpacity
        style={styles.fab}
        onPress={() => setModalVisible(true)}
      >
        <LinearGradient
          colors={[Colors.softLavender, Colors.blushPink]}
          style={styles.fabGradient}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        >
          <Plus size={28} color={Colors.white} strokeWidth={2} />
        </LinearGradient>
      </TouchableOpacity>

      <Modal
        visible={modalVisible}
        animationType="fade"
        transparent={true}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <LinearGradient
            colors={[Colors.pastelPurpleStart, Colors.pastelPurpleEnd]}
            style={styles.modalContent}
          >
            <ThemedText title style={styles.modalTitle}>New Activity</ThemedText>

            <TextInput
              style={styles.input}
              placeholder="Activity Name"
              placeholderTextColor={Colors.text}
              value={name}
              onChangeText={setName}
              color={Colors.text}
            />

            <TextInput
              style={[styles.input, styles.textArea]}
              placeholder="Description (optional)"
              placeholderTextColor={Colors.text}
              value={description}
              onChangeText={setDescription}
              multiline
              numberOfLines={4}
              color={Colors.text}
            />

            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.button, styles.cancelButton]}
                onPress={() => {
                  setModalVisible(false);
                  setName('');
                  setDescription('');
                }}
              >
                <ThemedText style={styles.buttonText}>Cancel</ThemedText>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.button, styles.saveButton]}
                onPress={handleCreate}
              >
                <ThemedText style={styles.buttonText}>Save</ThemedText>
              </TouchableOpacity>
            </View>
          </LinearGradient>
        </View>
      </Modal>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  gradientContainer: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: Colors.text,
  },
  headerContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingTop: 60,
    paddingBottom: 20,
  },
  header: {
    fontSize: 32,
    fontFamily: 'Poppins-Bold',
    color: Colors.title,
  },
  iconContainer: {
    padding: 8,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
  },
  scrollView: {
    flex: 1,
    paddingHorizontal: 20,
  },
  emptyContainer: {
    alignItems: 'center',
    marginTop: 80,
  },
  emptyText: {
    fontSize: 20,
    color: Colors.text,
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 14,
    color: Colors.secondaryText,
    textAlign: 'center',
  },
  activityCard: {
    borderRadius: 20,
    padding: 20,
    marginBottom: 16,
    position: 'relative',
    borderWidth: 1,
    borderColor: Colors.cardBorder,
    shadowColor: Colors.softLavender,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  activityName: {
    fontSize: 20,
    fontFamily: 'Poppins-Medium',
    marginBottom: 8,
    color: Colors.title,
  },
  activityDescription: {
    fontSize: 15,
    color: Colors.text,
    lineHeight: 22,
  },
  deleteButton: {
    position: 'absolute',
    top: 16,
    right: 16,
    padding: 8,
    borderRadius: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.5)',
  },
  bottomSpacer: {
    height: 100,
  },
  fab: {
    position: 'absolute',
    bottom: 30,
    right: 24,
    width: 64,
    height: 64,
    borderRadius: 32,
    overflow: 'hidden',
    shadowColor: Colors.softLavender,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  fabGradient: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
  },
  modalContent: {
    width: '90%',
    maxWidth: 400,
    borderRadius: 24,
    padding: 28,
    shadowColor: Colors.softLavender,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.2,
    shadowRadius: 16,
    elevation: 8,
  },
  modalTitle: {
    fontSize: 26,
    marginBottom: 24,
    color: Colors.title,
    fontFamily: 'Poppins-Bold',
  },
  input: {
    backgroundColor: 'rgba(255, 255, 255, 0.6)',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    fontSize: 16,
    borderWidth: 1,
    borderColor: Colors.cardBorder,
  },
  textArea: {
    height: 100,
    textAlignVertical: 'top',
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 8,
  },
  button: {
    flex: 1,
    padding: 16,
    borderRadius: 16,
    alignItems: 'center',
    marginHorizontal: 6,
  },
  cancelButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.5)',
  },
  saveButton: {
    backgroundColor: Colors.softLavender,
  },
  buttonText: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.title,
  },
});