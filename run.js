const getOrder = require('./ApiCalls/getSingleOrder');
const orderFulfillment = require('./ApiCalls/orderFulfillment')
const finishOrder = require('./ApiCalls/finishOrder')
const listOrders = require('./ApiCalls/listOrders')
const cliProgress = require('cli-progress');
const fs = require('fs');
const { isUndefined } = require('util');

async function getSingleOrder(id){
const order =  await getOrder(id); //requires ID 
console.log(`ID: ${order[0]}  STATUS: ${order[1]}`); //returning array [0] ID, array [1] STATUS
//console.log(order)

}





// Function to append a line with timestamp to a text file

async function appendLineWithTimestamp(lineToAdd) {
    const filePath = './log.txt';
    const now = new Date();
    const hours = now.getHours().toString().padStart(2, '0');
    const minutes = now.getMinutes().toString().padStart(2, '0');
    const seconds = now.getSeconds().toString().padStart(2, '0');
    const timestamp = `${hours}:${minutes}:${seconds}`; // Constructing timestamp without "ч." prefix
    const lineWithTimestamp = `${timestamp} || ${lineToAdd}`;

    fs.appendFile(filePath, lineWithTimestamp + '\n', (err) => {
        if (err) {
            console.error('Error appending line to file:', err);
        }
    });
}

async  function getOrders(){
let orders =  await listOrders()
//console.log(orders)
let data = orders.data
    for (const order of data){
        //console.log(order.id)
        console.log( await getOrder(order.id))
        
    }
}


async  function completeOrders(){
    let orders =  await listOrders()
    //console.log(orders)
    const bar1 = new cliProgress.SingleBar({}, cliProgress.Presets.shades_classic);
    let data = orders.data
    //=======================TEST DATA=================
    // const data = [
    //     {
    //         type: "orders",
    //         id: "185365",
    //         attributes: {
    //             // Attributes data omitted

    //         },
    //     },
    //     {
    //         type: "orders",
    //         id: "185366",
    //         attributes: {
    //             // Attributes data omitted
    //         },
    //     },
    //     // Additional objects omitted
    // ];
    //================================================
    
    bar1.start(data.length, 0);
        for (const order of data){
                
            console.log(`\n Starting ${order.id}`) 

            await appendLineWithTimestamp(`START | ${order.id}`)
            let response_order =  await orderFulfillment(order.id)
            console.log(response_order);

           await appendLineWithTimestamp(`Order Fulfilment | ${response_order}`)
            let response_finishOrder =  await finishOrder(order.id)
            console.log(`ORDER STATUS | ${response_finishOrder}`);
            
            await appendLineWithTimestamp(`ORDER STATUS | ${response_finishOrder}`)
            bar1.increment()
            
        }
        
        bar1.stop()
        console.log("Finished")
}




async function completeOrder(ids) {
    for (const id of ids) {
        console.log(await orderFulfillment(id));
        console.log(await finishOrder(id));
    }
}


async function test(){
await getOrders()
//await completeOrders()
}


//getSingleOrder(322351)
//completeOrder([186138])

//test()



































async function processOrder(order) {
    
    //console.log(`Starting ${order.id}`);
    //await appendLineWithTimestamp(`STARTING | ${order.id} `);

    let responseOrder = await orderFulfillment(order.id);
    //console.log(responseOrder);
    //await appendLineWithTimestamp(`Order Fulfilment | ${responseOrder}`);

    let responseFinishOrder = await finishOrder(order.id);
    //console.log(`ORDER STATUS | ${responseFinishOrder}`);
    //await appendLineWithTimestamp(`ORDER STATUS | ${responseFinishOrder}`);
    let line = `${order.id} | Order Fulfilment | ${responseOrder} | ORDER STATUS | ${responseFinishOrder}`
    console.log(line)
    await appendLineWithTimestamp(line)
}


async function processBatchOfOrders(orders) {
    //const bar1 = new cliProgress.SingleBar({}, cliProgress.Presets.shades_classic);
   // bar1.start(orders.length, 0);

   let appendOrders = []
    const batchSize = 50;
        orders.forEach(element => {
            appendOrders.push(element.id)
        });
        console.log(appendOrders)
        appendLineWithTimestamp(`STARTING | ${appendOrders.join(" | ")}`)
    for (let i = 0; i <= orders.length; i += batchSize) {
        const batch = orders.slice(i, i + batchSize);
        await Promise.all(batch.map(processOrder));
        //bar1.update(i)
    }
    //bar1.stop()
}



async function main() {
    let finished = false
    while (finished == false){
    let orders =  await listOrders()
    if(orders.data.length == 0 || undefined){
        console.log('No Orders')
        appendLineWithTimestamp(`No Orders Available`)
        finished = true
        return
    }
    await processBatchOfOrders(orders.data);
}
}

main()