const { fork } = require ( 'node:child_process' );
const converter = require ( './converter' );
const path = require ( 'node:path' );

class ChartJSNodeCanvas {

    #processInstance;
    #ready;

    constructor ( options ) {
        this.#processInstance = fork ( path.resolve ( __dirname, 'process.js' ) );
        this.#ready = new Promise ( ( resolve, reject ) => {
            this.#processInstance.once ( 'error', e => {
                console.error ( 'child process errored', e.message );
                reject ( e );
            } );
            this.#processInstance.once ( 'message', () => {
                resolve ();
            } );
            this.#processInstance.send ( {
                command: 'constructor',
                args   : [ converter.fn2string ( options ) ]
            } );
        } );
    }

    /**
     * @see {@link https://github.com/SeanSobey/ChartjsNodeCanvas/blob/master/src/index.ts#L110}
     */
    async renderToDataURL ( configuration, mimeType = 'image/png' ) {
        return new Promise ( ( resolve, reject ) => {
            this.#ready.then ( () => {
                this.#processInstance.once ( 'message', r => {
                    if ( r && r.message ) {
                        reject ( r );
                    } else {
                        resolve ( Buffer.from ( r ) );
                    }
                    this.#processInstance.kill ();
                } );
                this.#processInstance.send ( {
                    command: 'renderToDataURL',
                    args   : [ converter.fn2string ( configuration ), mimeType ]
                } );
            } ).catch ( e => {
                reject ( e );
                this.#processInstance.kill ();
            } );
        } );
    }

    /**
     * @see {@link https://github.com/SeanSobey/ChartjsNodeCanvas/blob/master/src/index.ts#L154}
     */
    async renderToBuffer ( configuration, mimeType = 'image/png' ) {
        return new Promise ( ( resolve, reject ) => {
            this.#ready.then ( () => {
                this.#processInstance.once ( 'message', r => {
                    if ( r && r.message ) {
                        reject ( r );
                    } else {
                        resolve ( Buffer.from ( r ) );
                    }
                    this.#processInstance.kill ();
                } );
                this.#processInstance.send ( {
                    command: 'renderToBuffer',
                    args   : [ converter.fn2string ( configuration ), mimeType ]
                } );
            } ).catch ( e => {
                reject ( e );
                this.#processInstance.kill ();
            } );
        } );
    }

    /**
     * @see {@link https://github.com/SeanSobey/ChartjsNodeCanvas/blob/master/src/index.ts#L226}
     */
    async registerFont ( path, options ) {
        return new Promise ( ( resolve, reject ) => {
            this.#ready.then ( () => {
                if ( r && r.message ) {
                    reject ( r );
                } else {
                    resolve ( r );
                }
                this.#processInstance.send ( {
                    command: 'registerFont',
                    args   : [ path, options ]
                } );
            } ).catch ( e => reject ( e ) );
        } );
    }

};

module.exports = { ChartJSNodeCanvas };