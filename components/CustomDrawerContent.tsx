import {useState} from 'react';
import {StyleSheet, Text, TouchableOpacity, View} from 'react-native';
import CheckBox from '@react-native-community/checkbox';
import {Ionicons} from '@expo/vector-icons'; // For icons like hamburger and plus
import {router} from 'expo-router';
import type {Credentials} from "@/types/firebase";
import useValue from '@/hooks/useValue';
import {setValue} from "@/helpers/storage";

export default function CustomDrawerContent() {

  const [getCredentials] = useValue<Credentials>("credentials");
  const [getCoursesFilter, setCoursesFilter] = useValue<boolean>("courses filter");
  const [getCanvasFilter, setCanvasFilter] = useValue<boolean>("canvas filter");
  const [getGradescopeFilter, setGradescopeFilter] = useValue<boolean>("gradescope filter");
  const [getCustomFilter, setCustomFilter] = useValue<boolean>("custom filter");
  const [isExpanded, setIsExpanded] = useState(false); // To toggle the filter section

  return (
    <View style={styles.container}>
      <Text style={styles.username}>{getCredentials()?.username ?? ""}</Text>

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
        {isExpanded ? (
          <View style={styles.filterOptions}>
            {([
              {
                label: 'Courses',
                key: 'courses',
                getter: getCoursesFilter,
                setter: setCoursesFilter,
              },
              {
                label: 'Canvas Events',
                key: 'canvasEvents',
                getter: getCanvasFilter,
                setter: setCanvasFilter,
              },
              {
                label: 'Gradescope Events',
                key: 'gradescopeEvents',
                getter: getGradescopeFilter,
                setter: setGradescopeFilter,
              },
              {
                label: 'My Events',
                key: 'myEvents',
                getter: getCustomFilter,
                setter: setCustomFilter,
              },
            ]).map(({label, key, getter, setter}) => (
              <TouchableOpacity
                  key={key}
                style={styles.filterRow}
                  onPress={() => setter(!getter())}
              >
                <CheckBox
                    value={getter(false)}
                    onValueChange={() => setter(!getter(false))}
                />
                <Text style={styles.filterText}>{label}</Text>
              </TouchableOpacity>
            ))}
          </View>
        ) : null}
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
      <TouchableOpacity onPress={() => {
        console.log("Logging out...");
        setValue<Credentials>("credentials", null);
      }}>
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
