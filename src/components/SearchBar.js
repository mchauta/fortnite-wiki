
import React, { Component } from 'react';
import { TextInput, StyleSheet  } from 'react-native';
import PropTypes from 'prop-types';
import debounce from 'lodash.debounce';
import overrides from './Overrides';

export default class SearchBar extends Component<{}> {

  static propTypes = {
    searchWiki: PropTypes.func.isRequired,
  };

  state= {
    searchTerm: '',
  }

debouncedSearchWiki = debounce(this.props.searchWiki, 300);

handleChange = (searchTerm) => {
  this.setState({searchTerm}, () => {
    this.debouncedSearchWiki(this.state.searchTerm);
  });
};

render() {
  return(
    <TextInput
      style= {styles.input}
      placeholder= 'Search Fortnite Wiki'
      onChangeText={this.handleChange}
      clearButtonMode={'while-editing'}
      autoCapitalize={'none'}/>
  );
}
}

const styles = StyleSheet.create({
  input: {
    height: 50,
    backgroundColor: '#F5FCFF',
    borderRadius: 5,
    borderWidth: 1,
    borderColor: 'white',
    padding: 5,
    width: '100%',
    margin: 15,
    textAlign: 'center',
    fontSize: 18,

  }
});
