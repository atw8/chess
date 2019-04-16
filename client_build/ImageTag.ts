export enum ImageTag {
    logo = "logo",

    particle = "particle",

    white_pawn = "white_pawn",
    black_pawn = "black_pawn",
    white_knight = "white_knight",
    black_knight = "black_knight",
    white_bishop = "white_bishop",
    black_bishop = "black_bishop",
    white_rook = "white_rook",
    black_rook = "black_rook",
    white_queen = "white_queen",
    black_queen = "black_queen",
    white_king = "white_king",
    black_king = "black_king",

    select_light = "select_light",

    option_light = "option_light",

    pointGreen = "pointGreen",
    pointRed = "pointRed",
    pointYellow = "pointYellow",

    squareBlue = "squareBlue",
    squareGreen = "squareGreen",
    squareRed = "squareRed",

    btnGreen = "btnGreen",
    btnGreenPress = "btnGreenPress",

    btnPrompt = "btnPrompt",
    btnPromptPress = "btnPromptPress",


    null = "",
}

export function getNameForImageTag(imageTag : ImageTag):string{
    let ret : string = "";
    switch(imageTag){
        case ImageTag.particle:
            ret = "particle"
            break;
        case ImageTag.logo:
            ret = "img_logo";
            break;
        case ImageTag.white_pawn:
            ret = "icon_pawn_white";
            break;
        case ImageTag.black_pawn:
            ret = "icon_pawn_black";
            break;
        case ImageTag.white_knight:
            ret = "icon_knight_white";
            break;
        case ImageTag.black_knight:
            ret = "icon_knight_black";
            break;
        case ImageTag.white_bishop:
            ret = "icon_bishop_white";
            break;
        case ImageTag.black_bishop:
            ret = "icon_bishop_black";
            break;
        case ImageTag.white_rook:
            ret = "icon_rook_white";
            break;
        case ImageTag.black_rook:
            ret = "icon_rook_black";
            break;
        case ImageTag.white_queen:
            ret = "icon_queen_white";
            break;
        case ImageTag.black_queen:
            ret = "icon_queen_black";
            break;
        case ImageTag.white_king:
            ret = "icon_king_white";
            break;
        case ImageTag.black_king:
            ret = "icon_king_black";
            break;
        case ImageTag.select_light:
            ret = "selectLightSprite";
            break;
        case ImageTag.option_light:
            ret = "optionCycleSprite";
            break;
        case ImageTag.pointGreen:
            ret = "pointGreen";
            break;
        case ImageTag.pointRed:
            ret = "pointRed";
            break;
        case ImageTag.pointYellow:
            ret = "pointYellow";
            break;
        case ImageTag.squareBlue:
            ret = "squareBlue";
            break;
        case ImageTag.squareGreen:
            ret = "squareGreen";
            break;
        case ImageTag.squareRed:
            ret = "squareRed";
            break;
        case ImageTag.btnGreen:
            ret = "btn_play_green_little";
            break;
        case ImageTag.btnGreenPress:
            ret = "btn_play_green_little_press";
            break;
        case ImageTag.btnPrompt:
            ret = "btn_prompt";
            break;
        case ImageTag.btnPromptPress:
            ret = "btn_prompt_press";
            break;
    }

    return ret;
}

export function getLocationForImageTag(imageTag : ImageTag):string{
    let ret : string = "";
    switch(imageTag){
        case ImageTag.particle:
            ret = "image/particle.png";
            break;
        case ImageTag.logo:
            ret = "image/img_logo.png";
            break;
        case ImageTag.white_pawn:
            ret = "image/icon_pawn_white.png";
            break;
        case ImageTag.black_pawn:
            ret = "image/icon_pawn_black.png";
            break;
        case ImageTag.white_knight:
            ret = "image/icon_knight_white.png";
            break;
        case ImageTag.black_knight:
            ret = "image/icon_knight_black.png";
            break;
        case ImageTag.white_bishop:
            ret = "image/icon_bishop_white.png";
            break;
        case ImageTag.black_bishop:
            ret = "image/icon_bishop_black.png";
            break;
        case ImageTag.white_rook:
            ret = "image/icon_rook_white.png";
            break;
        case ImageTag.black_rook:
            ret = "image/icon_rook_black.png";
            break;
        case ImageTag.white_queen:
            ret = "image/icon_queen_white.png";
            break;
        case ImageTag.black_queen:
            ret = "image/icon_queen_black.png";
            break;
        case ImageTag.white_king:
            ret = "image/icon_king_white.png";
            break;
        case ImageTag.black_king:
            ret = "image/icon_king_black.png";
            break;
        case ImageTag.select_light:
            ret = "image/selectLightSprite.png";
            break;
        case ImageTag.option_light:
            ret = "image/optionCycleSprite.png";
            break;
        case ImageTag.pointGreen:
            ret = "image/pointGreen.png";
            break;
        case ImageTag.pointRed:
            ret = "image/pointRed.png";
            break;
        case ImageTag.pointYellow:
            ret = "image/pointYellow.png";
            break;
        case ImageTag.squareBlue:
            ret = "image/squareBlue.png";
            break;
        case ImageTag.squareGreen:
            ret = "image/squareGreen.png";
            break;
        case ImageTag.squareRed:
            ret = "image/squareRed.png";
            break;
        case ImageTag.btnGreen:
            ret = "image/btn_play_green_little.png";
            break;
        case ImageTag.btnGreenPress:
            ret = "image/btn_play_green_little_press.png";
            break;
        case ImageTag.btnPrompt:
            ret = "image/btn_prompt.png";
            break;
        case ImageTag.btnPromptPress:
            ret = "image/btn_prompt_press.png";
            break;
    }

    return ret;
}