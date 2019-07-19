
/**
 * @author rafaeltoyo
 */
export class LocalMusic {

    /**
     * 
     * @param {String} filename 
     */
    constructor(filename) {

        this.filename = filename;
        this.type = "ok";

        if (filename) {
            if (filename.startsWith('-')) {
                this.filename = filename.replace(/^[-]/gi, '').trim();
                this.type = "missing";
            }
            if (filename.startsWith('@')) {
                this.filename = filename.replace(/^[@]/gi, '').trim();
                this.type = "wrong";
            }
        }
    }

}
