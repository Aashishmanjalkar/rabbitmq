const amqp = require("amqplib");

async function sentToDelayedQueue(batchId, orders, delay) {
    let connection;
    let channel;
    try {
        connection = await amqp.connect("amqp://localhost");
        channel = await connection.createChannel();

        const exchange = 'delayed_exchange';
        await channel.assertExchange(exchange, 
            'x-delayed-message',
            {
                arguments: {
                    "x-delayed-type": "direct"
                }
            }
        );

        const queue = "delayed_order_updates_queue";
        await channel.assertQueue(queue, { durable: true });
        await channel.bindQueue(queue, exchange, "");
        const message = JSON.stringify({ batchId, orders });
        channel.publish(exchange, "", Buffer.from(message), {
            headers: { 'x-delay': delay }
        });

        console.log(
            `Sent batch ${batchId} update task to delayed queue with ${delay} ms delay`
        );
    } catch (error) {
        console.error(error);
    } finally {
        if (channel) await channel.close();
        if (connection) await connection.close();
    }
}

async function processBatchOrders() {
    const batchId = generateBatchId();
    const orders = collectOrdersForBatch();
    const delay = 10000;

    console.log(
        `Processing batch id ${batchId} for data ${JSON.stringify(orders)}`
    );

    await processOrders(orders);

    await sentToDelayedQueue(batchId, orders, delay);
}

function generateBatchId() {
    return 'batch_id-' + Date.now();
}

function collectOrdersForBatch() {
    return [
        { "order": 1, item: "Laptop", quantity: 1 },
        { "order": 2, item: "Mobile", quantity: 1 },
        { "order": 3, item: "Charger", quantity: 2 },
    ];
}

async function processOrders(orders) {
    // Implement your order processing logic here
    console.log("Processing orders:", orders);
}

processBatchOrders().catch(console.error);

