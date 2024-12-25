const amqp = require('amqplib');

const orderNotification = async () => {
    let connection;
    try {
        connection = await amqp.connect("amqp://localhost");
        const channel = await connection.createChannel();
        const exchange = "new_product_launch";
        const exchangeType = "fanout";

        await channel.assertExchange(exchange, exchangeType, { durable: true });
        const queue = await channel.assertQueue("", { durable: true }); //No queues is passed instead "" string will be passed temporary queue will be created and destroyed

        console.log("Waiting for msgs => ", queue);

        await channel.bindQueue(queue.queue, exchange, "");

        console.log("Waiting for messages...");
        channel.consume(queue.queue,
            (message) => {
                if (message !== null) {
                    const product = JSON.parse(message.content.toString());
                    console.log("Sending sms message for product launch => ", product.name);
                    channel.ack(message);
                }
            },
            { noAck: false }
        );
    } catch (error) {
        console.error("Error in sms notification :", error);
    }
}

orderNotification();