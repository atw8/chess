import {
    OnRoomGetListMessage,
    OnRoomJoinMessage,
    OnLoginGuestMessage,
    OnRoomMakeMoveMessage, OnRoomJoinBroadcastMessage
} from "../../shared/MessageTypes";

export interface SocketClientInterface {
    OnConnect() : void;
    OnDisconnect() : void;

    OnLoginGuest(onLoginGuestMsg :OnLoginGuestMessage) :void;

    OnRoomGetList(onGetRoomListMsg : OnRoomGetListMessage):void;


    OnRoomJoin(onRoomJoinMsg : OnRoomJoinMessage):void;
    OnRoomJoinBroadcast(onRoomJoinBroadcastMsg : OnRoomJoinBroadcastMessage):void;

    OnRoomMakeMove(onRoomMakeMoveMsg : OnRoomMakeMoveMessage):void;
}