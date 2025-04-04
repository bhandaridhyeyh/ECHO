import { useNavigation } from '@react-navigation/native';
import * as React from 'react';
import { View, Text, StyleSheet, SafeAreaView, Image, Pressable, TextInput, Dimensions } from 'react-native';
import { TabView, SceneMap, TabBar } from 'react-native-tab-view';
import { useWindowDimensions } from 'react-native';

const BuyingChats = () => {
  const navigation = useNavigation();
  const screenWidth = Dimensions.get('window').width;

  return (
    <SafeAreaView style={{ backgroundColor: 'white', flex: 1 }}>
      <Text style={styles.heading}>Chats</Text>
      <View style={styles.header}>
        <Pressable style={{ width: '100%', alignItems: 'center' }}>
          <View style={[styles.searchbar, { width: screenWidth * 0.9 }]}>
            <Image source={require('../assets/icons/icons8-search-24.png')} style={styles.searchIcon} />
            <TextInput placeholder='Search from your chats' placeholderTextColor={"#555"} style={[styles.searchInput, { width: '85%' }]} />
          </View>
        </Pressable>
      </View>
      <View style={styles.details}>
        <Pressable onPress={() => navigation.navigate('Conversation')}>
          <View style={[styles.chat, { width: screenWidth * 0.95 }]}>
            <Image source={require('../assets/icons/icons8-male-user-50.png')} style={styles.chatImage} />
            <Text style={[styles.chatText, { width: '60%' }]}>
              <Text style={styles.boldText}>Namrata Kaur</Text>
              {'\n'}
              <Text>SY - BBA</Text>
            </Text>
            <Text style={styles.chatTime}>07/10/24</Text>
          </View>
        </Pressable>
        <View style={[styles.separator, { width: screenWidth * 0.9 }]} />
        <Pressable onPress={() => navigation.navigate('Conversation')}>
          <View style={[styles.chat, { width: screenWidth * 0.95 }]}>
            <Image source={require('../assets/icons/icons8-male-user-50.png')} style={styles.chatImage} />
            <Text style={[styles.chatText, { width: '60%' }]}>
              <Text style={styles.boldText}>Ishita Amin</Text>
              {'\n'}
              <Text>TY - B.Tech CSE</Text>
            </Text>
            <Text style={styles.chatTime}>05/10/24</Text>
          </View>
        </Pressable>
        <View style={[styles.separator, { width: screenWidth * 0.9 }]} />
        <Pressable onPress={() => navigation.navigate('Conversation')}>
          <View style={[styles.chat, { width: screenWidth * 0.95 }]}>
            <Image source={require('../assets/icons/icons8-male-user-50.png')} style={styles.chatImage} />
            <Text style={[styles.chatText, { width: '60%' }]}>
              <Text style={styles.boldText}>Sandra Maria Wilson</Text>
              {'\n'}
              <Text>TY - B.Sc Data Science</Text>
            </Text>
            <Text style={styles.chatTime}>30/09/24</Text>
          </View>
        </Pressable>
      </View>
    </SafeAreaView>
  );
};

const SellingChats = () => {
  const navigation = useNavigation();
  const screenWidth = Dimensions.get('window').width;

  return (
    <View style={styles.scene}>
      <Image style={[styles.noChatImage, { width: screenWidth * 0.9, height: screenWidth * 0.9 * (180 / 370), marginVertical: '5%' }]} source={require('../assets/images/noChat.png')} resizeMode="contain" />
      <Text style={styles.noChatText}>You've got no messages so far!</Text>
      <Pressable style={styles.post} onPress={() => navigation.navigate('Sell')}>
        <Text style={styles.postText}>Start Selling</Text>
      </Pressable>
    </View>
  );
};

// Scene map for TabView
const renderScene = SceneMap({
  buying: BuyingChats,
  selling: SellingChats,
});

const renderTabBar = (props) => (
  <TabBar
    {...props}
    indicatorStyle={styles.indicator}
    style={styles.tabBar}
    labelStyle={styles.label}
    activeColor="#fff"
    inactiveColor="#fff"
  />
);

export default function ChatTabs() {
  const screenWidth = Dimensions.get('window').width;
  const [index, setIndex] = React.useState(0); // Current tab index
  const [routes] = React.useState([
    { key: 'buying', title: 'Buying' },
    { key: 'selling', title: 'Selling' },
  ]);

  return (
    <TabView
      navigationState={{ index, routes }}
      renderScene={renderScene}
      onIndexChange={setIndex}
      initialLayout={{ width: screenWidth }}
      renderTabBar={renderTabBar}
    />
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: 'white',
  },
  scene: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'white'
  },
  heading: {
    color: 'black',
    textAlign: 'center',
    fontSize: 30,
    marginVertical: '5%'
  },
  details: {
    flexDirection: 'column',
    marginTop: '0.5%',
    alignSelf: 'center',
    width: '95%',
    flexGrow: 1,
  },
  tabBar: {
    backgroundColor: '#350f55',
    elevation: 10
  },
  label: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  indicator: {
    backgroundColor: '#fff',
    height: 5,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: '5%',
    marginBottom: '5%'
  },
  searchbar: {
    backgroundColor: '#fff',
    borderRadius: 10,
    zIndex: 1,
    elevation: 4,
    paddingHorizontal: '2.5%',
    flexDirection: 'row',
    alignItems: 'center',
    gap: '2%',
    paddingVertical: '1%',
  },
  searchIcon: {
    width: 24,
    height: 24,
    resizeMode: 'contain',
  },
  searchInput: {
    fontSize: 17,
    color: 'black',
    flex: 1,
  },
  chat: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: '2%',
    paddingVertical: '3%',
    backgroundColor: 'white',
    alignSelf: 'center',
  },
  chatImage: {
    width: 50,
    height: 50,
    borderRadius: 25,
    resizeMode: 'contain',
  },
  chatText: {
    color: 'black',
    fontSize: 17,
  },
  boldText: {
    fontWeight: 'bold',
  },
  chatTime: {
    color: 'grey',
    fontSize: 14,
    marginLeft: 'auto',
  },
  separator: {
    height: 0.5,
    backgroundColor: "grey",
    alignSelf: 'center',
    marginTop: '2%',
    marginBottom: '2%',
  },
  noChatImage: {
    marginVertical: '5%',
    resizeMode: 'contain',
  },
  noChatText: {
    color: 'grey',
    fontWeight: 'bold',
    fontSize: 20,
    textAlign: 'center',
    paddingHorizontal: '5%',
  },
  post: {
    alignSelf: 'center',
    backgroundColor: "#5D4F00",
    width: '60%',
    marginTop: '7.5%',
    height: 'auto',
    elevation: 3,
    padding: '3%',
    borderRadius: 10,
  },
  postText: {
    fontSize: 18,
    color: 'white',
    textAlign: 'center',
  },
});
