

export type WorldData = {
	owner : string;
	admins : string[];

	displayText : string;
	

}
export enum AccessLevel  {
	Deny, Admin, Owner
}

export interface UniverseData {
	[key:string] : WorldData;
}

const file = require("fs");

import * as MRE from '@microsoft/mixed-reality-extension-sdk';

export class AppData {
    private path : string;

    public data : WorldData = undefined; // store the data here.
    private loaded : boolean;

    public constructor(p : string){
        this.path = p;
    }

    public async loadData( key : string){
        // Loads the data from the appropriate JSON file with the data from the specific key.
        let u : string;
        let universe : UniverseData;
        try {
            universe = await this.getUniverse();
            this.data = universe[key];
            console.log("Loaded world data : \n" + JSON.stringify(this.data, null, 2) + "\n");
            this.loaded = true;
        }catch (err){
            console.error("Failed to load world data for \""+key+"\" from \"" + this.path + "\"\n\t" + err);
            this.loaded = false;
        }
    }

    public async save(key : string){
        if(!this.loaded){
            console.warn("Saving without first loading data, this will override the file");
        }
        let uni : UniverseData;
        try {
            uni = await this.getUniverse();
            if(this.data != undefined) uni[key] = this.data;
            console.log("Attempting to write data to " + this.path);
            file.writeFileSync(this.path, JSON.stringify(uni));
        }catch(err){
            console.error("Failed to save world data to \"" + this.path + "\"");
        }
            
    }

    private async getUniverse() : Promise<UniverseData> {
        let u : string;
        let universe : UniverseData;
        try {
            console.log("Starting read file \"" + this.path + "\"");
            u = file.readFileSync(this.path);
            console.log("Json data read : \"" + u + "\"");
            universe = JSON.parse(u) as UniverseData;
            console.log("Json object parsed : \"" + JSON.stringify(universe) + "\"");
            return universe;
        }catch (err){
            console.error("Failed to load universe from \"" + this.path + "\"\n\t" + err);
            this.loaded = false;
        }
        return {} as UniverseData;

    }

}