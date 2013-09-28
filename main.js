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
                    }, 1000);
            },

            handleMouseDown = function( e ){
                stage.addEventListener( 'stagemousemove', handleMouseMove );
                console.log( 'handledown', e );
            },
            
            handleMouseMove = function( e ){
                console.log( 'handlemousemove', e );
                spawnNoun( e.stageX, e.stageY, 0, 180 );
            },
            
            handleMouseUp = function( e ){
                console.log( 'handlemouseup', e );
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
            animNouns = new createjs.BitmapAnimation( VLM.Noun.spritesheetNouns ),
            rando = Math.floor( Math.random() * animNouns.spriteSheet.getNumFrames() ),
            animPuff = new createjs.BitmapAnimation( VLM.Noun.spritesheetPuff ),
            
            materialize = function() { 
                createjs.Tween
                    .get( animNouns, {
                         onChange : syncPuffPlaybackToTweenProgress } )
                    .to( { scaleX : 1,
                           scaleY : 1 }, 
                         1000,
                         createjs.Ease.quadInOut );
            },
        
            dematerialize = function() {
                createjs.Tween
                    .get( animNouns, {
                         onChange : syncPuffPlaybackToTweenProgress } )
                    .to( { scaleX: 0,
                           scaleY: 0 }, 
                         2000,
                         createjs.Ease.quadInOut )
                    .call( dematerializeComplete );
            },
        
            dematerializeComplete = function() {
                if ( that.parent ){
                    that.removeChild( animNouns );
                    that.removeChild( animPuff );
                    that.parent.removeChild( that );
                }
            },
            
            syncPuffPlaybackToTweenProgress = function(){
                var frame = Math.floor( animPuff.spriteSheet.getNumFrames() * animNouns.scaleX );
                animPuff.gotoAndStop( frame );
                animPuff.rotation = Math.random() * 90;
            };

        animNouns.scaleX = animNouns.scaleY = 0;
        animNouns.gotoAndStop( rando );    
        that.addChild( animNouns );
        that.addChild( animPuff );
        that.dematerialize = dematerialize;
        materialize();
    };
    
    VLM.Noun.spritesheetNouns = new createjs.SpriteSheet(
        {"frames": [[72, 10, 30, 72, 0, 15, 36], [10, 10, 42, 82, 0, 21, 41], [122, 10, 40, 70, 0, 20, 35]], "animations": {"all": {"frames": [0, 1, 2]}}, "images": ["nouns.png"]}
    );
    
    VLM.Noun.spritesheetPuff = new createjs.SpriteSheet(
        {"frames": [[663, 5, 0, 0, 0, 50, 50], [5, 5, 98, 98, 0, 49, 50], [113, 5, 96, 91, 0, 50, 45], [219, 5, 78, 75, 0, 39, 38], [307, 5, 65, 62, 0, 34, 32], [382, 5, 51, 53, 0, 26, 25], [443, 5, 42, 42, 0, 22, 20], [495, 5, 36, 34, 0, 18, 15], [541, 5, 29, 28, 0, 16, 12], [580, 5, 18, 21, 0, 12, 11], [608, 5, 18, 16, 0, 12, 9], [636, 5, 4, 4, 0, 4, 4], [650, 5, 3, 3, 0, 4, 3]], "animations": {"all": {"frames": [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 0]}}, "images": ["puff.png"]}
    );
    
    VLM.setup();
});
