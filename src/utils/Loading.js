import { Loading } from 'element-ui';
export default class customLoading {
    constructor(element) {
        this.loadingInstance = Loading.service({
            target: element
        })
    }
    close() {
        if (this.loadingInstance)
            this.loadingInstance.close()
    }
}