const amqp = require('amqplib');

const consumePriority = async () => {
      let connection;
        try {
            connection = await amqp.connect("amqp://localhost");
            const channel = await connection.createChannel();
    
            const queue = "priority_queue";
    
            await channel.assertQueue(queue,  {
                durable:true,
                arguments : {"x-max-priority":10}
            });
    
    
            channel.consume(queue, (msg)=>{
                if (msg !== null) {
                    const message = msg.content.toString();
                    console.log("Priority Queue", message);
                    channel.ack(msg);
                }
            });
        } catch (error) {
            console.log(error);
        }
}

consumePriority();