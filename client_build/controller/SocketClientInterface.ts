import {OnGetRoomsListMessage, OnLoginGuestMessage} from "../../shared/MessageTypes";

export interface SocketClientInterface {
    OnConnect() : void;
    OnDisconnect() : void;

    OnLoginGuest(onLoginGuestMessage :OnLoginGuestMessage) :void;
    OnGetRoomList(onGetRoomListMessage : OnGetRoomsListMessage):void;
}