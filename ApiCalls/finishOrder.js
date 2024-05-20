
const { setTimeout } = require('timers');
let formattedError
require('dotenv').config()

async function finishOrder(id){
    const apiUrl = `https://${process.env.STORE_URL}/api/v2/orders/${id}`


    const raw = JSON.stringify({
        "data": {
          "type": "orders",
          "id": `${id}`,
          "attributes": {
            "status": "completed"
          }
        }
      });

      const headers = {
        'X-CloudCart-ApiKey': `${process.env.API_KEY}`,
        'Content-Type': 'application/vnd.api+json'
        // Add any other headers as needed
      };

      let response
      let retries = 5; // Number of retries
  while (retries > 0) {
      try {
         response = await fetch(apiUrl, {
          method: 'PATCH',
          headers: headers,
          body: raw,
          redirect: "follow"
        });
      } catch (error) {
        console.log(error)
        return `Coudn't fetch`
      }
     

      // Check if the response is successful
      if (!response.ok) {

        if (response.status === 429) {
          // Too Many Requests (429) status code, retry after 15 seconds
          console.log(id+': Too many requests. Retrying in 15 seconds...');
          await new Promise(resolve => setTimeout(resolve, 15000)); // Wait for 15 seconds
          retries--;
          continue;
        }

        if(response.status == 403){
          return `${id}: 403 Forbidden Request forbidden by administrative rules`
        }
        
        if(response.status == 409){
            return `Order already finished`
        }
        
        

        if(response.status == 422){
          const errorMessage = await response.text();
          const errorObject = JSON.parse(errorMessage);
           //formattedError = `${id}Request failed with status ${response.status}: ${errorObject.errors[0].title} details:  ${errorObject.errors[0].detail}`;
           return `${id} Failed: ${errorObject.errors[0].detail}`
        }

        if(response.status == 500){
          //let  errorObj = JSON.parse(response.text)
           
           return `${id}: 500 Internal server Error`
         }
        
        if (response.status == 504){
          return `${id}: 504 Timed out`
        }

        if(response.status == 502){
          return `${id}: 502 Bad Gateway`
        }
        if(response.status == 520){
          return `${id}: 520 Web server is returning an unknown error`
        }


        else {
          let errorObject;
          // If it's not a 429 error, throw the error
          const errorMessage = await response.text();
          try {
            errorObject = JSON.parse(errorMessage);
         } catch (error) {
           return `${id}: ${response.status}:  ${errorMessage} `
         }
           formattedError = `${id}Request failed with status ${response.status}: ${errorObject.errors[0].title} details:  ${errorObject.errors[0].detail}`;
          throw new Error(formattedError);
          
        }
      }

      // Parse the JSON response
      const data = await response.json();

      // Process the data
      return `${data.data.id} : ${data.data.attributes.status}`

  }
  return `${formattedError}`

}
module.exports = finishOrder;