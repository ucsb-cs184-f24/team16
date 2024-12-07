import React, {Component} from 'react';
import {View, Text, Button, Platform, TouchableOpacity} from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { StyleSheet } from 'react-native'; 

export default class CustomDatePicker extends Component {
  state = {
    date: new Date(),
    mode: 'date',
    show: false,
  }

  setDate = (event, date) => {
    date = date || this.state.date;

    this.setState({
      show: Platform.OS === 'ios' ? true : false,
      date,
    });
  }

  show = mode => {
    this.setState({
      show: true,
      mode,
    });
  }

  datepicker = () => {
    this.show('date');
  }

  timepicker = () => {
    this.show('time');
  }

  render() {
  const { show, date, mode } = this.state;

  return (
    <View style={styles.container}>
      <View style={styles.buttonRow}>
      <TouchableOpacity onPress={this.datepicker} style={styles.inputContainerStyle}>
          <Text style={styles.buttonText}>Pick Date</Text>
        </TouchableOpacity>

        <TouchableOpacity onPress={this.timepicker} style={styles.inputContainerStyle}>
          <Text style={styles.buttonText}>Pick Time</Text>
        </TouchableOpacity>
      </View>

      {/* Display the selected date and time */}
      <Text style={styles.selectedDateText}>
        Selected {mode === 'date' ? 'Date' : 'Time'}: {date.toString()}
      </Text>

      {show && (
        <DateTimePicker
          value={date}
          mode={mode}
          is24Hour={true}
          display="default"
          onChange={this.setDate}
        />
      )}
    </View>
  );
}

}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#f8f9fa', // Optional for better contrast
  },
  buttonRow: {
    flexDirection: 'row', // Place buttons in a row
    justifyContent: 'space-between', // Space between the buttons
    alignItems: 'center',
    width: '100%', // Adjust width for proper alignment
    marginVertical: 10,
  },
  selectedDateText: {
    marginTop: 20,
    fontSize: 16,
    color: '#333',
    textAlign: 'center',
  },
  button: {
    flex: 1, // Ensure buttons are of equal size
    marginHorizontal: 5, // Add spacing between buttons
    paddingVertical: 10, // Add padding for better touch target
    borderRadius: 8, // Rounded corners
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#6997db',
  },
  blueButton: {
    backgroundColor: '#6997db', // Blue button background
  },
  innerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  buttonText: {
    alignSelf: 'center',
    color: 'white', // Text color
    fontSize: 10, // Increase font size for readability
    marginLeft: 10,
    fontWeight: 'bold',
  },
  inputContainerStyle: {
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#98b6ed',
    borderRadius: 5,
    marginVertical: 5,
    marginHorizontal: 5,
    paddingRight: 20,
    height: 30,
    backgroundColor: '#6997db',
  },
});
