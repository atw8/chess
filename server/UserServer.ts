import {SocketServerAgent} from "./SocketServerAgent";
import * as SocketIO from "socket.io";
import {ClientServerMessage, OpUserLoginGuestMessage, OnUserLoginGuestMessage, ServerClientMessage} from "../shared/MessageTypes";

const uuidv4 = require('uuid/v4');

export class UserServer {
    private socketServerAgent : SocketServerAgent;

    private playerIdCounter : number;
    private guestTokenPlayerIdMap : { [key : string] : number};

    constructor(socketServerAgent : SocketServerAgent){
        this.socketServerAgent = socketServerAgent;

        this.playerIdCounter = 0;
        this.guestTokenPlayerIdMap = {};
    }

    public guestLogin(opUserLoginGuestMsg : OpUserLoginGuestMessage, onUserLoginGuestMsg : OnUserLoginGuestMessage):void{
        let guestToken = opUserLoginGuestMsg.guestToken;
        if(typeof guestToken == "undefined"){
            guestToken = <string>uuidv4();
        }

        if(!(guestToken in this.guestTokenPlayerIdMap)){
            this.guestTokenPlayerIdMap[guestToken] = this.playerIdCounter;
            this.playerIdCounter += 1;
        }

        onUserLoginGuestMsg.guestToken = guestToken;
        onUserLoginGuestMsg.playerId = this.guestTokenPlayerIdMap[guestToken];
    }
}