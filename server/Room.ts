import {RoomServer} from "./RoomServer";
import {ChessEngine} from "../shared/engine/ChessEngine";
import {RoomInitConfig, RoomStateConfig} from "../shared/MessageTypes";


import {SideType} from "../shared/engine/SideType";

export class Room {
    private tokens : Set<string>;

    private roomServer : RoomServer;

    private roomInitConfig : RoomInitConfig;
    private roomStateConfig : RoomStateConfig;
    //private roomVoteConfig : RoomVoteConfig;


    private chessEngine : ChessEngine;

    constructor(roomServer : RoomServer, roomInitConfig : RoomInitConfig){
        this.tokens = new Set<string>();

        this.roomServer = roomServer;
        this.roomInitConfig = roomInitConfig;


        this.chessEngine = new ChessEngine(this.roomInitConfig);

        this.roomStateConfig = new RoomStateConfig();


        this.startGame();
    }

    public getRoomInitConfig():RoomInitConfig{
        return this.roomInitConfig;
    }
    public getRoomStateConfig():RoomStateConfig{
        return this.roomStateConfig;
    }


    public async joinRoom(token : string){
        this.tokens.add(token);
    }

    public async quitRoom(token : string){
        this.tokens.delete(token);
    }




    public updateRoomStateConfig(){
        this.roomStateConfig.currentFenStr = this.chessEngine.getLastFenStr();
        this.roomStateConfig.sanMoves = this.chessEngine.getSanMoves();



        this.roomStateConfig.voteConfig = {};
    }

    public voteMove(token : string, sanMove : string): void {

    }


    public doMove(){

    }
}
