const { setTimeout } = require('timers');

require('dotenv').config()


const apiUrl = `https://${process.env.STORE_URL}/api/v2/orders/?filter[status]=paid&filter[start_date]=${process.env.START_DATE}&filter[end_date]=${process.env.END_DATE}&filter[status_fulfillment]=not_fulfilled&page[number]=1&page[size]=60`;


async function listOrders(){
const headers = {
    'X-CloudCart-ApiKey': `${process.env.API_KEY}`,
    // Add any other headers as needed
  };
let retries = 3
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
        } else {
          
          const errorMessage = await response.text();
          const errorObject = JSON.parse(errorMessage);
          const formattedError = `Request failed with status ${response.status}: ${errorObject.errors[0].title}`;
          throw new Error(formattedError);
        }
      }

      // Parse the JSON response
      const data = await response.json();

      // Process the data
      
      const linesToAppend = data.data.map(order => `${order.id}\t${order.attributes.status}`);

      // Join the lines into a single string with newline characters
      //const toAppend = linesToAppend.join('\n');
      
      // Append the data to the file
      return data
    } catch (error) {
      console.error('There was a problem with the fetch operation:', error);
      break;
    }
  }
}

module.exports = listOrders;