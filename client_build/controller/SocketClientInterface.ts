import {
    OnRoomJoinMessage,
    OnUserLoginGuestMessage,
    OnRoomMakeMoveMessage, OnRoomJoinBroadcastMessage, OnRoomMakeMoveBroadcastMessage, OnRoomTimeOutBroadcastMessage
} from "../../shared/MessageTypes";

export interface SocketClientInterface {
    OnConnect() : void;
    OnDisconnect() : void;

    OnLoginGuest(onLoginGuestMsg :OnUserLoginGuestMessage) :void;

    OnRoomJoin(onRoomJoinMsg : OnRoomJoinMessage):void;
    OnRoomJoinBroadcast(onRoomJoinBroadcastMsg : OnRoomJoinBroadcastMessage):void;

    OnRoomMakeMove(onRoomMakeMoveMsg : OnRoomMakeMoveMessage):void;
    OnRoomMakeMoveBroadcast(onRoomMakeMoveBroadcastMsg : OnRoomMakeMoveBroadcastMessage):void;

    OnRoomTimeOutBroadcast(onRoomTimeOutBroadcast : OnRoomTimeOutBroadcastMessage):void;
}