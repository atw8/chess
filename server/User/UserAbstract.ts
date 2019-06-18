import {ServerClientMessage} from "../../shared/MessageTypes";

export interface UserAbstract {
    emit(serverClientMessage : ServerClientMessage):void;
}