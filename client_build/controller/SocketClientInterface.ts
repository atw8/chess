import {
    OnRoomJoinMessage,
    OnUserLoginGuestMessage,
    OnRoomMakeMoveMessage,
    OnRoomJoinBroadcastMessage,
    OnRoomMakeMoveBroadcastMessage,
    OnRoomTimeOutBroadcastMessage,
    OnRoomVotingUpdateBroadcastMessage, OnRoomMakeVoteMessage, OnRoomMultiplayerStateBroadcastMessage
} from "../../shared/MessageTypes";

export interface SocketClientInterface {
    OnConnect() : void;
    OnDisconnect() : void;

    OnLoginGuest(onLoginGuestMsg :OnUserLoginGuestMessage) :void;

    OnRoomJoin(onRoomJoinMsg : OnRoomJoinMessage):void;
    OnRoomJoinBroadcast(onRoomJoinBroadcastMsg : OnRoomJoinBroadcastMessage):void;

    OnRoomMakeMove(onRoomMakeMoveMsg : OnRoomMakeMoveMessage):void;
    OnRoomMakeMoveBroadcast(onRoomMakeMoveBroadcastMsg : OnRoomMakeMoveBroadcastMessage):void;

    OnRoomTimeOutBroadcast(onRoomTimeOutBroadcastMsg : OnRoomTimeOutBroadcastMessage):void;

    OnRoomMakeVote(onRoomMakeVoteMsg : OnRoomMakeVoteMessage):void;
    OnRoomVotingUpdateBroadcast(onRoomVotingUpdateBroadcastMsg : OnRoomVotingUpdateBroadcastMessage):void;

    OnRoomMultiplayerStateBroadcast(onRoomMultiplayerStateBroadcastMsg : OnRoomMultiplayerStateBroadcastMessage):void;
}