"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const AMQP_1 = require("./MessageBrokers/AMQP");
const EnvironmentVariables_1 = require("./ConfigurationSources/EnvironmentVariables");
const mb = new AMQP_1.default(new EnvironmentVariables_1.default());
//# sourceMappingURL=index.js.map