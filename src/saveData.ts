

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


export default class AppData {
    private path : string;

    public data : WorldData; // store the data here.

    public loadData(path : string, key : string){
        // Loads the data from the appropriate JSON file with the data from the specific key.
        let u : string;
        let universe : UniverseData;
        u = file.readFileSync(path);
        universe = JSON.parse(u) as UniverseData;
        this.data = universe[key];
        if(this.data){
            console.log("loaded world data for \""+key+"\" from \"" + path + "\"");
        }else{
            console.error("Failed to load world data for \""+key+"\" from \"" + path + "\"");
        }

    }

}