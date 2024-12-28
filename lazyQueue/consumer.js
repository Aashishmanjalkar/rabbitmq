const amqp = require("amqplib");

async function processOrdersUpdates(){
    const connection = await amqp.connect("amqp://localhost");
    const channel = await connection.createChannel();

    const queue = "delayed_order_updates_queue";
    await channel.assertQueue(queue, {durable:true, arguments: {
        "x-queue-mode": "lazy"
    },})

    console.log("Waiting for the queue ");
    channel.consume(
        queue,
        async(msg) =>{
            if(msg !== null){
                const { batchId, orders } = JSON.parse(msg.content.toString());
                console.log(` processing task batch no ${batchId} and orders `);
                channel.ack(msg);
            }
        },
        {noAck : false}
    )
}
processOrdersUpdates();