// Lazy Queues efficiently handle large volumes of messages by storing them on disk, reducing memory usage,
//  and improving system performance. Perfect for applications with high message 
// throughput and storage needs. Watch now to understand how to optimize your messaging systems!

const amqp = require('amqplib');

const sendNotification = async (headers, message) => {
    let connection;
    try {
        connection = await amqp.connect("amqp://localhost");
        const channel = await connection.createChannel();

        const exchange = 'delayed_exchange';
        await channel.assertExchange(exchange,
            'direct',
            {
                durable: true
            }
        );

        const queue = "lazy_notification_queue";
        await channel.assertQueue(queue, {
            durable: true,
            arguments: {
                "x-queue-mode": "lazy"
            },
        });
        await channel.bindQueue(queue, exchange, "notification.key");
        const message = JSON.stringify({ batchId, orders });
        channel.publish(exchange, "", Buffer.from(message), {
            headers: { 'x-delay': delay }
        });

    } catch (error) {
        console.log(error);
    } finally {
        if (connection) {
            setTimeout(() => {
                connection.close();
            }, 500);
        }
    }
}

sendNotification("hello eee ");
