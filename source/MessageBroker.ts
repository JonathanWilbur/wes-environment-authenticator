import { UniquelyIdentified } from "wildboar-microservices-ts/dist/interfaces/UniquelyIdentified";

export default
interface MessageBroker extends UniquelyIdentified {
    close () : void;
}