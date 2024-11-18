import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  Text,
  TextInput,
  View,
  FlatList,
  TouchableOpacity,
  Animated,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface Task {
  id: string;
  text: string;
  completed: boolean;
  description?: string;
  animationValue?: Animated.Value;
}

export default function App() {
  const [task, setTask] = useState('');
  const [tasks, setTasks] = useState<Task[]>([]);
  const [editingTaskId, setEditingTaskId] = useState<string | null>(null);
  const [editingTaskText, setEditingTaskText] = useState('');
  const [editingTaskDescription, setEditingTaskDescription] = useState('');

  // Load tasks from AsyncStorage when the app starts
  useEffect(() => {
    const loadTasks = async () => {
      try {
        const storedTasks = await AsyncStorage.getItem('tasks');
        if (storedTasks) {
          setTasks(
            JSON.parse(storedTasks).map((task: Task) => ({
              ...task,
              animationValue: new Animated.Value(1), // Initialize animation value
            }))
          );
        }
      } catch (error) {
        console.error('Error loading tasks', error);
      }
    };

    loadTasks();
  }, []);

  // Save tasks to AsyncStorage whenever the tasks array changes
  useEffect(() => {
    const saveTasks = async () => {
      try {
        await AsyncStorage.setItem('tasks', JSON.stringify(tasks));
      } catch (error) {
        console.error('Error saving tasks', error);
      }
    };

    saveTasks();
  }, [tasks]);

  // Add a new task with fade-in animation
  const addTask = () => {
    if (task.trim()) {
      const newTask: Task = {
        id: Date.now().toString(),
        text: task,
        completed: false,
        description: '',
        animationValue: new Animated.Value(0), // Start with opacity 0
      };
      setTasks([...tasks, newTask]);
      setTask('');

      // Trigger fade-in animation
      Animated.timing(newTask.animationValue!, {
        toValue: 1,
        duration: 500,
        useNativeDriver: true,
      }).start();
    }
  };

  // Toggle task completion status
  const toggleTaskCompletion = (taskId: string) => {
    setTasks((prevTasks) =>
      prevTasks.map((task) =>
        task.id === taskId
          ? { ...task, completed: !task.completed }
          : task
      )
    );
  };

  // Start editing a task
  const startEditingTask = (taskId: string, taskText: string, taskDescription: string) => {
    setEditingTaskId(taskId);
    setEditingTaskText(taskText);
    setEditingTaskDescription(taskDescription);
  };

  // Cancel editing a task
  const cancelEditing = () => {
    setEditingTaskId(null);
    setEditingTaskText('');
    setEditingTaskDescription('');
  };

  // Update a task
  const updateTask = () => {
    if (editingTaskId && editingTaskText.trim()) {
      setTasks((prevTasks) =>
        prevTasks.map((task) =>
          task.id === editingTaskId
            ? { ...task, text: editingTaskText, description: editingTaskDescription }
            : task
        )
      );
      setEditingTaskId(null);
      setEditingTaskText('');
      setEditingTaskDescription('');
    }
  };

  // Delete a task with swipe-out animation
  const deleteTask = (taskId: string) => {
    const taskToDelete = tasks.find((task) => task.id === taskId);

    if (taskToDelete) {
      Animated.timing(taskToDelete.animationValue!, {
        toValue: 0,
        duration: 500,
        useNativeDriver: true,
      }).start(() => {
        setTasks((prevTasks) => prevTasks.filter((task) => task.id !== taskId));
      });
    }
  };

  // Render each task
  const renderItem = ({ item }: { item: Task }) => (
    <Animated.View
  style={[
    styles.taskContainer,
    {
      opacity: item.animationValue,
      transform: [{ scale: item.animationValue as Animated.AnimatedInterpolation<number> }],
    },
  ]}
>

      {editingTaskId === item.id ? (
        <>
          <TextInput
            style={styles.editInput}
            value={editingTaskText}
            onChangeText={setEditingTaskText}
            placeholder="Edit task title"
          />
          <TextInput
            style={styles.editInput}
            value={editingTaskDescription}
            onChangeText={setEditingTaskDescription}
            placeholder="Edit task description"
          />
          <TouchableOpacity style={styles.saveButton} onPress={updateTask}>
            <Text style={styles.saveButtonText}>Save</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.cancelButton} onPress={cancelEditing}>
            <Text style={styles.cancelButtonText}>Cancel</Text>
          </TouchableOpacity>
        </>
      ) : (
        <>
          <Text
            style={[
              styles.taskText,
              item.completed && styles.completedTaskText,
            ]}
            onPress={() => toggleTaskCompletion(item.id)}
          >
            {item.text}
          </Text>
          {item.description && (
            <Text style={styles.taskDescription}>{item.description}</Text>
          )}
          <TouchableOpacity
            style={styles.editButton}
            onPress={() => startEditingTask(item.id, item.text, item.description || '')}
          >
            <Text style={styles.editButtonText}>Edit</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => deleteTask(item.id)}>
            <Text style={styles.deleteButton}>X</Text>
          </TouchableOpacity>
        </>
      )}
    </Animated.View>
  );
  

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Simple To-Do List</Text>

      {/* Input container */}
      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          placeholder="Add a new task"
          value={task}
          onChangeText={setTask}
        />
        <TouchableOpacity style={styles.addButton} onPress={addTask}>
          <Text style={styles.addButtonText}>+</Text>
        </TouchableOpacity>
      </View>

      {/* List of tasks */}
      <FlatList
        data={tasks}
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
      />
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
    color: '#333',
    marginBottom: 20,
  },
  inputContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  input: {
    flex: 1,
    height: 40,
    borderColor: '#ddd',
    borderWidth: 1,
    paddingHorizontal: 10,
    borderRadius: 5,
  },
  addButton: {
    backgroundColor: '#5C5CFF',
    height: 40,
    width: 40,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 20,
    marginLeft: 10,
  },
  addButtonText: {
    color: 'white',
    fontSize: 24,
    fontWeight: 'bold',
  },
  taskContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 10,
    borderBottomColor: '#ddd',
    borderBottomWidth: 1,
  },
  taskText: {
    fontSize: 16,
    color: '#333',
  },
  completedTaskText: {
    textDecorationLine: 'line-through',
    color: '#888',
  },
  taskDescription: {
    fontSize: 14,
    color: '#555',
  },
  editInput: {
    flex: 1,
    height: 40,
    borderColor: '#ddd',
    borderWidth: 1,
    paddingHorizontal: 10,
    borderRadius: 5,
    marginBottom: 10,
  },
  saveButton: {
    backgroundColor: '#4CAF50',
    padding: 10,
    borderRadius: 5,
    marginRight: 10,
  },
  saveButtonText: {
    color: '#fff',
  },
  cancelButton: {
    backgroundColor: '#FF5722',
    padding: 10,
    borderRadius: 5,
  },
  cancelButtonText: {
    color: '#fff',
  },
  editButton: {
    backgroundColor: '#FFC107',
    padding: 5,
    borderRadius: 5,
    marginLeft: 10,
  },
  editButtonText: {
    color: '#fff',
  },
  deleteButton: {
    color: '#FF5C5C',
    fontWeight: 'bold',
    fontSize: 18,
  },
});
