const getOrder = require('./ApiCalls/getSingleOrder');
const orderFulfillment = require('./ApiCalls/orderFulfillment')
const finishOrder = require('./ApiCalls/finishOrder')
const listOrders = require('./ApiCalls/listOrders')
const fs = require('fs');




async function getSingleOrder(id){
const order =  await getOrder(id); //requires ID 
console.log(`ID: ${order[0]}  STATUS: ${order[1]}`); //returning array [0] ID, array [1] STATUS
//console.log(order)
}



//testFunction
//getSingleOrder(id)


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


async function processOrder(order) {
    
    let responseOrder = await orderFulfillment(order.id);

    let responseFinishOrder = await finishOrder(order.id);
    let line = `${order.id} | Order Fulfilment | ${responseOrder} | ORDER STATUS | ${responseFinishOrder}`
    console.log(line)
    await appendLineWithTimestamp(line)
}



async function processBatchOfOrders(orders) {
    const batchSize = 30;
    const appendOrders = orders.map(order => order.id);

    console.log(appendOrders);
    appendLineWithTimestamp(`STARTING | ${appendOrders.join(" | ")}`);

    for (let i = 0; i < orders.length; i += batchSize) { 
        const batch = orders.slice(i, i + batchSize);
        await Promise.all(batch.map(processOrder));
    }
}




async function main() {
    let finished = false;

    while (!finished) {
        let orders = await listOrders();
        
        if (!orders.data || orders.data.length === 0) {
            console.log('No Orders');
            appendLineWithTimestamp('No Orders Available');
            finished = true;
            return;
        }
        
        await processBatchOfOrders(orders.data);
    }
}

main()