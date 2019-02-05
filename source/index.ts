import AMQPMessageBroker from "./MessageBrokers/AMQP";
import EnvironmentVariableConfigurationSource from "./ConfigurationSources/EnvironmentVariables";

const mb : AMQPMessageBroker = new AMQPMessageBroker(
    new EnvironmentVariableConfigurationSource()
);