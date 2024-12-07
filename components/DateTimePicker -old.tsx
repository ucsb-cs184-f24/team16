import React from 'react';
import {Platform, Text, StyleSheet, TextInput, View, TouchableOpacity} from 'react-native';
import {Overlay, Header} from 'react-native-elements';
import DateTimePicker from '@react-native-community/datetimepicker';
import moment from "moment";

export interface IProps {
  date?: string;
  placeholder?: string;
  onChange: (date: Date) => void;
}

export interface IState {
  dateString: string;
  date: Date;
  show: boolean;
}



class CustomDatePicker extends React.Component<IProps, IState> {
  state = {
    dateString: moment(new Date()).format('YYYY-MM-DD'),
    timeString: moment(new Date()).format('HH:mm'),
    date: this.props.date ? new Date(this.props.date) : new Date(),
    show: false
  };

  // onChange = (event: any, selectedDate: Date | undefined) => {
  //   if (selectedDate) {
  //     this.setState({
  //       dateString: moment(selectedDate).format('YYYY-MM-DD'),
  //       date: selectedDate
  //     });
  //     this.props.onChange(selectedDate);
  //   }
  // }

  onChange = (event: any, selectedDate: Date | undefined) => {
    if (selectedDate) {
      if (this.state.mode === 'date') {
        this.setState({
          dateString: moment(selectedDate).format('YYYY-MM-DD'),
          date: selectedDate,
        });
      } else {
        this.setState({
          timeString: moment(selectedDate).format('HH:mm'), // Store time string
        });
      }
      this.props.onChange(selectedDate);
    }
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

 // Update timepicker to set mode to 'time'
  timepicker = () => {
  this.setState({ 
    show: true,
    mode: 'time', // Set mode to time
  });
}

  showOverlay = () => {
    this.setState({ show: true}) 
  }

  hideOverlay = () => {
    this.setState({ show: false}) 
  }

  render() {
    const { show, date, mode } = this.state;
    
    return (
      <View style={{ flex: 1, borderRadius: 100}}> 
         <TouchableOpacity onPress={this.datepicker} style={styles.inputContainerStyle}>
            <Text style={styles.buttonText}>Date Picker</Text>
          </TouchableOpacity>

          <TouchableOpacity style={[styles.button, styles.blueButton]} onPress={this.timepicker}>
            <Text style={styles.buttonText}>Time Picker</Text>
          </TouchableOpacity>

        {Platform.OS === 'ios' ? (
          <Overlay isVisible={this.state.show} onBackdropPress={this.hideOverlay} overlayStyle={styles.overlayStyle}>
            <View style={styles.headerStyle}>
              <TouchableOpacity onPress={this.hideOverlay}>
                <Text style={{ paddingHorizontal: 15 }}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={this.hideOverlay}>
                <Text style={{ paddingHorizontal: 15, color: 'green' }}>Done</Text>
              </TouchableOpacity>
            </View>
            <DateTimePicker
              value={this.state.date}
              mode={'date'}
              is24Hour={true}
              display="default"
              onChange={this.onChange}
              style={{ backgroundColor: 'white' }}
            />
          </Overlay>
        ) : (
          <>
            {this.state.show && 
            <DateTimePicker
              value={this.state.date}
              mode={'date'}
              is24Hour={true}
              display="default"
              onChange={this.onChange}
              style={{ backgroundColor: 'white' }}
            />
            }
          </>
        )}
      </View>
    );
  } 
};

export default CustomDatePicker;
const styles = StyleSheet.create({
  overlayStyle: {
    flex: 1, 
    width: '100%', 
    justifyContent: 'flex-end',  
    backgroundColor: '#00000066',
  },
  inputContainerStyle: {
    alignItems: 'flex-start',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#98b6ed',
    borderRadius: 5,
    marginVertical: 5,
    marginHorizontal: 10,
    paddingRight: 10,
    height: 30,
    backgroundColor: '#6997db',
  },
  headerStyle: {
    backgroundColor: 'white', 
    borderTopLeftRadius: 10, 
    borderTopRightRadius: 10,  
    borderColor: '#CDCDCD', 
    borderBottomWidth: 1, 
    height: 50, 
    justifyContent: 'space-between', 
    alignItems: 'center', 
    flexDirection: 'row', 
  },
  placeholderStyle: {
    fontFamily: 'Gill Sans',
    fontSize: 16,
    color: '#CDCDCD',
    marginHorizontal: 10,
  },
  textStyle: {
    fontFamily: 'Gill Sans',
    fontSize: 12,
    color:'white',
    marginHorizontal: 10,
  },
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
})