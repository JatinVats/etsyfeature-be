const express = require('express');
const cors = require('cors'); // Import the cors middleware



const app = express();
const port = 3001;



app.use(express.json());

app.use(cors()); // Enable CORS for all routes
app.post('/api/similarKeywords', async (req, res) => {
  const { keyword } = req.body;

  try {
    // Fetch similar keywords from the Datamuse API
    const datamuseResponse = await fetch(`https://suggestqueries.google.com/complete/search?client=firefox&q=${encodeURIComponent(keyword)}`);
    const datamuseData = await datamuseResponse.json();
    console.log(datamuseData)
    // Extract the top 5 similar keywords
    const similarKeywords = datamuseData.slice(0, 5).map((item) => item.word);
    console.log(similarKeywords)
    // Fetch search volume data for each similar keyword from the Etsy API
    const searchVolumeData = {};

    for (const similarKeyword of similarKeywords) {
      console.log(similarKeyword)

      const requestOptions = {
        'method': 'GET',
        'headers': {
            'x-api-key': '0aa6qx7gfy3cds87hvijwe40',
        },
        

    };


    const url = `https://openapi.etsy.com/v3/application/listings/active?keywords=${encodeURIComponent(
      similarKeyword
    )}`;


    const response = await fetch(url,requestOptions);

   const data = await response.json();
      console.log(data.count)
        searchVolumeData[similarKeyword] =  data.count;
    
    }

    res.json({ similarKeywords, searchVolumeData });
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ error: 'An error occurred' });
  }
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});