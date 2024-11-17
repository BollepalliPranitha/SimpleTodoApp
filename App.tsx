import React, { useState, useRef } from 'react';
import {
  StyleSheet,
  Text,
  TextInput,
  View,
  FlatList,
  TouchableOpacity,
  Animated,
  Modal,
  Alert,
} from 'react-native';

type Task = {
  id: string;
  title: string;
  description: string;
  completed: boolean;
};

export default function App() {
  const [taskTitle, setTaskTitle] = useState('');
  const [taskDescription, setTaskDescription] = useState('');
  const [tasks, setTasks] = useState<Task[]>([]);
  const [editTask, setEditTask] = useState<Task | null>(null);
  const addAnimation = useRef(new Animated.Value(0)).current; // For adding tasks
  const deleteAnimations = useRef<{ [key: string]: Animated.Value }>({}).current; // For deleting tasks
  const [isEditModalVisible, setIsEditModalVisible] = useState(false);

  const addTask = () => {
    if (taskTitle.trim()) {
      const newTask = {
        id: Date.now().toString(),
        title: taskTitle,
        description: taskDescription,
        completed: false,
      };
      deleteAnimations[newTask.id] = new Animated.Value(0); // Initialize animation for task deletion

      addAnimation.setValue(0);
      Animated.timing(addAnimation, {
        toValue: 1,
        duration: 500,
        useNativeDriver: true,
      }).start(() => {
        setTasks((prevTasks) => [...prevTasks, newTask]);
      });

      setTaskTitle('');
      setTaskDescription('');
    } else {
      Alert.alert('Error', 'Task title cannot be empty.');
    }
  };

  const deleteTask = (taskId: string) => {
    if (deleteAnimations[taskId]) {
      Animated.timing(deleteAnimations[taskId], {
        toValue: 300, // Moves task off the screen
        duration: 300,
        useNativeDriver: true,
      }).start(() => {
        setTasks((prevTasks) => prevTasks.filter((task) => task.id !== taskId));
        delete deleteAnimations[taskId];
      });
    }
  };

  const editExistingTask = () => {
    if (editTask) {
      setTasks((prevTasks) =>
        prevTasks.map((task) =>
          task.id === editTask.id
            ? { ...task, title: taskTitle, description: taskDescription }
            : task
        )
      );
      setEditTask(null);
      setIsEditModalVisible(false);
      setTaskTitle('');
      setTaskDescription('');
    }
  };

  const openEditModal = (task: Task) => {
    setEditTask(task);
    setTaskTitle(task.title);
    setTaskDescription(task.description);
    setIsEditModalVisible(true);
  };

  const renderTask = ({ item }: { item: Task }) => {
    const taskAnimation = deleteAnimations[item.id] || new Animated.Value(0);

    return (
      <Animated.View
        style={[
          styles.taskContainer,
          {
            transform: [{ translateX: taskAnimation }],
          },
        ]}
      >
        <View style={{ flex: 1 }}>
          <Text
            style={[
              styles.taskTitle,
              item.completed && styles.completedTaskText,
            ]}
            onPress={() => toggleTaskCompletion(item.id)}
          >
            {item.title}
          </Text>
          <Text style={styles.taskDescription}>{item.description}</Text>
        </View>
        <View style={styles.taskActions}>
          <TouchableOpacity
            style={styles.editButton}
            onPress={() => openEditModal(item)}
          >
            <Text style={styles.editButtonText}>Edit</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.deleteButton}
            onPress={() => deleteTask(item.id)}
          >
            <Text style={styles.deleteButtonText}>Delete</Text>
          </TouchableOpacity>
        </View>
      </Animated.View>
    );
  };

  const toggleTaskCompletion = (taskId: string) => {
    setTasks((prevTasks) =>
      prevTasks.map((task) =>
        task.id === taskId ? { ...task, completed: !task.completed } : task
      )
    );
  };

  const fadeInStyle = {
    opacity: addAnimation,
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>To-Do List</Text>
      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          placeholder="Task Title"
          value={taskTitle}
          onChangeText={setTaskTitle}
        />
        <TextInput
          style={[styles.input, { marginTop: 10 }]}
          placeholder="Task Description"
          value={taskDescription}
          onChangeText={setTaskDescription}
        />
        <TouchableOpacity style={styles.addButton} onPress={addTask}>
          <Text style={styles.addButtonText}>Add</Text>
        </TouchableOpacity>
      </View>
      <Animated.View style={[fadeInStyle, { flex: 1 }]}>
        <FlatList
          data={tasks}
          renderItem={renderTask}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContainer}
        />
      </Animated.View>

      {/* Edit Modal */}
      <Modal visible={isEditModalVisible} transparent animationType="slide">
        <View style={styles.modalContainer}>
          <Text style={styles.modalTitle}>Edit Task</Text>
          <TextInput
            style={styles.input}
            placeholder="Task Title"
            value={taskTitle}
            onChangeText={setTaskTitle}
          />
          <TextInput
            style={[styles.input, { marginTop: 10 }]}
            placeholder="Task Description"
            value={taskDescription}
            onChangeText={setTaskDescription}
          />
          <TouchableOpacity style={styles.saveButton} onPress={editExistingTask}>
            <Text style={styles.saveButtonText}>Save</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.cancelButton}
            onPress={() => setIsEditModalVisible(false)}
          >
            <Text style={styles.cancelButtonText}>Cancel</Text>
          </TouchableOpacity>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    paddingTop: 50,
    paddingHorizontal: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  inputContainer: {
    marginBottom: 20,
  },
  input: {
    height: 40,
    borderColor: '#ddd',
    borderWidth: 1,
    marginBottom: 10,
    paddingHorizontal: 10,
    borderRadius: 5,
  },
  addButton: {
    backgroundColor: '#5C5CFF',
    padding: 10,
    borderRadius: 5,
    alignItems: 'center',
    marginTop: 10,
  },
  addButtonText: {
    color: 'white',
    fontSize: 16,
  },
  listContainer: {
    paddingBottom: 20,
  },
  taskContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
    borderBottomColor: '#ddd',
    borderBottomWidth: 1,
    backgroundColor: '#f9f9f9',
    borderRadius: 5,
    marginVertical: 5,
  },
  taskTitle: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  taskDescription: {
    fontSize: 14,
    color: '#666',
  },
  completedTaskText: {
    textDecorationLine: 'line-through',
    color: '#999',
  },
  taskActions: {
    flexDirection: 'row',
  },
  deleteButton: {
    backgroundColor: '#FF5C5C',
    padding: 5,
    borderRadius: 5,
    marginLeft: 10,
  },
  deleteButtonText: {
    color: 'white',
    fontSize: 14,
  },
  editButton: {
    backgroundColor: '#5CC85C',
    padding: 5,
    borderRadius: 5,
  },
  editButtonText: {
    color: 'white',
    fontSize: 14,
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    paddingHorizontal: 20,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 20,
    color: 'white',
    textAlign: 'center',
  },
  saveButton: {
    backgroundColor: '#5CC85C',
    padding: 10,
    borderRadius: 5,
    alignItems: 'center',
    marginTop: 10,
  },
  saveButtonText: {
    color: 'white',
    fontSize: 16,
  },
  cancelButton: {
    backgroundColor: '#FF5C5C',
    padding: 10,
    borderRadius: 5,
    alignItems: 'center',
    marginTop: 10,
  },
  cancelButtonText: {
    color: 'white',
    fontSize: 16,
  },
});
