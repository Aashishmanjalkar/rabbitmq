const amqp = require('amqplib');

const consumLikeCommentNotifications = async () => {
  let connection;
    try {
        connection = await amqp.connect("amqp://localhost");
        const channel = await connection.createChannel();

        const exchange = "headers_Exchange";
        const exchangeType = 'headers';

        await channel.assertExchange(exchange, exchangeType, {durable:true});

        const q = await channel.assertQueue("", { exclusive: true });
        console.log("Waiting for comment stream notifications");

        //Routing key should be given as "" because we are matching with headers
        await channel.bindQueue(q.queue,exchange, "", {
            "x-match": "any",
            "notification-type-comment": "comment",
            "notification-type-like": "like"
        })
    
        channel.consume(q.queue, (msg)=>{
            if (msg !== null) {
                const message = msg.content.toString();
                console.log("Received live stream notification", message);
                // Process the notification
                channel.ack(msg);
            }
        });
    } catch (error) {
        console.log(error);
    }
}

consumLikeCommentNotifications();