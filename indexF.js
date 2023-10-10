import fetch from "node-fetch";
import cors from "cors";
import express from "express";


const app = express();
const port = 3001;

app.use(express.json());
app.use(cors());

app.post('/api/similarKeywords', async (req, res) => {
  const { keyword } = req.body;
    console.log(keyword)

    try {
    const originalSearchUrl = `https://openapi.etsy.com/v3/application/listings/active?keywords=${encodeURIComponent(keyword)}`;
    const oroginalSearchResponse = await fetch(originalSearchUrl, {
      method: 'GET',
      headers: {
        'x-api-key':'0aa6qx7gfy3cds87hvijwe40',
      },
    });
    const originalSearchResults = await oroginalSearchResponse.json();
    const originalListing = originalSearchResults.count;
    console.log(originalListing)

  
    // Step 1: Search for listings containing the keyword
    const searchUrl = `https://openapi.etsy.com/v3/application/listings/active?keywords=${encodeURIComponent(keyword)}`;
    const searchResponse = await fetch(searchUrl, {
      method: 'GET',
      headers: {
        'x-api-key':  '0aa6qx7gfy3cds87hvijwe40',
      },
    });
    const searchResults = await searchResponse.json();
    // Step 2: Extract tags from the search results
    const suggestedTags = new Set();
    searchResults.results.forEach(listing => {
      listing.tags.forEach(tag => {
        // Check if the tag contains the original keyword
        if (tag.toLowerCase().includes(keyword.toLowerCase())) {
          suggestedTags.add(tag);
        }
      });
    });

    // suggestedTags.sort((tag1, tag2) => {
    //     const count1 = searchResults.results.filter(listing => listing.tags.includes(tag1)).length;
    //     const count2 = searchResults.results.filter(listing => listing.tags.includes(tag2)).length;
    //     return count2 - count1;
    //   });

      const topTags = suggestedTags;




    // Step 3: Fetch search volume data for each suggested tag
    const searchVolumeData = {};
    const powerData = {}
    for (const suggestedTag of topTags) {
      const tagSearchUrl = `https://openapi.etsy.com/v3/application/listings/active?keywords=${encodeURIComponent(suggestedTag)}`;
      const tagSearchResponse = await fetch(tagSearchUrl, {
        method: 'GET',
        headers: {
          'x-api-key':'0aa6qx7gfy3cds87hvijwe40',
        },
      });
      const tagSearchResults = await tagSearchResponse.json();
      const listingCount = tagSearchResults.count;
      searchVolumeData[suggestedTag] = listingCount;
      const TagPower = (listingCount / originalListing) * 100;
      powerData[suggestedTag] = Math.trunc(TagPower*4399);
      console.log(powerData)
    }

    res.json({ suggestedKeywords: [...topTags], searchVolumeData, powerData });
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ error: 'An error occurred' });
  }
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});