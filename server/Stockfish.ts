import * as child_process from "child_process";
import * as stream from "stream";


export namespace Stockfish {
    export const enum FirstToken {
        info = "info",
        bestmove = "bestmove",
        readyok = "readyok"
    }

    export interface SetOptions {
        "Contempt" ?: number; //option name Contempt type spin default 24 min -100 max 100
        "Analysis Contempt" ?: "White" | "Black" | "Off"; //option name Analysis Contempt type combo default Both var Off var White var Black var Both
        "Threads" ?: number; //option name Threads type spin default 1 min 1 max 512
        "Hash" ?: number; //option name Hash type spin default 16 min 1 max 131072
        "Clear Hash" ?: string | number; //option name Clear Hash type button
        "Ponder" ?: boolean; //option name Ponder type check default false
        "MultiPV" ?: number; //option name MultiPV type spin default 1 min 1 max 500
        "Skill Level" ?: number; //option name Skill Level type spin default 20 min 0 max 20
        "Move Overhead" ?: number; //option name Move Overhead type spin default 30 min 0 max 5000
        "Minimum Thinking Time" ?: number; //option name Minimum Thinking Time type spin default 20 min 0 max 5000
        "Slow Mover" ?: number; //option name Slow Mover type spin default 84 min 10 max 1000
        "UCI_Chess960" ?: boolean; //option name UCI_Chess960 type check default false
        "UCI_AnalyseMode" ?: boolean; //option name UCI_AnalyseMode type check default false
    }

    export interface GoOptions {
        "searchmoves" ?: string;
        "ponder" ?: string;
        "wtime" ?: number;
        "btime" ?: number;
        "winc" ?: number;
        "binc" ?: number;
        "movestogo" ?: number;
        "depth" ?: number;
        "nodes" ?: number;
        "mate" ?: number;
        "movetime" ?: number;
        "infinite" ?: string;
    }


    export interface InfoTable {
        "info" ?: string;
        "depth" ?: string;
        "seldepth" ?: string;
        "time" ?: string;
        "nodes" ?: string;
        "pv" ?: string;
        "multipv" ?: string;

        "score" ?: string;
        "cp" ?: string;
        "mate" ?: string;
        "lowerbound" ?: string;
        "upperbound" ?: string;

        "currmove" ?: string;
        "currmovenumber" ?: string;
        "hashfull" ?: string;
        "nps" ?: string;
        "tbhits" ?: string;
        "cpuload" ?: number;
        "string" ?: string;
        "refutation" ?: string;
        "currline" ?: string;
    }
    export interface BestMoveTable {
        "bestmove" ?: string;
        "ponder" ?: string;
    }

    export interface ThinkState {
        "callback" : (firstToken : FirstToken, table : InfoTable | BestMoveTable) => void;

        "arguments" : string[];
        "argumentNum" : number;

        "isInfinite" : boolean;
        "priority" : number;
        "mask" : number;
    }
}


export class Stockfish {
    private prc : child_process.ChildProcess;
    private prcStdOut : stream.Readable;
    private prcStdIn : stream.Writable;

    private thinkStates : Stockfish.ThinkState[];
    private isReady : boolean;

    private constructor(){
        this.prc = <child_process.ChildProcess> child_process.spawn('./stockbinary');

        this.prc.on("error", (err : Error) => {
            console.log(err.message);
        });

        this.prcStdOut = <stream.Readable>this.prc.stdout;
        this.prcStdIn = <stream.Writable>this.prc.stdin;


        this.prcStdOut.setEncoding('utf8');
        this.prcStdOut.on('data',  (data : any) =>{
            let str = data.toString();
            let lines = str.split(/\r?\n/);

            for(let i = 0; i < lines.length; i++){
                let line = lines[i];
                if(line != ""){
                    this.onOutput(lines[i]);
                }

            }
        });

        this.prcStdIn.setDefaultEncoding('utf8');



        this.thinkStates = [];
        this.isReady = false
    }

    private writeInput(input : string){
        this.prcStdIn.write(input + "\n");
    }

    private static gInstance : Stockfish | null = null;
    public static getInstance(){
        if(Stockfish.gInstance == null){
            Stockfish.gInstance = new Stockfish();
        }

        return Stockfish.gInstance;
    }


    private onOutput(output : string){
        console.log("StockFish.onOutput ", output);

        if(output != ""){
            let firstToken = this.getFirstToken(output);
            switch (firstToken){
                case Stockfish.FirstToken.info:
                {
                    let infoTable = this.convertInfoStrToInfoTable(output);
                    let thinkState = this.thinkStates[0];

                    thinkState.callback(firstToken, infoTable);
                }
                    break;
                case Stockfish.FirstToken.bestmove:
                {
                    let bestMoveTable = this.convertBestMoveStrToBestMoveTable(output);
                    let thinkState = this.thinkStates[0];

                    thinkState.callback(firstToken, bestMoveTable);

                    this.thinkStates.splice(0, 1);
                }
                    break;
                case Stockfish.FirstToken.readyok:
                    this.isReady = true;
                    break;
            }

        }


        if(this.isReady){
            if(this.thinkStates.length > 0){
                let thinkState = this.thinkStates[0];

                while(thinkState.arguments[thinkState.argumentNum] != undefined){
                    this.writeInput(thinkState.arguments[thinkState.argumentNum]);
                    thinkState.argumentNum += 1;
                }
            }
        }else {
            this.writeInput("isready");
        }
    }





