import Transport from 'winston-transport';
import { createClient } from '@supabase/supabase-js';
import { SupabaseQueryBuilder } from '@supabase/supabase-js/dist/module/lib/SupabaseQueryBuilder';

interface TransportStreamOptionsExtra extends Transport.TransportStreamOptions {
    name: string;
    tableName: string;
    supabase: {
        url: string;
        secret: string;
    };
}

export class SupabaseTransport extends Transport {
    name: string;
    logsTable: SupabaseQueryBuilder<any>;
    constructor(options: TransportStreamOptionsExtra) {
        super(options);

        if (!options.tableName || !options.supabase.url || !options.supabase.secret) {
            throw new Error("SupabaseTransport Object Cannot Missing Options And Cannot Be created");
        }

        this.name = options.name || 'Supabase-Logger';

        this.level = options.level || 'debug';

        this.silent = options.silent || false;

        const tableName = options.tableName;

        const supabaseClient = createClient(options.supabase.url, options.supabase.secret);

        this.logsTable = supabaseClient.from(tableName);

    }

    async log(args: any, callback: () => void) {
        const { logsTable } = this;
        const { level, host, service, env, message, requestId, stack, ...meta } = args;
        setImmediate(() => {
            this.emit('logged', args);
        });
        const error_type = stack && stack.split(":")[0] || null;
        await logsTable.insert([
            { level, host, service, env, message, request_id: requestId, stack: stack && stack.split('\n') || null, meta }
        ]);
        callback();
    }
}