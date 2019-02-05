"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const amqp = require("amqplib/callback_api");
const uuidv4 = require("uuid/v4");
class AMQPMessageBroker {
    constructor(configuration) {
        this.configuration = configuration;
        this.id = `urn:uuid:${uuidv4()}`;
        this.creationTime = new Date();
        this.server_host = configuration.queue_server_hostname;
        this.server_port = configuration.queue_server_tcp_listening_port;
        amqp.connect(`amqp://${this.server_host}:${this.server_port}`, (err, connection) => {
            if (err) {
                console.log(err);
                return;
            }
            this.connection = connection;
            connection.createChannel((err, channel) => {
                if (err) {
                    console.log(err);
                    return;
                }
                this.channel = channel;
                channel.assertExchange("events", "topic", { durable: true });
                channel.assertQueue("events.authentication", { durable: false });
                channel.bindQueue("events.authentication", "events", "authentication");
                channel.assertExchange("authentication", "direct", { durable: true });
                channel.assertQueue("authentication.responses", { durable: false });
                channel.bindQueue("authentication.responses", "authentication", "authentication.responses");
                channel.assertQueue("PLAIN", { durable: false });
                channel.bindQueue("PLAIN", "authentication", "authentication.PLAIN");
                channel.assertQueue("EXTERNAL", { durable: false });
                channel.bindQueue("EXTERNAL", "authentication", "authentication.EXTERNAL");
                channel.assertQueue("ANONYMOUS", { durable: false });
                channel.bindQueue("ANONYMOUS", "authentication", "authentication.ANONYMOUS");
                channel.consume("PLAIN", (message) => {
                    if (!message)
                        return;
                    if (!message.properties.correlationId)
                        return;
                    const authenticationRequest = JSON.parse(message.content.toString());
                    if ("authenticationIdentity" in authenticationRequest &&
                        "password" in authenticationRequest) {
                        const creds = this.configuration.credentials;
                        if (authenticationRequest.authenticationIdentity in creds &&
                            authenticationRequest.password === creds[authenticationRequest.authenticationIdentity]) {
                            this.channel.publish("authentication", "authentication.responses", Buffer.from(JSON.stringify({
                                success: true,
                                authorizedIdentity: authenticationRequest.authenticationIdentity
                            })), {
                                correlationId: message.properties.correlationId
                            });
                        }
                        else {
                            this.channel.publish("authentication", "authentication.responses", Buffer.from(JSON.stringify({
                                success: false,
                                authorizedIdentity: authenticationRequest.authenticationIdentity
                            })), {
                                correlationId: message.properties.correlationId
                            });
                        }
                    }
                    else {
                    }
                }, { noAck: true });
            });
        });
    }
    publishEvent(topic, message) {
        this.channel.publish("events", topic, Buffer.from(JSON.stringify(message)));
    }
    close() {
        this.channel.close();
        this.connection.close();
    }
}
exports.default = AMQPMessageBroker;
//# sourceMappingURL=AMQP.js.map