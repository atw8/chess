import {
    OnRoomGetListMessage,
    OnRoomJoinMessage,
    OnUserLoginGuestMessage,
    OnRoomMakeMoveMessage, OnRoomJoinBroadcastMessage, OnRoomMakeMoveBroadcastMessage
} from "../../shared/MessageTypes";

export interface SocketClientInterface {
    OnConnect() : void;
    OnDisconnect() : void;

    OnLoginGuest(onLoginGuestMsg :OnUserLoginGuestMessage) :void;

    OnRoomGetList(onGetRoomListMsg : OnRoomGetListMessage):void;


    OnRoomJoin(onRoomJoinMsg : OnRoomJoinMessage):void;
    OnRoomJoinBroadcast(onRoomJoinBroadcastMsg : OnRoomJoinBroadcastMessage):void;

    OnRoomMakeMove(onRoomMakeMoveMsg : OnRoomMakeMoveMessage):void;
    OnRoomMakeMoveBroadcast(onRoomMakeMoveBroadcastMsg : OnRoomMakeMoveBroadcastMessage):void;
}