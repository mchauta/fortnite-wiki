import React from 'react';
import {
  Linking,
  StyleSheet,
  Text,
  View,
  ScrollView, 
  TouchableOpacity,
  Dimensions,
  FlatList,
  LayoutAnimation,
  ActivityIndicator,
} from 'react-native';
import ajax from '../ajax';
import HTML from 'react-native-render-html';
import { Icon } from 'react-native-elements';
import overrides from './Overrides';




class SingleCat extends React.Component {


  state = {
    hasError: false,
    error:[],
    data: [],
    coords: [],
    tocData: [],
    toc:[['Back to the top', [0, 0]]],
    showTOC: false,
  };

  componentWillMount () {
    this.setState({error: ''});
    this.setState({hasError: false});
  }
  async componentDidMount() {
    const { params } = this.props.navigation.state;
    const singlePageData = await ajax.fetchSinglePage (params.pageName);
    if (singlePageData.message) {
      this.setState({ error: singlePageData.message });
      this.setState({ hasError: true });
    } else {
      this.setState({ data: singlePageData });
      LayoutAnimation.configureNext(LayoutAnimation.Presets.spring);
    }
  }



  static navigationOptions = ({ navigation }) => ({

    title: navigation.state.params.pageName.replace('_', ' '),
  })

checkLink = (evt, href) => {
  const { navigate } = this.props.navigation;
  if (href.startsWith('/')) {
    navigate('SingleCat', {pageName: decodeURI(href.replace('/',''))});
  } else {
    Linking.openURL(href).catch((err) => console.error('An error occurred', err));
  }
}


//sort the coordinates from lowest to highest
  sortCoords = (a, b) => {
    if (a[1] && b[1]) {
      if (a[1] < b[1]) return -1;
      if (a[1] > b[1]) return 1;
      return 0;
    }
  }

