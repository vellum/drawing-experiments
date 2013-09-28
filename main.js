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
                var frame = Math.floor( 17 * animHands.scaleX );
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
            "frames": [
                [2036, 218, 0, 0, 0, 125, 225],
                [722, 742, 8, 7, 0, 14, 5],
                [2016, 396, 13, 7, 0, 16, 5],
                [1994, 218, 32, 7, 0, 26, 5],
                [1985, 5, 50, 8, 0, 34, 7],
                [1972, 571, 71, 9, 0, 45, 10],
                [624, 742, 88, 10, 0, 52, 13],
                [499, 742, 115, 28, 0, 66, 31],
                [351, 742, 138, 58, 0, 77, 61],
                [188, 742, 153, 81, 0, 82, 86],
                [5, 742, 173, 125, 0, 91, 129],
                [1426, 571, 182, 151, 0, 93, 156],
                [779, 5, 181, 170, 0, 93, 175],
                [404, 5, 173, 184, 0, 94, 185],
                [195, 5, 199, 189, 0, 102, 194],
                [5, 5, 180, 203, 0, 86, 203],
                [587, 5, 182, 175, 0, 86, 184],
                [902, 571, 167, 154, 0, 82, 165],
                [1656, 396, 171, 161, 0, 83, 171],
                [5, 571, 169, 161, 0, 83, 171],
                [543, 571, 169, 160, 0, 83, 170],
                [1837, 396, 169, 161, 0, 83, 171],
                [363, 571, 170, 160, 0, 83, 170],
                [184, 571, 169, 160, 0, 83, 170],
                [722, 571, 170, 155, 0, 86, 163],
                [1221, 218, 166, 167, 0, 76, 172],
                [1477, 396, 169, 162, 0, 84, 172],
                [931, 396, 172, 162, 0, 82, 173],
                [1295, 396, 172, 162, 0, 82, 173],
                [564, 396, 174, 162, 0, 82, 173],
                [195, 396, 177, 163, 0, 82, 173],
                [748, 396, 173, 162, 0, 82, 173],
                [382, 396, 172, 162, 0, 82, 173],
                [1113, 396, 172, 162, 0, 82, 173],
                [1618, 571, 166, 133, 0, 81, 142],
                [1255, 571, 161, 152, 0, 88, 159],
                [5, 396, 180, 165, 0, 91, 174],
                [1017, 218, 194, 167, 0, 95, 175],
                [813, 218, 194, 167, 0, 95, 175],
                [1397, 218, 194, 167, 0, 95, 175],
                [1601, 218, 194, 166, 0, 95, 174],
                [209, 218, 194, 167, 0, 95, 175],
                [609, 218, 194, 167, 0, 95, 175],
                [5, 218, 194, 168, 0, 95, 176],
                [1079, 571, 166, 153, 0, 85, 161],
                [1794, 571, 168, 131, 0, 91, 141],
                [1805, 218, 179, 166, 0, 82, 168],
                [413, 218, 186, 167, 0, 92, 175],
                [970, 5, 193, 169, 0, 91, 179],
                [1173, 5, 193, 169, 0, 91, 179],
                [1782, 5, 193, 169, 0, 91, 179],
                [1579, 5, 193, 169, 0, 91, 179],
                [1376, 5, 193, 169, 0, 91, 179]
            ],
            "animations": {"counting": {"frames": [17, 18, 19, 20, 21, 22, 23, 24, 25, 26, 27, 28, 29, 30, 31, 32, 33, 34, 35, 36, 37, 38, 39, 40, 41, 42, 43, 44, 45, 46, 47, 48, 49, 50, 51, 52]}, "intro/outro": {"frames": [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15]}, "all": {"frames": [16]}},
            "images": ["hand.png"]
        }
       
       
    );
    
    VLM.setup();
});
