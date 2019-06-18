import {UserAbstract} from "./UserAbstract";
import {ServerClientMessage} from "../../shared/MessageTypes";

import * as SocketIO from "socket.io";

export class UserNormal implements UserAbstract {
    private socket : SocketIO.Socket;
    constructor(socket : SocketIO.Socket){
        this.socket = socket;
    }

    public emit(serverClientMessage : ServerClientMessage){
        this.socket.emit(serverClientMessage.getMessageType(), JSON.stringify(serverClientMessage));
    }
}
