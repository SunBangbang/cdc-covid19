import RegionSelectItem from "./RegionSelectItem"
import MapSelectItem from "./MapSelectItem";
import UploadItem from "./UploadItem"
import AutoFill from "./AutoFill";
import ASRItem from "./ASRItem";
import measureTemperatureItem from "./measureTemperatureItem";
import TableItem from "./TableItem";

const components = [RegionSelectItem, MapSelectItem, UploadItem,AutoFill, ASRItem, measureTemperatureItem, TableItem]

const Config = {
    install (Vue) {
        if (this.installed) return
        this.installed = true

        components.map(component => {
            Vue.component(component.name, component);
        })
    }
}

export default Config
