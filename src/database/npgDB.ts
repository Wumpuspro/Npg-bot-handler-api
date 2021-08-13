import mongoose, { Schema } from "mongoose";
import { Client, Collection, VoiceBasedChannelTypes } from "discord.js";

export class npgDB {
    public schema = mongoose.model<npgDBSchema>(
        "recondb-collection",
        new Schema({
            key: String,
            value: mongoose.SchemaTypes.Mixed,
        })
    );
    public dbCollection: Collection<string, any> = new Collection();
    public client: Client;

    /**
     * @name npgDB
     * @kind constructor
     * @param {reconDBOptions} options options to use the database
     */

    constructor(options: npgDBOptions) {
        this.client = options.client;
        if (mongoose.connection.readyState !== 1) {
            if (!options.mongooseConnectionString)
                throw new Error(
                    "There is no established  connection with mongoose and a mongoose connection is required!"
                );

            mongoose.connect(options.mongooseConnectionString, {
                useUnifiedTopology: true,
                useNewUrlParser: true,
            });
        }
        this.client.on("ready", () => this.ready());
    }

    private ready(): void {
        this.schema.find().then((data) => {
            data.forEach(({ key, value }) => {
                this.dbCollection.set(key, value);
            });
        });
    }

    /**
     * @method
     * @param key  The key, so you can get it with <MongoClient>.get("key")
     * @param value value The value which will be saved to the key
     * @description saves data to mongodb
     * @example <npgDB>.set("test","js is cool")
     */
    public set(key: string, value: any) {
        if (!key || !value) return;
        this.schema.findOne({ key }, async (err, data) => {
            if (err) throw err;
            if (data) data.value = value;
            else data = new this.schema({ key, value });

            data.save();
            this.dbCollection.set(key, value);
        });
    }

    /**
     * @method
     * @param key They key you wish to delete
     * @description Removes data from mongodb
     * @example <npgDB>.delete("test")
     */
    public delete(key) {
        if (!key) return;
        this.schema.findOne({ key }, async (err, data) => {
            if (err) throw err;
            if (data) await data.delete();
        });
        this.dbCollection.delete(key);
    }

    /**
     * @method
     * @param key The key you wish to get data
     * @description Gets data from the database with a key
     * @example <reconDB>.get('key1')
     */
    public get(key): Promise<any> {
        if (!key) return;
        return this.dbCollection.get(key);
    }

    public collection(): Collection<string, any> {
        return this.dbCollection;
    }
}

export interface npgDBOptions {
    /**
     * discord.js client
     */
    client: Client;

    /**
     * mongodb compass connection string
     */
    mongooseConnectionString: string;
}

export interface npgDBSchema {
    key: string;
    value: any;
}
