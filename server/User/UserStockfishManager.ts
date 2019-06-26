import {SocketServerAgent} from "../SocketServerAgent";
import {UserSingleton} from "./UserSingleton";
import {
    MessageType,
    OnRoomGetRoomStateMessage,
    OnRoomJoinMessage,
    OnRoomMultiplayerStateBroadcastMessage,
    OnUserLoginGuestMessage,
    OpRoomGetRoomStateMessage,
    OpRoomJoinMessage,
    OpRoomMakeVoteMessage,
    OpRoomMakeVoteMessageType,
    OpUserLoginGuestMessage,
    RoomInitConfig,
    RoomStateConfig,
    ServerClientMessage
} from "../../shared/MessageTypes";

import {SideType} from "../../shared/engine/SideType";
import {ChessEngine} from "../../shared/engine/ChessEngine";
import {RoomStateEnum} from "../../shared/RoomStateEnum";
import {ChessGameStateEnum} from "../../shared/engine/ChessGameStateEnum";
import {Stockfish} from "../Stockfish"


export class UserStockfishManager {
    private socketServerAgent : SocketServerAgent;

    //private uciMoveStacks : { [key : number] : string[]};
    private chessEngines : {[key : number] : ChessEngine} = {};

    private playerIdMap : Map<number, {setOptions : Stockfish.SetOptions, goOptions : Stockfish.GoOptions}>;
    private playerIds : number[];
    private representPlayerId : number;
    private wbPlayerIds : {[key : number] : {[key in SideType] : number[]}} = {};

    constructor(socketServerAgent : SocketServerAgent){
        this.socketServerAgent = socketServerAgent;
    }

    public init(stockfishParams : {setOptions : Stockfish.SetOptions, goOptions : Stockfish.GoOptions}[]){
        this.playerIdMap = new Map<number, {setOptions: Stockfish.SetOptions, goOptions: Stockfish.GoOptions}>()
        this.playerIds = [];
        for(let i = 0; i < stockfishParams.length; i++) {
            let userData = UserSingleton.getInstance().getUserDataForGuestToken();
            this.playerIdMap.set(userData.playerId, stockfishParams[i]);

            this.playerIds.push(userData.playerId);
        }

        this.representPlayerId = this.playerIds[this.playerIds.length - 1];

        this.socketServerAgent.OpRoomGetRoomState(this.representPlayerId, new OpRoomGetRoomStateMessage({}));
    }


    public emit(playerId : number, serverClientMessage : ServerClientMessage){
        if(!this.playerIdMap.has(playerId)){
            return;
        }

        switch(serverClientMessage.getMessageType()){
            case MessageType.OnRoomGetRoomState:
                if(playerId == this.representPlayerId){
                    let msg = <OnRoomGetRoomStateMessage>serverClientMessage;

                    for(let i = 0; i < msg.roomIds.length; i++){
                        let roomId = msg.roomIds[i];

                        let opRoomJoinMessage = new OpRoomJoinMessage({roomId : roomId});

                        for(let j = 0; j < this.playerIds.length; j++){
                            this.socketServerAgent.OpRoomJoin(this.playerIds[j], opRoomJoinMessage);
                        }
                    }
                }
                break;
            case MessageType.OnRoomJoin:
            {
                let msg = <OnRoomJoinMessage>serverClientMessage;
                let roomId = <number>msg.roomId;
                let roomInitConfig = <RoomInitConfig>msg.roomInitConfig;
                let roomStateConfig = <RoomStateConfig>msg.roomStateConfig;

                if(roomStateConfig.mySideType != undefined){
                    if(this.wbPlayerIds[roomId] == undefined){
                        //@ts-ignore
                        this.wbPlayerIds[roomId] = {};
                        for(let sideType = SideType.FIRST_SIDE; sideType <= SideType.LAST_SIDE; sideType++){
                            this.wbPlayerIds[roomId][sideType] = [];
                        }
                    }
                    this.wbPlayerIds[roomId][roomStateConfig.mySideType].push(playerId);
                }


                if(playerId == this.representPlayerId){
                    this.chessEngines[roomId] = new ChessEngine(roomInitConfig);

                    for(let i = 0; i < roomStateConfig.sanMoves.length; i++){
                        this.chessEngines[roomId].doMoveSan(roomStateConfig.sanMoves[i]);
                    }
                    {
                        let m_askDrawMap = roomStateConfig.askDrawMap;
                        let m_isLoseByTime = roomStateConfig.isLoseByTimeMap;
                        let m_isResignMap = roomStateConfig.isResignMap;

                        for (let sideType = SideType.FIRST_SIDE; sideType <= SideType.LAST_SIDE; sideType++) {
                            this.chessEngines[roomId].setIsAskForDraw(sideType, m_askDrawMap[sideType]);
                            this.chessEngines[roomId].setIsLoseByTime(sideType, m_isLoseByTime[sideType]);
                            this.chessEngines[roomId].setIsResign(sideType, m_isResignMap[sideType]);
                        }
                    }

                    this.OpRoomMakeVote(roomId);
                }
            }
                break;
            case MessageType.OnRoomMultiplayerStateBroadcast:
            {
                if(playerId == this.representPlayerId){
                    let msg = <OnRoomMultiplayerStateBroadcastMessage>serverClientMessage;
                    let roomId = msg.roomId;

                    if(msg.roomState == RoomStateEnum.END){
                        delete this.chessEngines[roomId];
                        delete this.wbPlayerIds[roomId];


                        this.socketServerAgent.OpRoomGetRoomState(playerId, new OpRoomGetRoomStateMessage({}));
                    }else {
                        this.chessEngines[roomId].doMoveSan(msg.sanMove);
                        this.OpRoomMakeVote(roomId);
                    }
                }

            }
            break;
        }
    }


