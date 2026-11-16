'use strict';
const mgu = require('./kit/mgu');
const {Controller} = require('./controller');
const {direction} = require('./signals');
const {Player} = require('./player');
mgu.run({
    async background(bg) {
        const options = () => ({target:bg.settings.get('target') || 'map', left:bg.settings.get('left') !== false,
            right:bg.settings.get('right') !== false, hazards:bg.settings.get('hazards') !== false});
        const player = new Player(bg.log, options);
        const control = new Controller((name,done) => player.play(name,done), () => player.stop());
        const enabled = () => bg.settings.get('enabled') === true;
        let signal = 'No indicator data', subscription;
        try {
            subscription = await bg.signals.watch('de.bmw.body.Light','1',{
                StatusFunctionsIndicators:(v) => { const d = direction(v); signal = JSON.stringify(v).slice(0,160); control.update(d,enabled()); }
            },bg.log);
            if (subscription.error) { signal = subscription.error; bg.log.warn(signal); }
        } catch(e) { signal = e.message; bg.log.warn(signal); }
        const tick = setInterval(() => control.tick(),50);
        bg.settings.onChange(() => control.reset());
        bg.app.on('shutdown',() => {clearInterval(tick); control.reset(); player.close(); if(subscription && subscription.shutdown) subscription.shutdown();});
        return {player,control,signal:() => signal};
    },
    async start(ctx) {
        const s = ctx.background;
        if (!s) return;
        ['left','right','hazards'].forEach((name) => ctx.ui.onClick('BTN_'+name.toUpperCase(),() => s.control.trigger(name)));
        ctx.ui.onClick('BTN_STOP',() => s.control.reset());
        ctx.loop('MAIN',2,async () => {
            const cv=ctx.canvas(1600,520),t=ctx.theme(); cv.fillRect(0,0,1600,520,t.bg);
            cv.text('INDICATOR CINEMA',65,95,48,t.text,{font:'bold'});
            cv.text('Automatic: '+(ctx.settings.get('enabled')?'ON':'OFF')+'    Display: '+ctx.settings.get('target'),65,165,28,'#4da3ff');
            cv.text(s.player.status.slice(0,100),65,235,25,t.text);
            cv.text('Left: woman enters    Right: man enters    Hazards: paparazzi',65,315,25,t.dim);
            cv.text(s.signal().slice(0,95),65,390,20,t.dim);
            cv.text('Select display and individual scenes in Settings. Reset scene clears both occupants and displays.',65,455,23,t.dim);
            await ctx.ui.image('MAIN_GFX',cv);
        });
    }
});