  //for building the coordinates array
  onLayout = (e) => {

    var arrayvar = this.state.coords.slice();
    arrayvar.push([e.nativeEvent.layout.x,  e.nativeEvent.layout.y]);

    this.setState({ coords: arrayvar }, () => {
      var r = [];
      var i;
      var keys = this.state.tocData;
      var values = this.state.coords;
      values = values.sort(this.sortCoords);
      for (i = 0; i < keys.length; i++) {

        r[i] = [keys[i], values[i]];
      }
      //place a back to top button at beginning of array
      r.unshift(['Back to the top', [0, 0]]);

      this.setState({toc: r});
    });
  }

//builds data for TOC by adding it on the the state array
buildTOCData = (text) => {
  setTimeout(() => {
    var tempArray = this.state.tocData.slice();
    tempArray.push(text);
    this.setState({tocData: tempArray});
  }, 5);
}

//toggle the arrow for Table of Contents
toggleArrow = () => {
  if (this.state.showTOC) {
    return(
      <Icon
        name='keyboard-arrow-up'
        color='white' />
    );
  }
  return(
    <Icon
      name='keyboard-arrow-down'
      color='white' />);
}

//toggle the height of the Table of Contents
toggleHeight = () => {
  if (this.state.showTOC) {
    return({height: '30%',});
  }
  return({height: 0,});
}

//toggle the Table of Contents
toggleTOC = () => {
  this.setState({showTOC: !this.state.showTOC});
  LayoutAnimation.configureNext(LayoutAnimation.Presets.spring);
}

//toggle the Table of Contents
renderTOCList = (item, index) => {
  if (index === 0) {
    return (
      <Text style={styles.listItemTop}>{item[0]}</Text>
    );
  }
  return (
    <Text style={styles.listItem}>{index}. {item[0]}</Text>
  );
}




//render the Table of Contents
renderTOC = () => {
  return (
    <View style={styles.head}>
      <FlatList
        style={this.toggleHeight()}
        data={this.state.toc}
        keyExtractor={(item, index) => index}
        renderItem={({item, index}) =>
          <TouchableOpacity onPress={() => this._scrollView.scrollTo({x: item[1][0], y: item[1][1]})}>
            { this.renderTOCList(item, index) }
          </TouchableOpacity>
        }
      />

      <TouchableOpacity
        style={styles.tocContainer}
        onPress={this.toggleTOC}>
        <Text style={styles.tocButton}> Table of Contents </Text>
        { this.toggleArrow() }
      </TouchableOpacity>
    </View>

  );
}



render() {

  const alterNode = (node) => {
    /*
    const { name } = node;
    //prepending uri for images
    if (name === 'img') {
      //console.log(node.attribs.src);
      node.attribs.src = 'https://stardewvalleywiki.com/' + node.attribs.src;
      return node;
    }*/


    //removing all inline styles
    if (node.attribs) {
      if (node.attribs.style) {
        node.attribs.style = '';
        return node;
      }
    }
  };
  if (this.state.hasError) {
    return (
      <View style={styles.container}>
        <Text> {this.state.error} </Text>
      </View>
    );
  }
  //if there is a page to display, show it
  else if (this.state.data.parse) {
    return (


      <View style={styles.container}>
        { this.renderTOC() }

        <ScrollView
          ref={(c) => this._scrollView = c}
          style={styles.web}>
          <HTML
            html={this.state.data.parse.text['*']}
            onLinkPress={(evt, href) => {this.checkLink(evt, href);}}
            ignoredTags={['head', 'scripts', 'audio', 'video', 'track', 'embed', 'object', 'param', 'source', 'canvas', 'noscript',
              'caption', 'col', 'colgroup', 'button', 'datalist', 'fieldset', 'form', 'input', 'label', 'legend', 'meter', 'optgroup', 'option', 'output', 'progress', 'select', 'textarea', 'details', 'diaglog',
              'menu', 'menuitem', 'summary']}
            alterNode = {alterNode}
            listsPrefixesRenderers = {{
              ul: () => {
                return (null);
              }
            }}
            renderers={{

              h2: (htmlAttribs, children, styles, passProps) => {
                this.buildTOCData(passProps.rawChildren[0].children[0].data);
                return(
                  <Text
                    onLayout={this.onLayout}
                    key={passProps.key}
                    style={[styles, { marginTop: 20, fontWeight: 'bold',}]}>{ children } </Text>
                );
              },

              table: (htmlAttribs, children, styles, passProps) => {
                //if has id render as view instead of scrollview
                if (htmlAttribs && htmlAttribs.id =='infoboxtable') {
                  return (
                    <View
                      style={styles}
                      key={passProps.key}>
                      { children }
                    </View>
                  );
                }

                return (
                  <ScrollView
                    horizontal={true}
                    directionalLockEnabled={false}
                    key={passProps.key}>
                    <View
                      style={styles}>
                      { children }
                    </View>
                  </ScrollView>

                );
              }
            }}
            tagsStyles={{

              h3: {
                fontSize: 40,
              },

              tr: {
                flexDirection: 'row',
                flex: 1,
                alignItems: 'center',
                //justifyContent: 'center',
                flexWrap: 'wrap',
                //minWidth: Dimensions.get('window').width - 20,
              },

              th : {
                flex: 1,
                alignSelf: 'stretch',
                backgroundColor: '#44DB5E',
                alignItems: 'center',
                justifyContent: 'center',
                borderRightWidth: 1,
                borderColor: 'white',
                padding: 10,
                //minWidth: 200,
                maxWidth: Dimensions.get('window').width,

              },
              ul: {
                flexDirection: 'row',
                flex: 1,
                alignItems: 'center',
                justifyContent: 'space-between',
                flexWrap: 'wrap',
                //minWidth: Dimensions.get('window').width - 20,

              },
              li: {
                flex: 1,
                alignSelf: 'stretch',
                alignItems: 'center',
                justifyContent: 'center',
                flexDirection: 'row',
                flexWrap:'nowrap',
              },
              td : {
                flex: 1,
                alignSelf: 'stretch',
                alignItems: 'center',
                justifyContent: 'center',
                flexWrap:'wrap',
                overflow: 'hidden',
                padding: 10,
                backgroundColor: '#F5FCFF',
                borderWidth: 1,
                borderColor: 'white',
                maxWidth: Dimensions.get('window').width,
              },
              img: {
                flex: 1,
                maxWidth: '100%',
              },
            }}
          />
        </ScrollView>
      </View>
    );
  }
  //if no page to display, show loading screen
  return (
    <View style={styles.container}>
      <ActivityIndicator size="large" color={overrides.list_color} />
      <Text style={styles.loading}>Loading...</Text>
    </View>
  );
}
}



const styles = StyleSheet.create({
  head: {
    width: '100%',
  },
  toc: {
    padding: 10,
    height: 0,
    width: '100%'
  },
  tocArrow: {
    fontSize: 40,
  },
  tocButton: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
  },
  tocContainer: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
    padding: 10,
    width: '100%',
    backgroundColor: overrides.toc_color,
  },
  container: {
    backgroundColor: 'white',
    flex: 1,
    justifyContent: 'center',
    flexDirection: 'column',
    alignItems: 'center',

  },

  loading: {
    fontSize: 20,
    textAlign: 'center',
    margin: 10,
    color: 'grey'
  },
  web: {
    width: '100%',
    padding: 10,
  },
  listItem: {
    flex: 1,
    textAlign: 'center',
    margin: 5,
    backgroundColor: overrides.toc_color,
    padding: 5,
    overflow: 'hidden',
    fontSize: 18,
    color: 'white',
  },
  listItemTop: {
    flex: 1,
    textAlign: 'center',
    margin: 5,
    backgroundColor: overrides.toc_top_color,
    padding: 5,
    overflow: 'hidden',
    fontSize: 18,
    color: 'white',
  },

});

export default SingleCat;
