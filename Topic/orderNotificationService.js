const amqp = require('amqplib');

const orderNotification = async () => {
    let connection;
    try {
        connection = await amqp.connect("amqp://localhost");
        const channel = await connection.createChannel();
        const exchange = "notification_exchange";
        const exchangeType = "topic";
        const queue = "order_queue";

        await channel.assertExchange(exchange, exchangeType, { durable: true });
        await channel.assertQueue(queue, { durable: true });
        await channel.bindQueue(queue, exchange, "order.*");

        console.log("Waiting for messages...");
        channel.consume(queue,
            (message) => {
                if (message !== null) {
                    const content = JSON.parse(message.content.toString());
                    console.log("Order notification received:", content);
                    channel.ack(message);
                }
            },
            { noAck: false }
        );
    } catch (error) {
        console.error("Error in orderNotification:", error);
    }
}

orderNotification();