import {useEffect, useState} from 'react';
import {FlatList, StyleSheet, Text, View} from 'react-native';
import {getQuarters} from "@/helpers/firebase";
import {Quarters} from "@/types";
import dayjs from "dayjs";
import customParseFormat from "dayjs/plugin/customParseFormat";
import useFirebaseFunction from "@/hooks/useFirebaseFunction";

dayjs.extend(customParseFormat);

interface QuarterState {
  Year: string;
  Category: string;
  ClassState: string;
  PassState: string;
}

const parseQuarterData = (quarters: Quarters): QuarterState => {
  const currentDate = dayjs();

  const firstDayOfClasses = dayjs(quarters.current.firstDayOfClasses);
  const lastDayOfClasses = dayjs(quarters.current.lastDayOfClasses);
  const firstDayOfFinals = dayjs(quarters.current.firstDayOfFinals);
  const lastDayOfFinals = dayjs(quarters.current.lastDayOfFinals);
  const pass1Begin = dayjs(quarters.next.pass1Begin);
  const pass2Begin = dayjs(quarters.next.pass2Begin);
  const pass3Begin = dayjs(quarters.next.pass3Begin);
  const lastDay2Add = dayjs(quarters.next.lastDayToAddUnderGrad);

  let classState: string = "Not in Class";
  let passState: string = "No pass info"

  if (currentDate >= firstDayOfClasses && currentDate <= lastDayOfClasses) {
    classState = "Taking Class";
  } else if (currentDate >= firstDayOfFinals && currentDate <= lastDayOfFinals) {
    classState = "Taking Finals";
  }

  if (currentDate >= pass1Begin && currentDate <= pass2Begin) {
    passState = "You are at Pass 1";
  } else if (currentDate >= pass2Begin && currentDate <= pass3Begin) {
    passState = "You are at Pass 2";
  } else if (currentDate >= pass3Begin && currentDate <= lastDay2Add) {
    passState = "You are at Pass 3";
  } else {
    passState = "You are not in any passes";
  }

  return {
    Year: quarters.current.academicYear,
    Category: quarters.current.category,
    ClassState: classState,
    PassState: passState
  };
};

export default function QuarterScreen() {

  const [quarterState, setQuarterState] = useState<QuarterState | null>(null);
  const quarters = useFirebaseFunction({
    cache: {
      key: "quarters",
      duration: {days: 1}
    },
    callable: getQuarters,
    params: null,
  });
  useEffect(() => {
    if (quarters) {
      setQuarterState(parseQuarterData(quarters));
    }
  }, [quarters]);

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
            renderItem={({item}) => (
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
