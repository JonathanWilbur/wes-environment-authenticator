"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const uuidv4 = require("uuid/v4");
class EnvironmentVariableConfigurationSource {
    constructor() {
        this.id = `urn:uuid:${uuidv4()}`;
        this.creationTime = new Date();
    }
    transformKeyNameToEnvironmentVariableName(key) {
        return key.toUpperCase().replace(/\./g, "_");
    }
    getBoolean(key) {
        if (key.length === 0)
            return undefined;
        const environmentVariableName = this.transformKeyNameToEnvironmentVariableName(key);
        const environmentVariable = (environmentVariableName in process.env ?
            process.env[environmentVariableName] : undefined);
        if (!environmentVariable)
            return undefined;
        if (/^\s*True\s*$/i.test(environmentVariable))
            return true;
        if (/^\s*False\s*$/i.test(environmentVariable))
            return false;
        if (/^\s*Yes\s*$/i.test(environmentVariable))
            return true;
        if (/^\s*No\s*$/i.test(environmentVariable))
            return false;
        if (/^\s*T\s*$/i.test(environmentVariable))
            return true;
        if (/^\s*F\s*$/i.test(environmentVariable))
            return false;
        if (/^\s*Y\s*$/i.test(environmentVariable))
            return true;
        if (/^\s*N\s*$/i.test(environmentVariable))
            return false;
        if (/^\s*1\s*$/i.test(environmentVariable))
            return true;
        if (/^\s*0\s*$/i.test(environmentVariable))
            return false;
        if (/^\s*\+\s*$/i.test(environmentVariable))
            return true;
        if (/^\s*\-\s*$/i.test(environmentVariable))
            return false;
        return undefined;
    }
    getInteger(key) {
        if (key.length === 0)
            return undefined;
        const environmentVariableName = this.transformKeyNameToEnvironmentVariableName(key);
        const environmentVariable = (environmentVariableName in process.env ?
            process.env[environmentVariableName] : undefined);
        if (!environmentVariable)
            return undefined;
        try {
            return Number(environmentVariable);
        }
        catch (e) {
            return undefined;
        }
    }
    getString(key) {
        if (key.length === 0)
            return undefined;
        const environmentVariableName = this.transformKeyNameToEnvironmentVariableName(key);
        return (environmentVariableName in process.env ?
            process.env[environmentVariableName] : undefined);
    }
    get queue_server_hostname() {
        const DEFAULT_VALUE = "localhost";
        const env = this.getString("queue.server.hostname");
        if (!env)
            return DEFAULT_VALUE;
        return env;
    }
    get queue_server_tcp_listening_port() {
        const DEFAULT_VALUE = 5672;
        const env = this.getInteger("queue.server.tcp.listening_port");
        if (!env)
            return DEFAULT_VALUE;
        return env;
    }
    get queue_username() {
        const DEFAULT_VALUE = "";
        const env = this.getString("queue.username");
        if (!env)
            return DEFAULT_VALUE;
        return env;
    }
    get queue_password() {
        const DEFAULT_VALUE = "";
        const env = this.getString("queue.password");
        if (!env)
            return DEFAULT_VALUE;
        return env;
    }
    get credentials() {
        const DEFAULT_VALUE = {};
        const env = this.getString("credentials");
        if (!env)
            return DEFAULT_VALUE;
        const ret = {};
        env.split(",").forEach((base64Creds) => {
            const cred = Buffer.from(base64Creds, "base64").toString();
            const [username, password] = cred.split(" ");
            if (!username || !password)
                return;
            ret[username] = password;
        });
        return ret;
    }
}
exports.default = EnvironmentVariableConfigurationSource;
//# sourceMappingURL=EnvironmentVariables.js.map