const apiHost = 'https://fortnite.gamepedia.com/api.php?';

export default {
  async fetchCategories () {
    try {

      let response = await fetch(apiHost + 'action=query&prop=links&titles=Fortnite%20Wiki&pllimit=500&plnamespace=0&format=json');
      let responseJson = await response.json();
      return responseJson;
    } catch (error) {
      console.error(error);
    }
  },

  async fetchSinglePage (pageName) {
    try {

      let response = await fetch(apiHost + 'action=parse&format=json&disabletoc=true&prop=headhtml|wikitext|text&disableeditsection=true&page=' + pageName);
      let responseJson = await response.json();
      return responseJson;
    } catch (error) {
      console.error(error);
      return error;
    }
  },

  async fetchSearchResults(searchTerm) {
    try {

      let response = await fetch(apiHost + 'action=opensearch&format=json&search=' + searchTerm);
      let responseJson = await response.json();
      return responseJson;
    } catch (error) {
      console.error(error);
    }
  },

  async fetchSinglePageFormat (pageName) {
    try {
      let response = await fetch(apiHost + 'action=parse&format=json&disabletoc=true&disableeditsection=true&page=' + pageName);
      let responseJson = await response.json();
      let formatData = '<body>' + responseJson.parse.text['*'] + '</body>';
      //console.log(formatData);
      return formatData;
    } catch (error) {
      console.error(error);
    }}
};
