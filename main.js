// ready
$(function(){

    // namespace
    var VLM = {};
    
    // setup
    VLM.setup = function(){

        var $canvas = $( '#canvas' ),
            canvas = $canvas.get( 0 ),
            stage = new createjs.Stage( canvas ),
            ticker = createjs.Ticker,
            back = new createjs.Shape(),
            content = new createjs.Container,
            nountemplate,
            shouldCenterContent = false,
            
            CELL_SIZE = 50,
            GRID = [],
            
            resize = function(){
                var w = window.innerWidth,
                    h = window.innerHeight;
                canvas.width = w;
                canvas.height = h;
                back.graphics
                    .clear()
                    .beginFill( 'ccc' )
                    .drawRect( 0, 0, canvas.width, canvas.height );
                if ( shouldCenterContent ) {
                    content.x = w / 2;
                    content.y = h / 2;
                } else {
                    content.x = 0;
                    content.y = 0;
                }
            },
        
            spawnNoun = function( x, y, rangexy, rangerot ){
                var noun = new VLM.Noun(),
                    r = rangexy / 2,
                    rot = rangerot / 2;
                noun.x = x;// + Math.random() * r - Math.random() * r;
                noun.y = y;// + Math.random() * r - Math.random() * r;
                //noun.rotation = Math.random() * rot - Math.random() * rot;
                
                content.addChild(noun);
                
                // wait 2 seconds then dematerialize
                _.delay(function(){
                        //noun.dematerialize()
                    }, 3000);
            },

            prev = { x:-1, y:-1 },
            handleMouseDown = function( e ){
                stage.addEventListener( 'stagemousemove', handleMouseMove );
                //console.log( 'handledown', e );
                prev = { x: e.stageX, y: e.stageY };
                //spawnNoun( e.stageX, e.stageY, 0, 0 );
                handleMouseMove( e );
                
            },
            count = 0,
            handleMouseMove = function( e ){
                //console.log( 'handlemousemove', e );
                var row = Math.round( e.stageY / CELL_SIZE ),
                    col = Math.round( e.stageX / CELL_SIZE ),
                    x = col * CELL_SIZE,
                    y = row * CELL_SIZE;

                
                var dx = e.stageX - prev.x,
                    dy = e.stageY - prev.y,
                    dist = Math.sqrt( dx*dx + dy*dy ),
                    shouldSpawn = !GRID[col][row];//dist > 10;
                
                if ( shouldSpawn ){
                    count++;
                    var rot = Math.floor( Math.random() * 4)%3 * 90;//( count % 2 == 0 ) ? 0 : 30;
                    
                    spawnNoun( x, y, 0, rot );
                    prev.x = e.stageX;
                    prev.y = e.stageY;
                    
                    GRID[col][row] = true;
                }
                
            },
            
            
            handleMouseUp = function( e ){
                //console.log( 'handlemouseup', e );
                stage.removeEventListener( 'stagemousemove', handleMouseMove );
            };

        stage.addChild( back );
        stage.addChild( content );
        stage.addEventListener( 'stagemousedown', handleMouseDown );
        stage.addEventListener( 'stagemouseup', handleMouseUp );

        ticker.setFPS( 60 );
        ticker.addListener( stage );
    
        window.onresize = resize;
        resize();
        
        var cols = Math.ceil( 1000 ),
            rows = Math.ceil( 1000 );
        for ( var row = 0; row < rows; row++ ){
            GRID[row] = [];
            for ( var col = 0; col < cols; col++ ){
                GRID[row][col] = false;
            }
        }
        
    };
    
    VLM.Noun = function(){
        this.initialize();
    };
    VLM.Noun.prototype = new createjs.Container;
    
    // alias the init method so we can overwrite the original
    nountemplate = VLM.Noun.prototype;
    nountemplate.setup = nountemplate.initialize;

    // overwrite the original init
    nountemplate.initialize = function(){
        
        // call the original, now aliased
        this.setup();

        var that = this,
            animHands = new createjs.BitmapAnimation( VLM.Noun.spritesheetHands ),
            mode = 0,
            
            materialize = function() { 
                mode = 0;
                createjs.Tween
                    .get( animHands, {
                         onChange : syncHandsPlaybackToTweenProgress } )
                    .to( { scaleX : 1,
                           scaleY : 1 }, 
                         600,
                         createjs.Ease.quadInOut )
                    .call( function(){
                        mode = 1;
                        repeat();
                    });
            },
        
            dematerialize = function() {
                mode = 0;
                createjs.Tween
                    .get( animHands, {
                         onChange : syncHandsPlaybackToTweenProgress } )
                    .to( { scaleX: 0,
                           scaleY: 0 }, 
                         1000,
                         createjs.Ease.quadInOut )
                    .call( dematerializeComplete );
            },
        
            dematerializeComplete = function() {
                if ( that.parent ){
                    animHands.removeEventListener('animationend',repeat);
                    that.removeChild( animHands );
                    that.parent.removeChild( that );
                }
            },
            
            syncHandsPlaybackToTweenProgress = function(){
                if ( mode != 0 ) return;
                var frame = Math.floor( 52 * animHands.scaleX );
                animHands.gotoAndStop( frame );
            },
            
            repeat = function(){
                animHands.gotoAndPlay('Repeat');
                
            };

        animHands.scaleX = animHands.scaleY = 0;
        //animHands.rotation = ( Math.random() - Math.random() ) * 90;
        animHands.gotoAndStop( 0 );
        that.addChild( animHands );
        that.dematerialize = dematerialize;
        
        animHands.addEventListener('animationend', repeat);
        materialize();
    };
    
    VLM.Noun.spritesheetHands = new createjs.SpriteSheet(
        {
            "images": ["square.png"],
            "frames": [
                [496, 732, 0, 0, 0, 50, 50],
                [452, 732, 4, 3, 0, 10, -17],
                [318, 732, 4, 5, 0, 9, -16],
                [362, 732, 5, 5, 0, 10, -16],
                [407, 732, 5, 4, 0, 10, -17],
                [273, 732, 5, 5, 0, 10, -16],
                [227, 732, 6, 7, 0, 10, -14],
                [180, 732, 7, 9, 0, 11, -13],
                [129, 732, 11, 12, 0, 13, -11],
                [75, 732, 14, 16, 0, 15, -8],
                [20, 732, 15, 17, 0, 15, -8],
                [1987, 628, 18, 19, 0, 17, -7],
                [1927, 628, 20, 22, 0, 18, -5],
                [2008, 149, 20, 26, 0, 18, -3],
                [1866, 628, 21, 27, 0, 19, -2],
                [1803, 628, 23, 27, 0, 19, -2],
                [1736, 628, 27, 29, 0, 20, -2],
                [1665, 628, 31, 32, 0, 22, 0],
                [1590, 628, 35, 35, 0, 24, 2],
                [1515, 628, 35, 36, 0, 25, 2],
                [1364, 628, 34, 38, 0, 25, 4],
                [1438, 628, 37, 37, 0, 26, 3],
                [1286, 628, 38, 39, 0, 27, 5],
                [1206, 628, 40, 41, 0, 28, 7],
                [1120, 628, 46, 43, 0, 30, 8],
                [1033, 628, 47, 43, 0, 33, 9],
                [940, 628, 53, 46, 0, 34, 13],
                [1973, 511, 51, 49, 0, 34, 14],
                [844, 628, 56, 51, 0, 36, 16],
                [747, 628, 57, 51, 0, 35, 16],
                [445, 628, 59, 54, 0, 35, 18],
                [544, 628, 58, 54, 0, 36, 19],
                [642, 628, 65, 54, 0, 40, 20],
                [342, 628, 63, 60, 0, 39, 24],
                [129, 628, 66, 63, 0, 38, 25],
                [235, 628, 67, 62, 0, 39, 25],
                [20, 628, 69, 64, 0, 40, 26],
                [1863, 511, 70, 65, 0, 40, 27],
                [1751, 511, 72, 67, 0, 41, 27],
                [1638, 511, 73, 68, 0, 40, 29],
                [1525, 511, 73, 69, 0, 41, 30],
                [1074, 511, 76, 74, 0, 43, 32],
                [487, 511, 80, 76, 0, 45, 34],
                [1222, 272, 80, 79, 0, 44, 38],
                [1808, 20, 83, 84, 0, 44, 37],
                [896, 149, 82, 82, 0, 44, 38],
                [1393, 149, 83, 81, 0, 45, 37],
                [772, 149, 84, 82, 0, 46, 37],
                [266, 149, 86, 83, 0, 47, 38],
                [645, 149, 87, 83, 0, 48, 39],
                [794, 20, 92, 87, 0, 48, 41],
                [665, 20, 89, 87, 0, 48, 40],
                [926, 20, 89, 86, 0, 46, 40],
                [146, 20, 91, 89, 0, 48, 42],
                [1181, 20, 89, 86, 0, 47, 40],
                [20, 20, 86, 89, 0, 47, 41],
                [277, 20, 89, 89, 0, 48, 41],
                [406, 20, 90, 89, 0, 49, 41],
                [536, 20, 89, 88, 0, 48, 40],
                [1055, 20, 86, 86, 0, 47, 40],
                [1681, 20, 87, 84, 0, 48, 40],
                [1433, 20, 87, 85, 0, 47, 39],
                [1931, 20, 88, 84, 0, 48, 39],
                [1018, 149, 86, 82, 0, 44, 38],
                [519, 149, 86, 83, 0, 45, 38],
                [392, 149, 87, 83, 0, 45, 38],
                [20, 272, 83, 81, 0, 45, 39],
                [375, 393, 81, 78, 0, 45, 38],
                [254, 393, 81, 78, 0, 45, 37],
                [1516, 149, 82, 81, 0, 46, 38],
                [1271, 149, 82, 81, 0, 45, 38],
                [1934, 272, 80, 78, 0, 44, 37],
                [1814, 272, 80, 78, 0, 45, 37],
                [143, 272, 80, 80, 0, 45, 37],
                [1342, 272, 77, 79, 0, 44, 37],
                [1331, 393, 77, 77, 0, 44, 36],
                [1581, 272, 73, 78, 0, 42, 36],
                [254, 511, 76, 76, 0, 45, 35],
                [1684, 393, 76, 77, 0, 44, 36],
                [607, 511, 76, 75, 0, 44, 35],
                [20, 393, 74, 78, 0, 44, 36],
                [749, 272, 75, 79, 0, 44, 36],
                [1298, 511, 72, 74, 0, 43, 34],
                [496, 393, 75, 78, 0, 43, 34],
                [723, 511, 73, 75, 0, 45, 33],
                [1448, 393, 75, 77, 0, 44, 33],
                [856, 393, 76, 78, 0, 44, 34],
                [864, 272, 72, 79, 0, 42, 34],
                [1190, 511, 68, 74, 0, 42, 32],
                [138, 511, 76, 76, 0, 45, 32],
                [1694, 272, 80, 78, 0, 44, 35],
                [628, 272, 81, 79, 0, 47, 35],
                [976, 272, 86, 79, 0, 47, 36],
                [508, 272, 80, 80, 0, 46, 35],
                [1095, 393, 77, 78, 0, 45, 35],
                [134, 393, 80, 78, 0, 46, 34],
                [955, 511, 79, 75, 0, 46, 35],
                [1924, 393, 76, 77, 0, 43, 35],
                [370, 511, 77, 76, 0, 44, 34],
                [836, 511, 79, 75, 0, 45, 33],
                [20, 511, 78, 77, 0, 45, 35],
                [1212, 393, 79, 78, 0, 44, 35],
                [1563, 393, 81, 77, 0, 46, 34],
                [1800, 393, 84, 77, 0, 46, 35],
                [1310, 20, 83, 85, 0, 45, 40],
                [611, 393, 84, 78, 0, 45, 35],
                [1144, 149, 87, 81, 0, 48, 38],
                [735, 393, 81, 78, 0, 47, 38],
                [1762, 149, 82, 81, 0, 47, 39],
                [1638, 149, 84, 81, 0, 45, 39],
                [387, 272, 81, 80, 0, 45, 38],
                [1884, 149, 84, 81, 0, 47, 39],
                [1410, 511, 75, 73, 0, 45, 32],
                [263, 272, 84, 80, 0, 48, 39],
                [146, 149, 80, 83, 0, 46, 40],
                [1102, 272, 80, 79, 0, 47, 38],
                [1560, 20, 81, 84, 0, 47, 40],
                [20, 149, 86, 83, 0, 46, 40],
                [972, 393, 83, 78, 0, 48, 36],
                [1459, 272, 82, 79, 0, 46, 39]
            ],
            "animations": {
                "Repeat": {"frames": [51, 52, 53, 54, 55, 56, 57, 58, 59, 60, 61, 62, 63, 64, 65, 66, 67, 68, 69, 70, 71, 72, 73, 74, 75, 76, 77, 78, 79, 80, 81, 82, 83, 84, 85, 86, 87, 88, 89, 90, 91, 92, 93, 94, 95, 96, 97, 98, 99, 100, 101, 102, 103, 104, 105, 106, 107, 108, 109, 110, 111, 112, 113, 114, 115, 116, 117, 118, 119]},
                "Intro": {"frames": [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 26, 27, 28, 29, 30, 31, 32, 33, 34, 35, 36, 37, 38, 39, 40, 41, 42, 43, 44, 45, 46, 47, 48, 49]},
                "all": {"frames": [50]}
            }
        }
    );
    
    VLM.setup();
});
