const amqp = require('amqplib');

//A header exchange in RabbitMQ routes messages based on header attributes rather than routing keys.
//It matches headers in the message against headers specified in the binding. 
//This allows for more flexible routing options using key-value pairs.

const sendNotification = async(headers, message) => {
    let connection;
    try {
        connection = await amqp.connect("amqp://localhost");
        const channel = await connection.createChannel();
        const exchange = "headers_Exchange";
        const exchangeType = 'headers';

        await channel.assertExchange(exchange, exchangeType, {durable:true});

        channel.publish(exchange, "", Buffer.from(message), {persistent:true , headers}); 
        console.log(" sent => ", message);
    } catch (error) {
        console.log(error);
    }  finally {
        if (connection) {
            setTimeout(() => {
                connection.close();
            }, 500);
        }
    }
}

sendNotification({ "x-match": "all", "notification-type": "new_video", "content-type": "video" }, "New music video uploaded");
sendNotification({ "x-match": "all", "notification-type": "live_stream", "content-type": "gaming" }, "Gaming live stream started");
sendNotification({ "x-match": "any", "notification-type-comment": "comment", "content-type": "vlog" }, "New comment on your vlog");
sendNotification({ "x-match": "any", "notification-type-like": "like", "content-type": "vlog" }, "Someone liked your comment");