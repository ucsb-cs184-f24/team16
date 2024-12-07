import { useState } from "react";
import {
  Modal,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
} from "react-native";
import DateTimePicker from "@react-native-community/datetimepicker";

interface AddEventModalProps {
  visible: boolean;
  onClose: () => void;
  onAddEvent: (title: string, start: string, end: string, summary: string) => void;
}

const AddEventModal: React.FC<AddEventModalProps> = ({ visible, onClose, onAddEvent }) => {
  const [title, setTitle] = useState("");
  const [start, setStart] = useState(""); // Start date-time in string format
  const [end, setEnd] = useState(""); // End date-time in string format
  const [summary, setSummary] = useState("");

  const [pickerVisible, setPickerVisible] = useState(false);
  const [pickerMode, setPickerMode] = useState<"date" | "time">("date");
  const [currentField, setCurrentField] = useState<"start" | "end" | null>(null);
  const [tempDate, setTempDate] = useState<Date | null>(null); // Temporary Date object

  const formatDateTime = (date: Date): string => {
    // Format Date object to "YYYY-MM-DD HH:mm:ss"
    const pad = (num: number) => num.toString().padStart(2, "0");
    return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(
      date.getDate()
    )} ${pad(date.getHours())}:${pad(date.getMinutes())}:${pad(date.getSeconds())}`;
  };

  const showPicker = (field: "start" | "end", mode: "date" | "time") => {
    setCurrentField(field);
    setPickerMode(mode);

    // Initialize the picker with the current date or time for the selected field
    if (field === "start" && start) {
      setTempDate(new Date(start));
    } else if (field === "end" && end) {
      setTempDate(new Date(end));
    } else {
      setTempDate(new Date());
    }
    setPickerVisible(true);
  };

  const onPickerChange = (event: any, selectedDate: Date | undefined) => {
    if (selectedDate) {
      // Handle updating the temporary date based on picker mode
      const updatedDate = tempDate ? new Date(tempDate) : new Date();
      if (pickerMode === "date") {
        // Update only the date part
        updatedDate.setFullYear(selectedDate.getFullYear());
        updatedDate.setMonth(selectedDate.getMonth());
        updatedDate.setDate(selectedDate.getDate());
      } else if (pickerMode === "time") {
        // Update only the time part
        updatedDate.setHours(selectedDate.getHours());
        updatedDate.setMinutes(selectedDate.getMinutes());
        updatedDate.setSeconds(0);
      }

      // Update the corresponding field (start or end) with the formatted string
      const formattedDate = formatDateTime(updatedDate);
      if (currentField === "start") {
        setStart(formattedDate);
      } else if (currentField === "end") {
        setEnd(formattedDate);
      }
    }

    setPickerVisible(false); // Close the picker
  };

  const handleAddEvent = () => {
    onAddEvent(title, start, end, summary);
    onClose();
    resetFields(); // Reset fields when adding an event
  };

  const resetFields = () => {
    setTitle("");
    setStart("");
    setEnd("");
    setSummary("");
    setTempDate(null);
  };

  const handleClose = () => {
    resetFields(); // Reset fields when closing the modal
    onClose();
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={handleClose}
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

          <Text style={styles.eventTitle}>Start Time:</Text>
          <TouchableOpacity
            style={styles.datePickerButton}
            onPress={() => showPicker("start", "date")}
          >
            <Text style={styles.buttonText}>{start ? start.split(" ")[0] : "Pick Date"}</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.datePickerButton}
            onPress={() => showPicker("start", "time")}
          >
            <Text style={styles.buttonText}>{start ? start.split(" ")[1] : "Pick Time"}</Text>
          </TouchableOpacity>

          <Text style={styles.eventTitle}>End Time:</Text>
          <TouchableOpacity
            style={styles.datePickerButton}
            onPress={() => showPicker("end", "date")}
          >
            <Text style={styles.buttonText}>{end ? end.split(" ")[0] : "Pick Date"}</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.datePickerButton}
            onPress={() => showPicker("end", "time")}
          >
            <Text style={styles.buttonText}>{end ? end.split(" ")[1] : "Pick Time"}</Text>
          </TouchableOpacity>

          <Text style={styles.eventTitle}>Description:</Text>
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
            <TouchableOpacity style={styles.button2} onPress={handleClose}>
              <Text style={styles.buttonText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>

        {pickerVisible && (
          <DateTimePicker
            value={tempDate || new Date()}
            mode={pickerMode}
            is24Hour={true}
            display="default"
            onChange={onPickerChange}
          />
        )}
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
  modalContent: {
    width: 300,
    padding: 20,
    backgroundColor: "white",
    borderRadius: 10,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginTop: 20,
    marginBottom: 10,
    textAlign: "center",
  },
  eventTitle: {
    fontSize: 14,
    marginTop: 10,
    marginBottom: 10,
  },
  input: {
    borderBottomWidth: 1,
    marginBottom: 10,
    color: "#4f4e4e",
    padding: 5,
  },
  datePickerButton: {
    backgroundColor: "#6997db",
    paddingVertical: 10,
    paddingHorizontal: 15,
    borderRadius: 5,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 10,
  },
  buttonText: {
    color: "white",
    fontSize: 14,
    fontWeight: "bold",
  },
  innerContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 20,
  },
  button1: {
    backgroundColor: "#6997db",
    borderRadius: 8,
    paddingVertical: 6,
    paddingHorizontal: 15,
  },
  button2: {
    backgroundColor: "#fa7373",
    borderRadius: 8,
    paddingVertical: 6,
    paddingHorizontal: 10,
  },
});

export default AddEventModal;
