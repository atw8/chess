import * as PIXI from "pixi.js";
import {SimpleGame} from "../../SimpleGame";
import * as TWEEN from "@tweenjs/tween.js";
import {PositionManager} from "../../PositionManager";
import remove = TWEEN.remove;

export namespace TableContainer {
    export interface Properties {
        height : number,
        width : number,
        rowHeight : number,
        numOfCols : number,
    }
}

export class TableContainer extends PIXI.Graphics {
    private properties : TableContainer.Properties;

    private positionManager : PositionManager;

    private tableItems : {[key : number] : PIXI.Container} = {};

    constructor(properties : TableContainer.Properties){
        super();
        this.properties = properties;
        this.positionManager = new PositionManager();


        this.beginFill(SimpleGame.getLightBrownColor());
        this.lineStyle(4, SimpleGame.getBlackColor());

        this.drawRoundedRect(-this.properties.width/2,
            -this.properties.height/2,
            this.properties.width,
            this.properties.height,
            4);


        let uiMask = new PIXI.Graphics();
        uiMask.beginFill(0xFFFFFF);
        uiMask.drawRoundedRect(-this.properties.width/2,
            -this.properties.height/2,
            this.properties.width,
            this.properties.height,
            4);
        this.addChild(uiMask);

        this.mask = uiMask;
    }


    protected getRowWidth():number{
        return this.properties.width/this.properties.numOfCols;
    }
    protected getRowHeight():number{
        return this.properties.rowHeight;
    }

    private getPositionForRow(row : number):PIXI.Point {
        let ret = new PIXI.Point();


        ret.x = -this.properties.width/2 + this.getRowWidth()/2;
        ret.y = -this.properties.height/2 - this.getRowHeight()/2;




        let x = 0;
        let y = row;

        let maxNumOfRows = this.getMaxNumOfRows();
        while(y > maxNumOfRows){
            x++;
            y -= maxNumOfRows;
        }


        ret.x += x * this.getRowWidth();
        ret.y += y * this.getRowHeight();


        return ret;
    }

    public getMaxNumOfRows():number{
        return Math.floor(this.properties.height/this.getRowHeight());
    }
    public getMaxNumOfCols():number{
        return this.properties.numOfCols;
    }
    public getMaxNumOfItems():number{
        return this.getMaxNumOfRows()*this.getMaxNumOfCols();
    }


    public addItem(tableItem : PIXI.Container, row ?: number){
        if(row == undefined){
            row = 1;
            while(this.tableItems[row] != undefined){
                row++;
            }
        }
        this.tableItems[row] = tableItem;


        tableItem.position = this.getPositionForRow(row);
        this.addChild(tableItem);

        tableItem.alpha = 0.0;
        let tween = new TWEEN.Tween({alpha : tableItem.alpha});
        tween.to({alpha : 1.0}, 500);
        tween.onUpdate((o : any) => {
            tableItem.alpha = o.alpha;
        });
        tween.start();
    }

    public removeItem(tableItem : PIXI.Container){
        //Remove the old rows
        let removeRows : number[] = [];
        for(let _row in this.tableItems){
            let row = parseInt(_row);

            if(this.tableItems[row] == tableItem){
                removeRows.push(row);
            }
        }
        for(let i = 0; i < removeRows.length; i++){
            let row = removeRows[i];
            delete this.tableItems[row];
        }



        let tween = new TWEEN.Tween({alpha : tableItem.alpha});
        tween.to({alpha : 0}, 500);
        tween.onUpdate((o : any) => {
            tableItem.alpha = o.alpha;
        });
        tween.onComplete((o : any) =>{
            this.removeChild(tableItem);
        });
        tween.start();
    }



}