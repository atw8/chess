export class LocalStorageManager {
    private static getItemHelper(key : string):string|undefined{
        let ret : string | null = localStorage.getItem(key);
        if(ret == null){
            return undefined;
        }

        return ret;
    }



    private static getGuestTokenStr():string{
        return "guestTokenStr";
    }
    public static getGuestToken():string|undefined{
        return LocalStorageManager.getItemHelper(LocalStorageManager.getGuestTokenStr());
    }
    public static setGuestToken(guestToken : string){
        localStorage.setItem(LocalStorageManager.getGuestTokenStr(), guestToken);
    }
}

/*
export enum LocalStorageManager {
    TOKEN = "TOKEN",
}
*/