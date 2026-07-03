const axios = require('axios');

async function test() {
  const query = `
    query { 
      Media(id: 154587, type: ANIME) { 
        streamingEpisodes { title thumbnail url } 
      } 
    }`;
  const response = await axios.post('https://graphql.anilist.co', { query });
  console.log(JSON.stringify(response.data, null, 2));
}

test();
