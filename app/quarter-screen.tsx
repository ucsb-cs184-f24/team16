import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet , FlatList, Alert} from 'react-native';
import {Index} from './index'
import {getCanvasEvents, getQuarter, getUCSBEvents, Quarter, UCSBEvents} from '@/helpers/api';
import { useLocalSearchParams } from 'expo-router';

type QuarterState = {
    Name: string;
    Year: string;
    Category: string;
    ClassState: string;
    PassState: string;
}

const parseQuarterData = (data: Record<string, any>, name: string): QuarterState => {

  const currentDate = new Date();

  const firstDayOfClasses = new Date(data.firstDayOfClasses);
  const lastDayOfClasses = new Date(data.lastDayOfClasses);
  const firstDayOfFinals = new Date(data.firstDayOfFinals);
  const lastDayOfFinals = new Date(data.lastDayOfFinals);
  const pass1Begin = new Date(data.pass1Begin);
  const pass2Begin = new Date(data.pass2Begin);
  const pass3Begin = new Date(data.pass3Begin);
  const lastDay2Add = new Date(data.lastDayToAddUnderGrad);

  let classState: string = "Not in Class";
  let passState: string = "No pass info";
  let uname: string = JSON.parse(name);


  if (currentDate >= firstDayOfClasses && currentDate <= lastDayOfClasses) {
    classState = "Taking Class";
  } else if (currentDate >= firstDayOfFinals && currentDate <= lastDayOfFinals) {
    classState = "Taking Finals";
  }

  if (currentDate >= pass1Begin && currentDate <= pass2Begin){
      passState = "You are at Pass 1";
  }else if(currentDate >= pass2Begin && currentDate <= pass3Begin){
      passState = "You are at Pass 2";
  }else if(currentDate >= pass3Begin && currentDate <= lastDay2Add){
      passState = "You are at Pass 3";
  }else{
      passState = "You are not in any passes";
  }

  return {
    Name: uname,
    Year: data.academicYear,
    Category: data.category,
    ClassState: classState,
    PassState: passState,
  };
};

const quarter_screen: React.FC = () => {

    const { name } = useLocalSearchParams();
    const decodedName = name ? JSON.parse(decodeURIComponent(name)) : null;

    const [quarterState, setQuarterState] = useState<QuarterState | null>(null);
    const [canvasEvents, setCanvasEvents] = useState<object | null>(null);

      useEffect(() => {
        const fetchQuarterData = async () => {
          try {
            const result = await getQuarter();
            const parsedData = parseQuarterData(result, name);
            setQuarterState(parsedData);
          } catch (error) {
            console.error(error);
            Alert.alert("Error", "Failed to fetch quarter data.");
          }
        };

        fetchQuarterData();
      }, []);

      if (!quarterState) {
        return (
          <View style={styles.container}>
            <Text style={styles.loadingText}>Loading...</Text>
          </View>
        );
      }

      return (
        <View style={styles.container}>
          <Text style={styles.title}>Quarter Information</Text>
          <FlatList
            data={Object.entries(quarterState)}
            keyExtractor={item => item[0]}
            renderItem={({ item }) => (
              <View style={styles.row}>
                <Text style={styles.cellTitle}>{item[0]}</Text>
                <Text style={styles.cellValue}>{item[1]}</Text>
              </View>
            )}
            contentContainerStyle={styles.listContent}
          />
        </View>
      );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#f9f9f9', // Light background color
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
    color: '#333', // Darker text color for better contrast
  },
  loadingText: {
    fontSize: 18,
    textAlign: 'center',
    marginTop: 20,
    color: '#666',
  },
  listContent: {
    paddingBottom: 20,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#ccc',
    backgroundColor: '#fff', // White background for each row
    borderRadius: 8,
    marginVertical: 5,
    elevation: 2, // Shadow effect for Android
    shadowColor: '#000', // Shadow color for iOS
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  cellTitle: {
    flex: 1,
    fontSize: 16,
    fontWeight: '600', // Slightly bolder for titles
    color: '#555', // Slightly lighter color for titles
  },
  cellValue: {
    flex: 1,
    fontSize: 16,
    color: '#333', // Darker color for values
    textAlign: 'right', // Align values to the right
  },
});

export default quarter_screen;