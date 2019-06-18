import {Stockfish} from "../Stockfish"
import {UserAbstract} from "./UserAbstract";
import {
    ServerClientMessage,
    MessageType,
    OnUserLoginGuestMessage,
    OpRoomJoinMessage,
    OnRoomJoinMessage,
    RoomInitConfig,
    RoomStateConfig,
    OpRoomGetRoomStateMessage,
    OpRoomMakeVoteMessage,
    OnRoomMultiplayerStateBroadcastMessage,
    OpUserLoginGuestMessage, OnRoomGetRoomStateMessage
} from "../../shared/MessageTypes";
import {SocketServerAgent} from "../SocketServerAgent";
import {ChessEngine} from "../../shared/engine/ChessEngine";

import {SideType} from "../../shared/engine/SideType";

import {ChessGameStateEnum} from "../../shared/engine/ChessGameStateEnum";
import {RoomStateEnum} from "../../shared/RoomStateEnum";
import FirstToken = Stockfish.FirstToken;

export class UserStockfish implements UserAbstract{
    private setOptions : Stockfish.SetOptions;
    private goOptions : Stockfish.GoOptions;

    private socketServerAgent : SocketServerAgent;


    private uciMoveStack : { [key : number] : string[]};
    private chessEngines : {[key : number] : ChessEngine};

    constructor(socketServerAgent : SocketServerAgent, setOptions : Stockfish.SetOptions, goOptions : Stockfish.GoOptions){
        this.socketServerAgent = socketServerAgent;

        this.setOptions = setOptions;
        this.goOptions = goOptions;


        this.uciMoveStack = {};
        this.chessEngines = {};


    }

    private playerId : number;
    private guestToken : string;

    public emit(serverClientMessage : ServerClientMessage){
        switch(serverClientMessage.getMessageType()){
            case MessageType.OnLoginGuest:
            {
                let msg = <OnUserLoginGuestMessage>serverClientMessage;
                this.playerId = msg.playerId;
                this.guestToken = msg.guestToken;


                this.socketServerAgent.OpRoomGetRoomState(this.playerId, new OpRoomGetRoomStateMessage({}));
            }
            break;
            case MessageType.OnRoomGetRoomState:
            {
                let msg = <OnRoomGetRoomStateMessage>serverClientMessage;

                for(let i = 0; i < msg.roomIds.length; i++){
                    let opRoomJoinMessage = new OpRoomJoinMessage({roomId : msg.roomIds[i]});
                    this.socketServerAgent.OpRoomJoin(this.playerId, opRoomJoinMessage)
                }
            }
            break;
            case MessageType.OnRoomJoin:
            {
                let msg = <OnRoomJoinMessage>serverClientMessage;

                let roomId = <number>msg.roomId;
                let roomInitConfig = <RoomInitConfig>msg.roomInitConfig;
                let roomStateConfig = <RoomStateConfig>msg.roomStateConfig;

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
            break;
            case MessageType.OnRoomMultiplayerStateBroadcast:
            {
                let msg = <OnRoomMultiplayerStateBroadcastMessage>serverClientMessage;
                let roomId = msg.roomId;

                if(msg.roomState == RoomStateEnum.END){
                    delete this.chessEngines[roomId];

                    this.socketServerAgent.OpRoomGetRoomState(this.playerId, new OpRoomGetRoomStateMessage({}));
                }else {
                    this.chessEngines[roomId].doMoveSan(msg.sanMove);
                    this.OpRoomMakeVote(roomId);
                }
            }
            break;
        }
    }

    public OpRoomMakeVote(roomId : number){
        this.uciMoveStack[roomId] = [];
        if(this.chessEngines[roomId].getGameState() != ChessGameStateEnum.NORMAL){
            return;
        }


        let fenStr = this.chessEngines[roomId].getLastFenStr();
        let callback = (firstToken : Stockfish.FirstToken, table : Stockfish.InfoTable | Stockfish.BestMoveTable)=>{
            if(fenStr != this.chessEngines[roomId].getLastFenStr()){
                return;
            }

            let uciMove : string | null = null;
            if(firstToken == FirstToken.info){
                let infoTable = <Stockfish.InfoTable>table;
                let pv = infoTable.pv;
                if(pv != undefined){
                    let pvSplit = pv.split(" ");
                    if(pvSplit[0] != undefined){
                        uciMove = pvSplit[0];
                    }
                }
            }else if(firstToken == FirstToken.bestmove){
                let bestMoveTable = <Stockfish.BestMoveTable>table;
                let bestMove = bestMoveTable.bestmove;
                if(bestMove != undefined){
                    uciMove = bestMove;
                }
            }

            if(uciMove != null){
                let topUciMove = this.uciMoveStack[roomId].
                //this.uciMoveStack[roomId].push(uciMove);
            }

        };

        Stockfish.getInstance().thinkMoveByAI(fenStr, callback, this.setOptions, this.goOptions);
    }



}