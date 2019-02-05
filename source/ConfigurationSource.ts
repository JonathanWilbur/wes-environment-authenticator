// import Temporal from "./Temporal";
// import UniquelyIdentified from "./UniquelyIdentified";
import { Temporal, UniquelyIdentified } from "wildboar-microservices-ts";

export default
interface ConfigurationSource extends Temporal, UniquelyIdentified {
    queue_server_hostname : string;
    queue_server_tcp_listening_port : number;
    queue_username : string;
    queue_password : string;
    credentials : { [ username : string ] : string };
}