import React, {Component} from 'react';
import {View, Text, Button, Platform, TouchableOpacity} from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { StyleSheet } from 'react-native'; 

export default class App extends Component {
  state = {
    date: new Date('2020-06-12T14:42:42'),
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
          <TouchableOpacity style={[styles.button, styles.blueButton]} onPress={this.datepicker}>
            <Text style={styles.buttonText}>Date Picker</Text>
          </TouchableOpacity>

          <TouchableOpacity style={[styles.button, styles.blueButton]} onPress={this.timepicker}>
            <Text style={styles.buttonText}>Time Picker</Text>
          </TouchableOpacity>
        </View>

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
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    marginVertical: 10,
  },
  button: {
    flex: 1,
    padding: 10,
    marginHorizontal: 5,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 5,
  },
  blueButton: {
    backgroundColor: 'blue',
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
});