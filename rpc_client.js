/**
 * Created by mi0152 on 16/02/16.
 */
var ampq = require("amqplib/callback_api");

var args = process.argv.slice(2);

if(args.length == 0){
    console.log(" Usage: rpc_client.js num");
    process.exit(1);
}


ampq.connect("amqp://localhost",function(err, conn){

    conn.createChannel(function(err, ch){

        ch.assertQueue("",{exclusive : true},function(err, q){

            var corr = generateUuid();
            var num = parseInt(args[0]);

            console.log(" [x] Requesting fib(%d)",num);

            ch.consume(q.queue, function(msg){

                if(msg.properties.correlationId == corr){
                    console.log("[.] Got %s ", msg.content.toString());
                    setTimeout(function(){
                        conn.close(); process.exit(0)
                    },500);
                }

            }, {noack : true});

            ch.sendToQueue("rpc_queue",new Buffer(num.toString()),
                { correlationId : corr, replyTo : q.queue});
        });

    });

});


function generateUuid() {
    return Math.random().toString() +
        Math.random().toString() +
        Math.random().toString();
}