    public thinkMoveByAI(fenStr : string,
        callback : (firstToken : Stockfish.FirstToken, table : Stockfish.InfoTable | Stockfish.BestMoveTable) => void,
        setOptions : Stockfish.SetOptions,
        goOptions : Stockfish.GoOptions,
        params ?: {priority ?: number, mask ?: number}){

        if(params == undefined){
            params = {};
        }
        if(params.priority == undefined){
            params.priority = 0;
        }
        if(params.mask == undefined){
            params.mask = 0;
        }


        let thinkState :Stockfish.ThinkState= {
            callback : callback,
            arguments : [],
            argumentNum : 0,

            isInfinite : goOptions.infinite != undefined,
            priority : params.priority,
            mask : params.mask
        };


        //Add the position fen
        thinkState.arguments.push("position fen " + fenStr);

        //Add the setoption
        {
            for(let key in setOptions){
                //@ts-ignore
                let value = setOptions[key];

                let optionStr = "setoption name " + key + " value " + value;
                thinkState.arguments.push(optionStr);
            }

        }


        //Add the go thing
        {
            let goStr = "go";
            for(let key in goOptions){
                //@ts-ignore
                let value = goOptions[key];

                goStr += key + " " + value + " ";
            }
            thinkState.arguments.push(goStr);
        }



        //add this thinkState
        {
            let thinkStatesIndex = this.thinkStates.length;
            for(let i = this.thinkStates.length - 1; i >= 1; i--){
                if(this.thinkStates[i].priority < thinkState.priority){
                    thinkStatesIndex = i;
                }
            }

            this.thinkStates.splice(thinkStatesIndex, 0, thinkState);

        }
        this.onOutput("");
    }



    public stopThinking(){
        let helperFunction = (thinkState : Stockfish.ThinkState) => {
            return true;
        };

        this.stopThinkingHelper(helperFunction);
    }
    public stopThinkingByMask(mask : number){
        let helperFunction = (thinkState : Stockfish.ThinkState) => {
            return thinkState.mask == mask;
        };

        this.stopThinkingHelper(helperFunction);
    }
    public stopThinkingInfinite(){
        let helperFunction = (thinkState : Stockfish.ThinkState) => {
            return thinkState.isInfinite;
        };

        this.stopThinkingHelper(helperFunction);
    }

    private stopThinkingHelper(helperFunction : (thinkState : Stockfish.ThinkState) => boolean){
        if(this.thinkStates.length > 1){
            let thinkState = this.thinkStates[0];

            if(helperFunction(thinkState)){
                let lastArgument = thinkState.arguments[thinkState.argumentNum - 1];
                if(lastArgument != "stop"){
                    thinkState.arguments.push("stop");
                }
            }
        }

        for(let i = this.thinkStates.length - 1; i >= 1; i--){
            if(helperFunction(this.thinkStates[i])){
                this.thinkStates.splice(i, 1);
            }
        }

        this.onOutput("");
    }





    private getFirstToken(output : string):Stockfish.FirstToken{
        let outputSplit = output.split(' ');

        return <Stockfish.FirstToken>outputSplit[0]
    }
    private convertInfoStrToInfoTable(output : string):Stockfish.InfoTable{
        let infoTokens :Set<string> = new Set<string>();

        infoTokens.add("info");
        infoTokens.add("depth");
        infoTokens.add("seldepth");
        infoTokens.add("time");
        infoTokens.add("nodes");
        infoTokens.add("pv");
        infoTokens.add("multipv");

        infoTokens.add("score");
        infoTokens.add("cp");
        infoTokens.add("mate");
        infoTokens.add("lowerbound");
        infoTokens.add("upperbound");

        infoTokens.add("currmove");
        infoTokens.add("currmovenumber");
        infoTokens.add("hashfull");
        infoTokens.add("nps");
        infoTokens.add("tbhits");
        infoTokens.add("cpuload");
        infoTokens.add("string");
        infoTokens.add("refutation");
        infoTokens.add("currline");

        return this.convertIntoTableHelper(output, infoTokens);
    }
    private convertBestMoveStrToBestMoveTable(output : string):Stockfish.BestMoveTable{
        let bestMoveTokens :Set<string> = new Set<string>();
        bestMoveTokens.add("bestmove");
        bestMoveTokens.add("ponder");

        return this.convertIntoTableHelper(output, bestMoveTokens);
    }

    private convertIntoTableHelper(output : string, tokenKeys : Set<string>):any{
        let ret :any = {};

        let outputSplit = output.split(" ");

        let lastToken : null | string = null;
        for(let i = 0; i < outputSplit.length; i++){
            let token = outputSplit[i];

            if(tokenKeys.has(token)){
                lastToken = token;
            }else {
                if(lastToken != null){
                    if(ret[lastToken] == null){
                        ret[lastToken] = token;
                    }else {
                        ret[lastToken] += " " + token;
                    }
                }

            }
        }


        return ret;
    }
}