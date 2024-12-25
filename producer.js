const amqp = require('amqplib');

//Directly  (Exchange type - direct ) Sending mail to with two different routing to subsrcibed user and not subscribded user queue 
async function sendMail() {
    try {
        const connection = await amqp.connect("amqp://localhost");
        const channel = await connection.createChannel();

        const exchange = "mail_exchange";
        const routingKeySubscribedUser = "send_mail_to_subscribed_user";
        const routingKeyNormalUser = "send_mail_to_normal_user";
        const message = {
            to:"alluser@gmail.com",
            from:"producer@gmail.com",
            subject:"Hello TP mail",
            body:"Body of the mail"
        }

        await  channel.assertExchange(exchange, "direct", {durable:false});

        await channel.assertQueue("mail_queue_for_subscribed_user", {durable:false});
        await channel.assertQueue("mail_queue_for_non_subsriced_user", {durable:false});

        await channel.bindQueue("mail_queue_for_subscribed_user", exchange, routingKeySubscribedUser);
        await channel.bindQueue("mail_queue_for_non_subsriced_user", exchange, routingKeyNormalUser);

        channel.publish(exchange, routingKeySubscribedUser, Buffer.from(JSON.stringify(message)));
        channel.publish(exchange, routingKeyNormalUser, Buffer.from(JSON.stringify(message)));
        console.log("Mail data was sent ", message);

        setTimeout(() => {
            connection.close();
        }, 500);
    } catch (error) {
        console.log(error);
    }
}

// sendMail();

//(Exchange type - topic ) Sending notification with two different queues created and queue will be bind in service file of order
//  and notification files (We need to add just order.* it will listen automatically considering the topic passed) 
const sendMessage = async (routingKey, message) => {
    let connection;
    try {
        connection = await amqp.connect("amqp://localhost");
        const channel = await connection.createChannel();
        const exchange = "notification_exchange";
        const exchangeType = 'topic';

        await channel.assertExchange(exchange, exchangeType, { durable: true });

        channel.publish(exchange, routingKey, Buffer.from(JSON.stringify(message)), { persistent: true });
        console.log(`[x] Sent message with routing key '${routingKey}': ${JSON.stringify(message)}`);
    } catch (error) {
        console.error("Error in sendMessage:", error);
    } finally {
        if (connection) {
            setTimeout(() => {
                connection.close();
            }, 500);
        }
    }
}

// sendMessage("order.placed", { orderId: 12345, status: "placed" });
// sendMessage("payment.processed", {paymentId : 65431, status : "processed"});


//(Exchane type : Fanout ) here we pass empty string in routing key as product launch to be notified to both sms and push notification  
//Fanout Exchange is a type of exchange in which it sends the data to all the queues So suppose there are five queues, then it creates
//five copies of that data, and each of the copies is sent to each queue;
const annouceNewProduct = async(product) => {
    let connection;
    try {
        connection = await amqp.connect("amqp://localhost");
        const channel = await connection.createChannel();
        const exchange = "new_product_launch";
        const exchangeType = 'fanout';

        await channel.assertExchange(exchange, exchangeType, {durable:true});
        const message = JSON.stringify(product);

        channel.publish(exchange, "", Buffer.from(message), {persistent:true}); 
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

// annouceNewProduct({id:1234, name: 'samsung',model : "S25"});

//RabbitMQ lets you mark messages with priorities (1-255, lower is higher). 
//It uses internal sub-queues for each priority. Higher-priority messages jump the queue (within limits) and are delivered first.
//This is great for urgent tasks but can use more resources.
//RabbitMQ priority queues offer a "best effort" approach to message priority, not an absolute guarantee. 
//Higher priority messages are more likely to be processed first, but factors like redelivery and multiple consumers can affect the order.


const sendMessagePriority = async () => {
    let connection;
    try {
        connection = await amqp.connect("amqp://localhost");
        const channel = await connection.createChannel();
        const exchange = "priority_exchange";
        const exchangeType = 'direct';
        const queue = 'priority_queue';
        const routingKey = 'priority_key';

        await channel.assertExchange(exchange, exchangeType, { durable: true });
        await channel.assertQueue(queue, {
            durable:true,
            arguments:{"x-max-priority":10}
        });

        await channel.bindQueue(queue, exchange, routingKey);

        const data  = [
            {
                msg: "Hello low 1",
                priority:1
            },
            {
                msg: "Hello low 8",
                priority:8
            },
            {
                msg: "Hello low 4",
                priority:4
            }
        ]

        data.map((msg)=>{
            channel.publish(exchange, routingKey, Buffer.from(msg.msg), { priority: msg.priority });
        });

        console.log("All message sent");
    } catch (error) {
        console.error("Error in sendMessage:", error);
    } finally {
        if (connection) {
            setTimeout(() => {
                connection.close();
            }, 500);
        }
    }
}
sendMessagePriority();