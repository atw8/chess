import {
    OnRoomGetListMessage,
    OnRoomJoinMessage,
    OnLoginGuestMessage,
    OnRoomMakeMoveMessage
} from "../../shared/MessageTypes";

export interface SocketClientInterface {
    OnConnect() : void;
    OnDisconnect() : void;

    OnLoginGuest(onLoginGuestMsg :OnLoginGuestMessage) :void;

    OnRoomGetList(onGetRoomListMsg : OnRoomGetListMessage):void;
    OnRoomJoin(onJoinRoomMsg : OnRoomJoinMessage):void;
    OnRoomMakeMove(onRoomMakeMoveMsg : OnRoomMakeMoveMessage):void;
}