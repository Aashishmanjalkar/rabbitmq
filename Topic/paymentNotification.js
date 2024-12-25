const amqp = require('amqplib');

async function paymentNotification() {
    try {
        const connection = await amqp.connect("amqp://localhost");
        const channel = await connection.createChannel();
        const exchange = 'notification_exchange';
        const exchangeType = 'topic';
        const queue = "payment_queue";

        await channel.assertExchange(exchange, exchangeType, {durable:true});
        await channel.assertQueue(queue, {durable:true});

        await channel.bindQueue(queue, exchange, "payment.*");

        console.log("Waiting for message")
        channel.consume(queue,(message)=>{
            if(message !== null){
                console.log("Payment notification was consumed ", JSON.parse(message.content));
                channel.ack(message);
            }
        })
    } catch (error) {
        console.log(error);
    }
}

paymentNotification();