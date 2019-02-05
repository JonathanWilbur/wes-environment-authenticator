import ConfigurationSource from "../ConfigurationSource";
import { TypedKeyValueStore } from "wildboar-microservices-ts";
const uuidv4 : () => string = require("uuid/v4");

export default
class EnvironmentVariableConfigurationSource implements ConfigurationSource,TypedKeyValueStore {

    public readonly id : string = `urn:uuid:${uuidv4()}`;
    public readonly creationTime : Date = new Date();

    private transformKeyNameToEnvironmentVariableName (key : string) : string {
        return key.toUpperCase().replace(/\./g, "_");
    }

    public getBoolean(key : string) : boolean | undefined {
        if (key.length === 0) return undefined;
        const environmentVariableName : string =
            this.transformKeyNameToEnvironmentVariableName(key);
        const environmentVariable : string | undefined
            = (environmentVariableName in process.env ?
                process.env[environmentVariableName] : undefined);
        if (!environmentVariable) return undefined;
        if (/^\s*True\s*$/i.test(environmentVariable)) return true;
        if (/^\s*False\s*$/i.test(environmentVariable)) return false;
        if (/^\s*Yes\s*$/i.test(environmentVariable)) return true;
        if (/^\s*No\s*$/i.test(environmentVariable)) return false;
        if (/^\s*T\s*$/i.test(environmentVariable)) return true;
        if (/^\s*F\s*$/i.test(environmentVariable)) return false;
        if (/^\s*Y\s*$/i.test(environmentVariable)) return true;
        if (/^\s*N\s*$/i.test(environmentVariable)) return false;
        if (/^\s*1\s*$/i.test(environmentVariable)) return true;
        if (/^\s*0\s*$/i.test(environmentVariable)) return false;
        if (/^\s*\+\s*$/i.test(environmentVariable)) return true;
        if (/^\s*\-\s*$/i.test(environmentVariable)) return false;
        return undefined;
    }

    // TODO: Check for NaN, Infinity, etc.
    public getInteger(key : string) : number | undefined {
        if (key.length === 0) return undefined;
        const environmentVariableName : string =
            this.transformKeyNameToEnvironmentVariableName(key);
        const environmentVariable : string | undefined
            = (environmentVariableName in process.env ?
                process.env[environmentVariableName] : undefined);
        if (!environmentVariable) return undefined;
        try {
            return Number(environmentVariable);
        } catch (e) {
            return undefined;
        }
    }

    public getString(key : string) : string | undefined {
        if (key.length === 0) return undefined;
        const environmentVariableName : string =
            this.transformKeyNameToEnvironmentVariableName(key);
        return (environmentVariableName in process.env ?
            process.env[environmentVariableName] : undefined);
    }

    get queue_server_hostname () : string {
        const DEFAULT_VALUE : string = "localhost";
        const env : string | undefined = this.getString("queue.server.hostname");
        if (!env) return DEFAULT_VALUE;
        return env;
    }

    get queue_server_tcp_listening_port () : number {
        const DEFAULT_VALUE : number = 5672;
        const env : number | undefined = this.getInteger("queue.server.tcp.listening_port");
        if (!env) return DEFAULT_VALUE;
        return env;
    }

    get queue_username () : string {
        const DEFAULT_VALUE : string = "";
        const env : string | undefined = this.getString("queue.username");
        if (!env) return DEFAULT_VALUE;
        return env;
    }

    get queue_password () : string {
        const DEFAULT_VALUE : string = "";
        const env : string | undefined = this.getString("queue.password");
        if (!env) return DEFAULT_VALUE;
        return env;
    }

    get credentials () : { [ username : string ] : string } {
        const DEFAULT_VALUE : { [ username : string ] : string } = {};
        const env : string | undefined = this.getString("credentials");
        if (!env) return DEFAULT_VALUE;
        const ret : { [ username : string ] : string } = {};
        env.split(",").forEach((base64Creds : string) : void => {
            const cred : string = Buffer.from(base64Creds, "base64").toString();
            const [ username, password ] = cred.split(" ");
            if (!username || !password) return;
            ret[username] = password;
        });
        return ret;
    }

}