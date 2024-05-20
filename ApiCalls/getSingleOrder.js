const { setTimeout } = require('timers');

require('dotenv').config()


async function getSingleOrder(id) {

if(id == null || id == '' || id <=0){
    throw new Error('The provided ID seems to be empty.');
}

const apiUrl = `https://${put_site_here}/api/v2/orders/${id}`;


const headers = {
  'X-CloudCart-ApiKey': `${process.env.API_KEY}`,
  // Add any other headers as needed
};

  let retries = 5; // Number of retries
  while (retries > 0) {
    try {

      const response = await fetch(apiUrl, {
        headers: headers
      });

      // Check if the response is successful
      if (!response.ok) {


        if (response.status === 429) {
          // Too Many Requests (429) status code, retry after 15 seconds
          console.log('Too many requests. Retrying in 15 seconds...');
          await new Promise(resolve => setTimeout(resolve, 15000)); // Wait for 15 seconds
          retries--;
          continue;
        } 
        
        else {
          // If it's not a 429 error, throw the error
          const errorMessage = await response.text();
          const errorObject = JSON.parse(errorMessage);
          const formattedError = `${id} Request failed with status ${response.status}: ${errorObject.errors[0].title}`;
          throw new Error(formattedError);
        }

      }

      // Parse the JSON response
      const data = await response.json();

      // Process the data
      return [data.data.id, data.data.attributes.status]
      //return data

    } catch (error) {
      console.error('There was a problem with the fetch operation:', error);
      break;
    }
  }

  return "Failed to get order"

}

module.exports = getSingleOrder;
