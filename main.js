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
                noun.x = x + Math.random() * r - Math.random() * r;
                noun.y = y + Math.random() * r - Math.random() * r;
                noun.rotation = Math.random() * rot - Math.random() * rot;
                
                content.addChild(noun);
                
                // wait 2 seconds then dematerialize
                _.delay(function(){
                        noun.dematerialize()
                    }, 2000);
            },

            prev = { x:-1, y:-1 },
            handleMouseDown = function( e ){
                stage.addEventListener( 'stagemousemove', handleMouseMove );
                //console.log( 'handledown', e );
                prev = { x: e.stageX, y: e.stageY };
                spawnNoun( e.stageX, e.stageY, 0, 0 );
                
                
            },
            count = 0,
            handleMouseMove = function( e ){
                //console.log( 'handlemousemove', e );
                
                var dx = e.stageX - prev.x,
                    dy = e.stageY - prev.y,
                    dist = Math.sqrt( dx*dx + dy*dy ),
                    shouldSpawn = dist > 20;
                if ( shouldSpawn ){
                    count++;
                    var rot = ( count % 2 == 0 ) ? 0 : 30;
                    spawnNoun( e.stageX, e.stageY, 0, rot );
                    prev.x = e.stageX;
                    prev.y = e.stageY;
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

        ticker.setFPS( 30 );
        ticker.addListener( stage );
    
        window.onresize = resize;
        resize();
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
                         1000,
                         createjs.Ease.quadInOut )
                    .call( function(){
                        mode = 1;
                       animHands.gotoAndPlay('counting');
                       //animHands.gotoAndPlay(18);
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
                    that.removeChild( animHands );
                    that.parent.removeChild( that );
                }
            },
            
            syncHandsPlaybackToTweenProgress = function(){
                if ( mode != 0 ) return;
                var frame = Math.floor( 18 * animHands.scaleX );
                animHands.gotoAndStop( frame );
            };

        animHands.scaleX = animHands.scaleY = 0;
        animHands.rotation = ( Math.random() - Math.random() ) * 90;
        animHands.gotoAndStop( 0 );
        that.addChild( animHands );
        that.dematerialize = dematerialize;
        materialize();
    };
    
    VLM.Noun.spritesheetHands = new createjs.SpriteSheet(
        {
            "images": ["hand.png"],
            "frames": [
                [900, 744, 0, 0, 0, 125, 225],
                [2035, 573, 8, 7, 0, 14, 5],
                [2024, 397, 13, 7, 0, 16, 5],
                [2008, 218, 32, 7, 0, 26, 5],
                [1975, 573, 50, 8, 0, 34, 7],
                [1972, 5, 71, 9, 0, 45, 10],
                [802, 744, 88, 10, 0, 52, 13],
                [677, 744, 115, 28, 0, 66, 31],
                [529, 744, 138, 58, 0, 77, 61],
                [366, 744, 153, 81, 0, 82, 86],
                [183, 744, 173, 125, 0, 91, 129],
                [1607, 573, 182, 151, 0, 93, 156],
                [969, 5, 181, 170, 0, 93, 175],
                [594, 5, 173, 184, 0, 94, 185],
                [385, 5, 199, 189, 0, 102, 194],
                [5, 5, 180, 203, 0, 86, 203],
                [195, 5, 180, 203, 0, 86, 203],
                [777, 5, 182, 175, 0, 86, 184],
                [1083, 573, 167, 154, 0, 82, 165],
                [184, 573, 171, 161, 0, 83, 171],
                [1845, 397, 169, 161, 0, 83, 171],
                [544, 573, 169, 160, 0, 83, 170],
                [5, 573, 169, 161, 0, 83, 171],
                [723, 573, 170, 160, 0, 83, 170],
                [365, 573, 169, 160, 0, 83, 170],
                [903, 573, 170, 155, 0, 86, 163],
                [1628, 218, 166, 167, 0, 76, 172],
                [1666, 397, 169, 162, 0, 84, 172],
                [1300, 397, 172, 162, 0, 82, 173],
                [753, 397, 172, 162, 0, 82, 173],
                [1482, 397, 174, 162, 0, 82, 173],
                [384, 397, 177, 163, 0, 82, 173],
                [935, 397, 173, 162, 0, 82, 173],
                [571, 397, 172, 162, 0, 82, 173],
                [1118, 397, 172, 162, 0, 82, 173],
                [1799, 573, 166, 133, 0, 81, 142],
                [1436, 573, 161, 152, 0, 88, 159],
                [194, 397, 180, 165, 0, 91, 174],
                [1016, 218, 194, 167, 0, 95, 175],
                [1424, 218, 194, 167, 0, 95, 175],
                [608, 218, 194, 167, 0, 95, 175],
                [1804, 218, 194, 166, 0, 95, 174],
                [812, 218, 194, 167, 0, 95, 175],
                [1220, 218, 194, 167, 0, 95, 175],
                [208, 218, 194, 168, 0, 95, 176],
                [1260, 573, 166, 153, 0, 85, 161],
                [5, 744, 168, 131, 0, 91, 141],
                [5, 397, 179, 166, 0, 82, 168],
                [412, 218, 186, 167, 0, 92, 175],
                [1769, 5, 193, 169, 0, 91, 179],
                [1363, 5, 193, 169, 0, 91, 179],
                [1160, 5, 193, 169, 0, 91, 179],
                [5, 218, 193, 169, 0, 91, 179],
                [1566, 5, 193, 169, 0, 91, 179]
            ],
            "animations": {"intro/outro": {"frames": [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16]}, "counting": {"frames": [18, 19, 20, 21, 22, 23, 24, 25, 26, 27, 28, 29, 30, 31, 32, 33, 34, 35, 36, 37, 38, 39, 40, 41, 42, 43, 44, 45, 46, 47, 48, 49, 50, 51, 52, 53]}, "all": {"frames": [17]}}
        }
    );
    
    VLM.setup();
});
