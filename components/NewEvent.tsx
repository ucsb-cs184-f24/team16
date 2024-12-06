import {useGlobalSearchParams} from "expo-router";
import ParallaxScrollView from "@/components/ParallaxScrollView";
import {ThemedView} from "@/components/ThemedView";
import {ThemedText} from "@/components/ThemedText";
import React, { useState } from 'react';
import { Modal, View, Text, TextInput, Button, StyleSheet, TouchableOpacity } from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { Ionicons } from "@expo/vector-icons";
import CustomDatePicker from "@/components/DateTimePicker"

interface AddEventModalProps {
  visible: boolean;
  onClose: () => void;
  onAddEvent: (title: string, start: string, end: string, summary: string) => void;
}

const AddEventModal: React.FC<AddEventModalProps> = ({ visible, onClose, onAddEvent }) => {
  const [title, setTitle] = useState('');
  // format: YYYY-MM-DD HH:mm:ss
  const [start, setStart] = useState('');
  const [end, setEnd] = useState('');
  const [summary, setSummary] = useState('');

  const [date, setDate] = useState(new Date(1598051730000));

  const onChange = (event, selectedDate) => {
    const currentDate = selectedDate;
    console.log(selectedDate);
    setDate(currentDate);
  };

  const handleAddEvent = () => {
    onAddEvent(title, start, end, summary);
    onClose();
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={onClose}
    >
      <View style={styles.modalContainer}>
        <View style={styles.modalContent}>
          <Text style={styles.modalTitle}>Add New Event</Text>

          <Text style={styles.eventTitle}>Event Title:</Text>
          <TextInput
            placeholder="Title"
            value={title}
            onChangeText={setTitle}
            style={styles.input}
          />
{/* 
        <Text style={styles.eventTitle}>Start Time:</Text>
          <TextInput
            placeholder="YYYY-MM-DD HH:mm:ss"
            value={start}
            onChangeText={setStart}
            style={styles.input}
          />

        <Text style={styles.eventTitle}>End Time:</Text>
          <TextInput
            placeholder="YYYY-MM-DD HH:mm:ss"
            value={end}
            onChangeText={setEnd}
            style={styles.input}
          /> */}
          
          {/* Set time using a time picker */}
          <View style={styles.datePickerContainer}>
            <Text>Start Time</Text>
            <CustomDatePicker
              date={start} // Pass the Date object here
              onChange={(selectedDate) => setStart(selectedDate)} // keep as Date
            />
            
          </View>

          <View style={styles.datePickerContainer}>
          <Text>End Time</Text>
            <CustomDatePicker
              date={start} // Pass the Date object here
              onChange={(selectedDate) => setStart(selectedDate)} // keep as Date
            />
          </View>

          <TextInput
            placeholder="Summary"
            value={summary}
            onChangeText={setSummary}
            style={styles.input}
          />

          <View style={styles.innerContainer}>
            <TouchableOpacity style={styles.button1} onPress={handleAddEvent}>
              <Text style={styles.buttonText}>Add</Text>
            </TouchableOpacity>
            
            <TouchableOpacity style={styles.button2} onPress={onClose}>
              <Text style={styles.buttonText}>Cancel</Text>      
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({

  button1: {
    backgroundColor: '#6997db', // Customize the button color
    borderRadius: 8,
    paddingVertical: 6, // Adjust for smaller height
    paddingHorizontal: 15, // Adjust for smaller width
    alignSelf: 'flex-start', // Adjust size to fit content
  },

  button2: {
    backgroundColor: '#fa7373', // Customize the button color
    borderRadius: 8,
    paddingVertical: 6, // Adjust for smaller height
    paddingHorizontal: 10, // Adjust for smaller width
    alignSelf: 'flex-end', 
  },

  innerContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 20,
  },
  buttonText: {
    color: 'white',
    fontSize: 14, // Smaller font size
    marginLeft: 6,
    alignItems: 'center',
  },

  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },

  modalContent: {
    width: 300,
    padding: 20,
    backgroundColor: 'white',
    borderRadius: 10,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginTop: 20,
    marginBottom: 10,
    textAlign: 'center',
  },

  eventTitle:{
    fontSize: 14,
    marginTop: 10,
    marginBottom: 10,
    textAlign: 'left',
  },
  input: {
    borderBottomWidth: 1,
    marginBottom: 10,
    color: '#4f4e4e',
    padding: 5,
  },
  
  datePickerContainer: {
    marginVertical: 30,
    width: '50%',
  },
});

export default AddEventModal;


