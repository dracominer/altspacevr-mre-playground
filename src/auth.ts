

import {AppData, WorldData, AccessLevel} from "./saveData";


export default class Authenticator {

    private sessionID : string;
    private appData : AppData = undefined;
    

    public constructor (id : string){
        this.sessionID = id;
    }

    public async loadAuthData(path : string){ 
        // load publically so we can await
        this.appData = new AppData(path);
        this.appData.loadData(this.sessionID); // this not being an async should lock?
        console.log("Data : " + this.appData.data)
    }

    public getData() : WorldData {
        if(this.appData == undefined || this.appData == null) return undefined; // still loading
        return this.appData.data;
    }
    public setData(d : WorldData){
        this.appData.data = d;
    }

    public getAccessLevel(s_guid : string) : AccessLevel {
		if(this.appData.data.owner == s_guid) return AccessLevel.Owner; // owner rights
		for (let s of this.appData.data.admins){
			if(s == s_guid) return AccessLevel.Admin; // admin rights
		}
		return AccessLevel.Deny; // no rights
    }
    
    public async save(){
        this.appData.save(this.sessionID);
    }
}