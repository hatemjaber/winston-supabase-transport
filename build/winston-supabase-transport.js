"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SupabaseTransport = void 0;
const tslib_1 = require("tslib");
const winston_transport_1 = tslib_1.__importDefault(require("winston-transport"));
const supabase_js_1 = require("@supabase/supabase-js");
class SupabaseTransport extends winston_transport_1.default {
    constructor(options) {
        super(options);
        if (!options.tableName || !options.supabase.url || !options.supabase.secret) {
            throw new Error("SupabaseTransport Object Cannot Missing Options And Cannot Be created");
        }
        this.name = options.name || 'Supabase-Logger';
        this.level = options.level || 'debug';
        this.silent = options.silent || false;
        const tableName = options.tableName;
        const supabaseClient = (0, supabase_js_1.createClient)(options.supabase.url, options.supabase.secret);
        this.logsTable = supabaseClient.from(tableName);
    }
    log(args, callback) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            const { logsTable } = this;
            const { level, host, service, env, message, requestId, stack } = args, meta = tslib_1.__rest(args, ["level", "host", "service", "env", "message", "requestId", "stack"]);
            setImmediate(() => {
                this.emit('logged', args);
            });
            const error_type = stack && stack.split(":")[0] || null;
            yield logsTable.insert([
                { level, host, service, env, message, request_id: requestId, stack: stack && stack.split('\n') || null, meta }
            ]);
            callback();
        });
    }
}
exports.SupabaseTransport = SupabaseTransport;
