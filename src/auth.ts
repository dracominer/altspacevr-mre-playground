

import AppData from "./saveData";


export default class Auth {

    private sessionID : string;
    private data : AppData = undefined;
    

    public constructor (id : string){
        this.sessionID = id;
    }

    public async loadAuthData(path : string){ 
        // load publically so we can await
        this.data = new AppData();
        this.data.loadData(path, this.sessionID); // this not being an async should lock?
        console.log(this.data.data)
    }

    public getData(key : string ) : any {
        if(this.data) return undefined; // still loading
        return this.data.getData(key);
    }


}