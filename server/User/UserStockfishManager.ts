import {SocketServerAgent} from "../SocketServerAgent";
import {UserStockfish} from "./UserStockfish";
import {UserSingleton} from "./UserSingleton";
import {OnUserLoginGuestMessage, OpUserLoginGuestMessage} from "../../shared/MessageTypes";
import {Stockfish} from "../Stockfish"

export class UserStockfishManager {
    private socketServerAgent : SocketServerAgent;

    constructor(socketServerAgent : SocketServerAgent){
        this.socketServerAgent = socketServerAgent;

        let stockfishParams :{setOptions : Stockfish.SetOptions, goOptions : Stockfish.GoOptions}[] = [];
        for(let i = 0; i < 0; i++){
            stockfishParams.push({setOptions : {"Skill Level" : i, "MultiPV" : 2}, goOptions : {}});
        }

        for(let i = 0; i < stockfishParams.length; i++){
            let setOptions = stockfishParams[i].setOptions;
            let goOptions = stockfishParams[i].goOptions;

            let userStockfish = new UserStockfish(this.socketServerAgent, setOptions, goOptions);

            let opUserLoginGuestMsg = new OpUserLoginGuestMessage({});

            let onUserLoginGuestMsgType = UserSingleton.getInstance().getUserDataGorGuestToken(opUserLoginGuestMsg.guestToken);
            let onUserLoginGuestMsg = new OnUserLoginGuestMessage(onUserLoginGuestMsgType);

            let playerId = onUserLoginGuestMsg.playerId;

            this.socketServerAgent.addPlayerIdMap(playerId, userStockfish);


            this.socketServerAgent.emitMessage(playerId, opUserLoginGuestMsg, onUserLoginGuestMsg);
        }

    }
}