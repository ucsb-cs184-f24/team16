import React, {useState} from 'react';
import {StyleSheet, Text, TouchableOpacity, View} from 'react-native';
import CheckBox from '@react-native-community/checkbox';
import {Ionicons} from '@expo/vector-icons'; // For icons like hamburger and plus
import {router} from 'expo-router';

interface SelectedFilters {
  courses: boolean;
  canvasEvents: boolean;
  gradescopeEvents: boolean;
  myEvents: boolean;
}

export default function CustomDrawerContent() {

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
      <Text style={styles.username}>"Username"</Text>

      {/* Divider */}
      <View style={styles.divider} />

      {/* Filters */}
      <View>
        <View style={styles.row}>
          <View style={styles.leftSection}>
            <Ionicons name="funnel-outline" size={26} color="black" />
            <Text style={styles.text}>Filter</Text>
          </View>
          <TouchableOpacity onPress={() => setIsExpanded(!isExpanded)}>
            <Ionicons
              name={isExpanded ? 'chevron-up-outline' : 'chevron-down-outline'}
              size={26}
              color="black"
            />
          </TouchableOpacity>
        </View>

        {/* Expanded Filter Options */}
        {isExpanded && (
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
        )}
      </View>

      {/* Divider */}
      <View style={styles.divider} />

      {/* Export Calendar */}
      <TouchableOpacity onPress={() => router.navigate({ pathname: '/export-screen' })}>
        <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 0 }}>
          <Ionicons name="download-outline" size={26} color="black" />
          <Text style={{ fontSize: 16, marginLeft: 8 }}>Export Calendar</Text>
        </View>
      </TouchableOpacity>

      {/* Quarter Info */}
      <TouchableOpacity onPress={() => router.navigate({ pathname: '/quarter-screen' })}>
        <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 20 }}>
          <Ionicons name="information-circle-outline" size={26} color="black" />
          <Text style={{ fontSize: 16, marginLeft: 8 }}>Quarter Info</Text>
        </View>
      </TouchableOpacity>

      {/* Log out */}
      <TouchableOpacity onPress={() => console.log("Logging out...")}>
        <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 20 }}>
          <Ionicons name="log-out-outline" size={26} color="black" />
          <Text style={{ fontSize: 16, marginLeft: 8 }}>Log out</Text>
        </View>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
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
    fontSize: 23,
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
