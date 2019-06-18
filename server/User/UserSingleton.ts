const uuidv4 = require('uuid/v4');

export class UserSingleton {

    private playerIdCounter : number;
    private guestTokenPlayerIdMap : Map<string, number>;
    //private guestTokenPlayerIdMap : { [key : string] : number};

    private constructor(){
        this.playerIdCounter = 0;
        this.guestTokenPlayerIdMap = new Map<string, number>();
    }

    private static gInstance : UserSingleton | null = null;
    public static getInstance():UserSingleton{
        if(this.gInstance == null){
            this.gInstance = new UserSingleton();
        }

        return this.gInstance;
    }


    public getUserDataGorGuestToken(guestToken ?: string):{guestToken : string, playerId : number}{
        if(guestToken == undefined){
            guestToken = <string>uuidv4();
        }


        if(!this.guestTokenPlayerIdMap.has(guestToken)){
            this.guestTokenPlayerIdMap.set(guestToken, this.playerIdCounter);
            this.playerIdCounter += 1;
        }

        return {guestToken : guestToken, playerId : <number>this.guestTokenPlayerIdMap.get(guestToken)};
    }
}