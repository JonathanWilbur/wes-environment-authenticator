import ConfigurationSource from "../ConfigurationSource";
import MessageBroker from "../MessageBroker";
import { Message, Channel, ConsumeMessage, Options } from 'amqplib';
const amqp = require("amqplib/callback_api");
const uuidv4 : () => string = require("uuid/v4");

// TODO: Add content_type
// TODO: Add expiration, plus setTimeout to fire the events to remove the event handlers.

export default
class AMQPMessageBroker implements MessageBroker {

    public readonly id : string = `urn:uuid:${uuidv4()}`;
    public readonly creationTime : Date = new Date();
    
    private readonly server_host! : string;
    private readonly server_port! : number;
    private connection! : any;
    private channel! : Channel;

    constructor (
        readonly configuration : ConfigurationSource
    ) {
        this.server_host = configuration.queue_server_hostname;
        this.server_port = configuration.queue_server_tcp_listening_port;
        amqp.connect(`amqp://${this.server_host}:${this.server_port}`, (err : Error, connection : any) => {
            if (err) { console.log(err); return; }
            this.connection = connection;

            connection.createChannel((err : Error, channel : Channel) => {
                if (err) { console.log(err); return; }
                this.channel = channel;

                channel.assertExchange("events", "topic", { durable: true });
                channel.assertQueue("events.authentication", { durable: false });
                channel.bindQueue("events.authentication", "events", "authentication");

                channel.assertExchange("authentication", "direct", { durable: true });
                channel.assertQueue("authentication.responses", { durable: false });
                channel.bindQueue("authentication.responses", "authentication", "authentication.responses");

                // Queues and bindings for the individual SASL mechanisms
                channel.assertQueue("PLAIN", { durable: false });
                channel.bindQueue("PLAIN", "authentication", "authentication.PLAIN");
                channel.assertQueue("EXTERNAL", { durable: false });
                channel.bindQueue("EXTERNAL", "authentication", "authentication.EXTERNAL");
                channel.assertQueue("ANONYMOUS", { durable: false });
                channel.bindQueue("ANONYMOUS", "authentication", "authentication.ANONYMOUS");

                channel.consume("PLAIN", (message : ConsumeMessage | null) => {
                    if (!message) return;
                    if (!message.properties.correlationId) return;
                    const authenticationRequest : any = JSON.parse(message.content.toString());
                    if (
                        "authenticationIdentity" in authenticationRequest &&
                        "password" in authenticationRequest 
                    ) {
                        const creds : { [ username : string ] : string } = this.configuration.credentials;
                        if (
                            authenticationRequest.authenticationIdentity in creds &&
                            authenticationRequest.password === creds[authenticationRequest.authenticationIdentity]
                        ) {
                            this.channel.publish("authentication", "authentication.responses", Buffer.from(JSON.stringify({
                                success: true,
                                authorizedIdentity: authenticationRequest.authenticationIdentity
                            })), {
                                correlationId: message.properties.correlationId
                            });
                        } else { // The credentials are incorrect.
                            this.channel.publish("authentication", "authentication.responses", Buffer.from(JSON.stringify({
                                success: false,
                                authorizedIdentity: authenticationRequest.authenticationIdentity
                            })), {
                                correlationId: message.properties.correlationId
                            });
                        }
                    } else { // It's a malformed message.
                        // *shrugs*
                    }
                }, { noAck: true });
            });
        });
    }

    public publishEvent (topic : string, message : object) : void {
        this.channel.publish("events", topic, Buffer.from(JSON.stringify(message)));
    }

    public close () : void {
        this.channel.close();
        this.connection.close();
    }

}