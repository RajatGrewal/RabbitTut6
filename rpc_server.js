var ampq = require("amqplib/callback_api");

ampq.connect("amqp://localhost",function(err,conn){

    conn.createChannel(function(err,ch){

        var q  = "rpc_queue";
        ch.assertQueue(q, { durable : false });
        ch.prefetch();
        console.log(" [x] Awaiting RPC Request");
        ch.consume(q, function reply(msg){

            var n = parseInt(msg.content.toString());

            console.log("[.] fib(%d)", n);

            var r = fibonacci(n);
            console.log("Fibb seq calculated in the server side. Now sending back the data")
            ch.sendToQueue(msg.properties.replyTo,
                new Buffer(r.toString()),
                {correlationId : msg.properties.correlationId}
            );

            ch.ack(msg);
        });

    });

});

function fibonacci(n) {
    if (n == 0 || n == 1)
        return n;
    else
        return fibonacci(n - 1) + fibonacci(n - 2);
}