import React, {useState} from 'react';
import {StyleSheet, Text, TouchableOpacity, View} from 'react-native';
import CheckBox from '@react-native-community/checkbox';
import {Ionicons} from '@expo/vector-icons'; // For icons like hamburger and plus
import createIcs from "@/helpers/create-ics";
import RNShare from "react-native-share";


export default function ExportScreen() {

    const [isExpanded, setIsExpanded] = useState(false); // To toggle the filter section
    const [selectedFilters, setSelectedFilters] = useState<SelectedFilters>({
      courses: false,
      canvasEvents: false,
      gradescopeEvents: false,
      myEvents: false,
    });
  
    const toggleFilter = (filterKey: keyof SelectedFilters) => {
      setSelectedFilters((prev) => ({
        ...prev,
        [filterKey]: !prev[filterKey],
      }));
    };
  
    return (
      <View style={styles.container}>
        <Text style={styles.username}>Select Items</Text>
  
        {/* Divider */}
        <View style={styles.divider} />
  
        {/* Filters */}
        <View>
          <View style={styles.row}>
            <View style={styles.leftSection}>
              <Ionicons name="funnel-outline" size={26} color="black" />
              <Text style={styles.text}>Filter</Text>
            </View>
            {/* <TouchableOpacity onPress={() => setIsExpanded(!isExpanded)}>
              <Ionicons
                name={isExpanded ? 'chevron-up-outline' : 'chevron-down-outline'}
                size={26}
                color="black"
              />
            </TouchableOpacity> */}
          </View>
  
          {/* Expanded Filter Options */}
            <View style={styles.filterOptions}>
              {([
                { label: 'Courses', key: 'courses' },
                { label: 'Canvas Events', key: 'canvasEvents' },
                { label: 'Gradescope Events', key: 'gradescopeEvents' },
                { label: 'My Events', key: 'myEvents' },
              ] as {
                label: string;
                key: keyof SelectedFilters;
              }[]).map((filter) => (
                <TouchableOpacity
                  key={filter.key}
                  style={styles.filterRow}
                  onPress={() => toggleFilter(filter.key)}
                >
                  <CheckBox
                    value={selectedFilters[filter.key]}
                    onValueChange={() => toggleFilter(filter.key)}
                  />
                  <Text style={styles.filterText}>{filter.label}</Text>
                </TouchableOpacity>
              ))}
            </View>
        </View>
  
        {/* Divider */}
        <View style={styles.divider} />

    
  
        {/* Export Calendar Button */}
        <TouchableOpacity style={styles.button} onPress={() => {
          RNShare.open({
            title: 'Share calendar',
            type: 'text/calendar',
            url: `data:text/calendar;base64,${btoa(createIcs())}`,
            showAppsToView: true,
          }).then(() => console.log("calendar exported"), e => console.error(e));
        }}>
        <View style={styles.innerContainer}>
            <Ionicons name="download-outline" size={20} color="white" />
            <Text style={styles.buttonText}>Export</Text>
        </View>
        </TouchableOpacity>
      </View>
    );
  }
  
  const styles = StyleSheet.create({
    button: {
        backgroundColor: '#6997db', // Customize the button color
        borderRadius: 8,
        paddingVertical: 6, // Adjust for smaller height
        paddingHorizontal: 10, // Adjust for smaller width
        alignSelf: 'center', // Adjust size to fit content
      },

      innerContainer: {
        flexDirection: 'row',
        alignItems: 'center',
      },
      buttonText: {
        color: 'white',
        fontSize: 14, // Smaller font size
        marginLeft: 6,
      },
    container: {
      flex: 1,
      paddingHorizontal: 20,
      paddingVertical: 30,
    },
    divider: {
      height: 1, // Thickness of the line
      backgroundColor: '#d3d3d3', // Light grey color
      marginTop: 15, // Space around the divider
      marginBottom: 15,
    },
    username: {
      fontSize: 18,
      fontWeight: 'bold',
      marginTop: 40,
    },
    row: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
    },
    leftSection: {
      flexDirection: 'row',
      alignItems: 'center',
    },
    text: {
      fontSize: 16,
      marginLeft: 8,
    },
    marginTop: {
      marginTop: 20,
    },
    filterOptions: {
      marginTop: 10,
      marginLeft: 34, // Align with the text "Filter"
    },
    filterRow: {
      flexDirection: 'row',
      alignItems: 'center',
      marginVertical: 5,
    },
    filterText: {
      fontSize: 16,
      marginLeft: 8,
    },
  });
  