    public OpRoomMakeVote(roomId : number){
        //this.uciMoveStacks[roomId] = [];

        if(this.chessEngines[roomId].getGameState() != ChessGameStateEnum.NORMAL){
            return;
        }


        let fenStr = this.chessEngines[roomId].getLastFenStr();
        let moveTurn = this.chessEngines[roomId].getMoveTurn();



        let playerIdArray : number[];
        if(this.wbPlayerIds[roomId] != undefined){
            playerIdArray = this.wbPlayerIds[roomId][moveTurn];
        }else {
            playerIdArray = this.playerIds;
        }

        for(let i = 0; i < playerIdArray.length; i++){
            let playerId = playerIdArray[i];
            let stockfishParam = <{setOptions : Stockfish.SetOptions, goOptions : Stockfish.GoOptions}>this.playerIdMap.get(playerId);


            let uciMoveSet : Set<string> = new Set<string>();
            let uciMoveArray : string[] = [];

            let callback = (firstToken : Stockfish.FirstToken, table : Stockfish.InfoTable | Stockfish.BestMoveTable)=>{
                if(fenStr != this.chessEngines[roomId].getLastFenStr()){
                    return;
                }

                let uciMove : string | null = null;
                if(firstToken == Stockfish.FirstToken.info){
                    let infoTable = <Stockfish.InfoTable>table;
                    let pv = infoTable.pv;
                    if(pv != undefined){
                        let pvSplit = pv.split(" ");
                        if(pvSplit[0] != undefined){
                            uciMove = pvSplit[0];
                        }
                    }
                }else if(firstToken == Stockfish.FirstToken.bestmove){
                    let bestMoveTable = <Stockfish.BestMoveTable>table;
                    let bestMove = bestMoveTable.bestmove;
                    if(bestMove != undefined){
                        uciMove = bestMove;
                    }
                }

                if(uciMove != null){
                    if(!uciMoveSet.has(uciMove)){
                        uciMoveSet.add(uciMove);
                        uciMoveArray.push(uciMove);
                    }
                }

                if(firstToken == Stockfish.FirstToken.bestmove){
                    let callback2 : () => void;
                    let callCallback2 : () => void;

                    callCallback2 = ()=>{
                        let minInterval = 4;
                        let maxInterval = 10;


                        let interval = minInterval + (maxInterval - minInterval)*Math.random();

                        setTimeout(callback2, interval * 1000);
                    };

                    callback2 = ()=> {
                        if(this.chessEngines[roomId] == undefined){
                            return;
                        }
                        if(fenStr != this.chessEngines[roomId].getLastFenStr()){
                            return;
                        }


                        let uciMove = uciMoveArray[Math.floor(Math.random()*uciMoveArray.length)];

                        let sanMove = this.chessEngines[roomId].getSANMoveForCurrentBoardAndUCIMove(uciMove);
                        if(sanMove != null){
                            let opRoomMakeVoteMsgType :OpRoomMakeVoteMessageType= {roomId : roomId, myVoting: sanMove};
                            this.socketServerAgent.OpRoomMakeVote(playerId, new OpRoomMakeVoteMessage(opRoomMakeVoteMsgType));
                        }


                        callCallback2();
                    };



                    callCallback2();
                }
            };






            Stockfish.getInstance().thinkMoveByAI(fenStr, callback, stockfishParam.setOptions, stockfishParam.goOptions);
        }
    }



    /*
    public OpRoomMakeVoteTick(){
        for(let _roomId in this.uciMoveStacks){
            let roomId = parseInt(_roomId);

            let uciMoveStack = this.uciMoveStacks[roomId];
            if(uciMoveStack == undefined){
                return;
            }
            let uciMove = uciMoveStack.shift();
            if(uciMove == undefined){
                return;
            }
            let sanMove = this.chessEngines[roomId].getSANMoveForCurrentBoardAndUCIMove(uciMove);
            if(sanMove == null){
                return;
            }

            let opRoomMakeVoteMsgType :OpRoomMakeVoteMessageType= {roomId : roomId, myVoting: sanMove};
            this.socketServerAgent.OpRoomMakeVote(this.playerId, new OpRoomMakeVoteMessage(opRoomMakeVoteMsgType));
        }

        let minTimeOut = 3000;
        let maxTimeOut = 8000;
        let timeOut = minTimeOut + Math.random()*(maxTimeOut - minTimeOut);

        setTimeout(this.OpRoomMakeVoteTick.bind(this), timeOut);
    }
    */
}

/*
function getThinkingProfile(intervals : number[],
                            stockfishParams : {setOptions : Stockfish.SetOptions, goOptions : Stockfish.GoOptions},
                            callback : (uciMove : string)=>void){


}
*/