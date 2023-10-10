const express = require('express');
const cors = require('cors');


const app = express();
const port = 3001;

app.use(express.json());
app.use(cors());

app.post('/api/similarKeywords', async (req, res) => {
  const { keyword } = req.body;
  console.log(keyword)


  try {
    // Step 1: Search for listings containing the keyword
    const searchUrl = `https://openapi.etsy.com/v3/application/listings/active?keywords=${encodeURIComponent(keyword)}`;
    const searchResponse = await fetch(searchUrl, {
      method: 'GET',
      headers: {
        'x-api-key': '0aa6qx7gfy3cds87hvijwe40',
      },
    });
    const searchResults = await searchResponse.json();
    
    // Step 2: Extract tags from the search results
    const suggestedTags = new Set();
    searchResults.results.forEach(listing => {
      listing.tags.forEach(tag => {
        suggestedTags.add(tag);
        console.log(suggestedTags)
      });
    });

    // Step 3: Fetch search volume data for each suggested tag
    const searchVolumeData = {};
    let abc = 6;
    for (const suggestedTag of suggestedTags) {
      if(abc>0){
      const tagSearchUrl = `https://openapi.etsy.com/v3/application/listings/active?keywords=${encodeURIComponent(suggestedTag)}`;
      const tagSearchResponse = await fetch(tagSearchUrl, {
        method: 'GET',
        headers: {
          'x-api-key': '0aa6qx7gfy3cds87hvijwe40',
        },
      });
      const tagSearchResults = await tagSearchResponse.json();
      const listingCount = tagSearchResults.count;
      searchVolumeData[suggestedTag] = listingCount;
      abc = abc-1;
    }
    }

    res.json({ suggestedTags, searchVolumeData });
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ error: 'An error occurred' });
  }
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});