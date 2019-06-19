import {
    OnRoomJoinMessage,
    OnUserLoginGuestMessage,
    OnRoomMakeMoveMessage,
    OnRoomJoinBroadcastMessage,
    OnRoomMakeMoveBroadcastMessage,
    OnRoomTimeOutBroadcastMessage,
    OnRoomVotingUpdateBroadcastMessage,
    OnRoomMakeVoteMessage,
    OnRoomMultiplayerStateBroadcastMessage,
    OnRoomGetRoomStateMessage
} from "../../shared/MessageTypes";

export interface SocketClientInterface {
    OnConnect() : void;
    OnDisconnect(reason : "io server disconnect" | "io client disconnect" | "ping timeout" | "transport close") : void;
    OnConnectError() : void;
    OnConnectTimeOut() : void;

    OnLoginGuest(onLoginGuestMsg :OnUserLoginGuestMessage) :void;

    OnRoomGetRoomState(onRoomGetRoomStateMsg : OnRoomGetRoomStateMessage):void;

    OnRoomJoin(onRoomJoinMsg : OnRoomJoinMessage):void;
    OnRoomJoinBroadcast(onRoomJoinBroadcastMsg : OnRoomJoinBroadcastMessage):void;

    OnRoomMakeMove(onRoomMakeMoveMsg : OnRoomMakeMoveMessage):void;
    OnRoomMakeMoveBroadcast(onRoomMakeMoveBroadcastMsg : OnRoomMakeMoveBroadcastMessage):void;

    OnRoomTimeOutBroadcast(onRoomTimeOutBroadcastMsg : OnRoomTimeOutBroadcastMessage):void;

    OnRoomMakeVote(onRoomMakeVoteMsg : OnRoomMakeVoteMessage):void;
    OnRoomVotingUpdateBroadcast(onRoomVotingUpdateBroadcastMsg : OnRoomVotingUpdateBroadcastMessage):void;

    OnRoomMultiplayerStateBroadcast(onRoomMultiplayerStateBroadcastMsg : OnRoomMultiplayerStateBroadcastMessage):void;
}