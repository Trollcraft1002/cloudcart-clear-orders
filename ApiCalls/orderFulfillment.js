
const { setTimeout } = require('timers');

require('dotenv').config()

let formattedError
async function fulfillment(id){


    const apiUrl = `https://${process.env.STORE_URL}/api/v2/order-fulfillment`

    const raw = JSON.stringify({
        "data": {
          "type": "order-fulfillment",
          "attributes": {
          },
          "relationships": {
            "order": {
              "data": {
                "type": "orders",
                "id": `${id}`
              }
            }
          }
        }
      });

      const headers = {  
        'X-CloudCart-ApiKey': `${process.env.API_KEY}`,
        'Content-Type': 'application/vnd.api+json',
        // Add any other headers as needed
      };

      let retries = 5; // Number of retries
  while (retries > 0) {
  

      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: headers,
        body: raw,
        redirect: "follow"
      });

      // Check if the response is successful
      if (!response.ok) {

        if (response.status === 429) {
          // Too Many Requests (429) status code, retry after 15 seconds
          console.log(id + ': Too many requests. Retrying in 15 seconds...');
          await new Promise(resolve => setTimeout(resolve, 15000)); // Wait for 15 seconds
          retries--;
          continue;
        }
        
        else if(response.status == 201){
            const data = await response.json();
            return `Order ${data.data.id} is fullfilled`
        } else if(response.status == 422){
          return `Order already fullfilled`
        }

        if(response.status == 403){
          return `${id}: 403 Forbidden Request forbidden by administrative rules`
        }

        if(response.status == 500){
         //let  errorObj = response.text
          
          return `${id}: 500 Internal server Error`
        }
        
        if(response.status == 502){
          return `${id}: 502 Bad Gateway`
        }

        if (response.status == 504){
          return ` ${id}: 504 Timed out`
        }

        if(response.status == 520){
          return `${id}: 520 Web server is returning an unknown error`
        }
        if(response.status == 503){
          return `${id}: Service Unavailable`
        }

        
        else {
          // If it's not a 429 error, throw the error
          const errorMessage = await response.text();
          let errorObject;
          try {
             errorObject = JSON.parse(errorMessage);
          } catch (err) {
            return `error: ${errorMessage}`
          }
           formattedError = `${id} Request failed with status ${response.status}: ${errorObject.errors[0].title} details:  ${errorObject.errors[0].detail}`;
          throw new Error(formattedError);
        }
      }

      const data = await response.json();
      return `Order ${data.data.attributes.order_id} is fullfilled`

  
    }
    return `${formattedError} ${id} Failed to fetch`
  }


module.exports = fulfillment;
