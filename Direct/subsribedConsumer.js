const amqp = require('amqplib');

async function receiveMail() {
    try {
        const connection = await amqp.connect("amqp://localhost");
        const channel = await connection.createChannel();

        await channel.assertQueue("mail_queue_for_subscribed_user", {durable: false});

        channel.consume("mail_queue_for_subscribed_user",(message)=>{
            if(message !== null){
                console.log("Message received for subscribed User ", JSON.parse(message.content));
                channel.ack(message);
            }
        })
    } catch (error) {
        console.log(error);
    }
}

receiveMail();