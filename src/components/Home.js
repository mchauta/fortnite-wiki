/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 * @flow
 */

import React, { Component } from 'react';
import {
  StyleSheet,
  Text,
  View,
  Button,
  FlatList,
  TouchableOpacity,
  Image,
  LayoutAnimation
} from 'react-native';
import ajax from '../ajax';
import SearchBar from './SearchBar';


export default class Home extends Component<{}> {
  state = {
    categories: [],
    searchResults: [],
    timeout: false,
  };

  //remove any object with wordcount less than 10, this removes redirect pages.
 removeFromObject = (object) => {
   var i;
   i = object.length;
   while (i--) {
     if (object[i].wordcount < 10) {
       //if wordcount is less than ten remove from the search results
       object.splice(i, 1);
     }
   }
   return object;

 }

//render retry button after timeout
renderRetry = () => {
  if (this.state.timeout == true) {
    return (
      <View>
        <Text style={{textAlign: 'center', padding: 10}}>Connection Failed</Text>
        <Button
          onPress={ () => {this.retryConnection();} }
          title='Retry'>
        </Button>
      </View>
    );
  }
}

//timeout after 5 seconds
  checkConnection = () => {
    setTimeout(()=> {
      this.setState({ timeout: true });
    }, 5000);
  }

  searchWiki = async (searchTerm) => {

    if (searchTerm) {
      const searchData = await ajax.fetchSearchResults(searchTerm);
      const searchDataParsed =  this.removeFromObject(searchData.query.search);
      this.setState({ searchResults: searchDataParsed });
      LayoutAnimation.configureNext(LayoutAnimation.Presets.linear);
    } else {
      this.setState({searchResults: []});
    }
  }




  static navigationOptions = {
    title: 'Stardew Valley Mobile Wiki',
  }
  async retryConnection() {
    const catData = await ajax.fetchCategories ();
    //console.log(catData, 'catData');
    this.setState({ categories: catData.query.pages[4].links });
    LayoutAnimation.configureNext(LayoutAnimation.Presets.linear);
    //console.log(this.state.categories, 'categories');
    this.setState({ timeout: false });
  }

  async componentDidMount() {
    const catData = await ajax.fetchCategories ();
    //console.log(catData, 'catData');
    this.setState({ categories: catData.query.pages[4].links });
    // console.log(this.state.categories, 'categories');

  }
  render() {
    const { navigate } = this.props.navigation;
    const resultsToDisplay = this.state.searchResults.length > 0
      ? this.state.searchResults
      : this.state.categories;

    if (resultsToDisplay && this.state.categories.length !== 0) {

      return(
        <View style={styles.container}>
          <View style={styles.head}>
            <Image
              style={styles.welcomeImg}
              source={require('../img/Cat.gif')}
            />
            <SearchBar searchWiki={this.searchWiki}/>
          </View>
          <View style={styles.listContainer}>
            <FlatList
              data={resultsToDisplay}
              renderItem={({item}) =>
                <TouchableOpacity onPress={() => navigate('SingleCat', {pageName: item.title})}>
                  <Text style={styles.listItem}>{item.title}</Text>
                </TouchableOpacity>
              }
              keyExtractor={(item) => item.title}
            />
          </View>
        </View>
      );
    } else {
      //if categories is empty show the connection message/ timeout after 5 seconds
      return (
        <View style={styles.welcomeContainer}>
          <View style={styles.welcome}>
            <Text style={{fontSize: 16}}>Connecting to Stardew Valley Wiki...</Text>
            { this.checkConnection() }
            { this.renderRetry() }
          </View>
        </View>
      );
    }
  }
}

const styles = StyleSheet.create({
  listContainer: {
    flex: 3,
    width: '100%',
    paddingLeft: 15,
    paddingRight: 15,
    backgroundColor: '#F5FCFF',
  },
  head: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
    padding: 15,
  },
  container: {
    flex: 1,
    justifyContent: 'flex-start',
    backgroundColor: 'white',
    //alignItems: 'center',
    //width: '100%',

  },
  welcome: {
    flex: 1,
    justifyContent: 'center',

  },
  listItem: {
    flex: 1,
    textAlign: 'center',
    margin: 5,
    backgroundColor: '#0076FF',
    padding: 5,
    overflow: 'hidden',
    fontSize: 18,
    color: 'white',
  },
  welcomeContainer: {
    flex: 1,
    justifyContent: 'center',
    backgroundColor: 'white',
    //width: '100%',
    alignItems: 'center',

  },
  welcomeImg: {
    justifyContent: 'flex-start',
    flex: 1,
  }
});
