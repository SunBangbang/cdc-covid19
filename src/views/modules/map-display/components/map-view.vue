<template>
    <div id="map"></div>
</template>

<script>
    import {Scene, Control, Marker, Popup} from "@antv/l7";
    import {GaodeMap, Mapbox} from "@antv/l7-maps";
    import { ProvinceLayer,CityLayer } from '@antv/l7-district';

    const colors = [ '#EFF3F6', '#6da8ef', '#f1e60b', '#f18008', '#f10e0e'];
    export default {
        name: "map-view",
        props: ['rowData'],
        data() {
            return {
                $map: null
            }
        },
        mounted() {
            let that = this
            if (this.rowData != null) {
                if (this.rowData.category === '1') {
                    if (this.rowData.records.length > 0) {
                        const data = this.rowData.records
                        this.$map = new Scene({
                            id: 'map',
                            logoVisible: false,
                            map: new GaodeMap({
                                style: 'normal',
                                pitch: 0,
                                center: [data[0].longitude, data[0].latitude],
                                zoom: 5
                            })
                        });
                        this.$map.on('loaded', () => {
                            // 创建默认 marker
                            this.rowData.records.forEach(item => {
                                const popup = new Popup({
                                    offsets: [0, 50]
                                }).setHTML(
                                    `<div style="padding: 8px 10px;">
                                       <span style="color: #AAAAAA;">姓名:</span>
                                       <span style="margin-left: 8px; color: #333333">${item.personName}</span>
                                     </div>
                                    <div style="padding: 8px 10px;">
                                       <span style="color: #AAAAAA;">性别:</span>
                                       <span style="margin-left: 8px; color: #333333">${item.gender}</span>
                                     </div>
                                    <div style="padding: 8px 10px;">
                                       <span style="color: #AAAAAA;">年龄:</span>
                                       <span style="margin-left: 8px; color: #333333">${item.age}</span>
                                     </div>
                                    <div style="padding: 8px 10px;">
                                       <span style="color: #AAAAAA;">手机号:</span>
                                       <span style="margin-left: 8px; color: #333333">${item.phoneNumber}</span>
                                     </div>
                                    <div style="padding: 8px 10px;">
                                       <span style="color: #AAAAAA;">地址:</span>
                                       <span style="margin-left: 8px; color: #333333">${item.location}</span>
                                     </div>`
                                );
                                const marker = new Marker({color: 'red'})
                                    .setLnglat([item.longitude, item.latitude])
                                    .setPopup(popup);

                                this.$map.addMarker(marker);
                            })
                        });
                    } else {
                        this.$map = new Scene({
                            id: 'map',
                            logoVisible: false,
                            map: new GaodeMap({
                                style: 'normal',
                                pitch: 0,
                                center: [120, 30],
                                zoom: 13
                            })
                        });
                    }
                }else if (this.rowData.category === '2') {
                    const data = this.rowData.records
                    this.$map = new Scene({
                        id: 'map',
                        logoVisible: false,
                        map: new Mapbox({
                            center: [ 116.2825, 39.9 ],
                            pitch: 0,
                            style: 'blank',
                            zoom: 3,
                            minZoom: 3,
                            maxZoom: 10
                        })
                    });

                    if (this.rowData.adcode && this.rowData.adcode.length === 1) {
                        this.$map.on('loaded', () => {
                            new ProvinceLayer(this.$map, {
                                data,
                                joinBy: [ 'adcode', 'code' ],
                                adcode: this.rowData.adcode,
                                depth: this.rowData.depth,
                                label: {
                                    field: 'NAME_CHN',
                                    textAllowOverlap: false
                                },
                                fill: {
                                    color: {
                                        field: 'pop',
                                        values: (total) => that.getColor(total)
                                    }
                                },
                                popup: {
                                    enable: true,
                                    Html: props => {
                                        return `<span>${props.NAME_CHN}:</span><span>` + that.getPop(`${props.pop}`) + `</span>`;
                                    }
                                }
                            });
                        })
                    } else if (this.rowData.adcode && this.rowData.adcode.length === 2) {
                        this.$map.on('loaded', () => {
                            new CityLayer(this.$map, {
                                data,
                                joinBy: [ 'adcode', 'code' ],
                                adcode: this.rowData.adcode,
                                depth: this.rowData.depth,
                                label: {
                                    field: 'NAME_CHN',
                                    textAllowOverlap: false
                                },
                                fill: {
                                    color: {
                                        field: 'pop',
                                        values: (total) => that.getColor(total)
                                    }
                                },
                                popup: {
                                    enable: true,
                                    Html: props => {
                                        return `<span>${props.NAME_CHN}:</span><span>` + that.getPop(`${props.pop}`) + `</span>`;
                                    }
                                }
                            });
                        })
                    }else {
                        this.$message.error("数据错误!请检查")
                    }

                    // 添加地图图例
                    const legend = new Control({
                        position: 'topleft'
                    });

                    legend.onAdd = function () {
                        let el = document.createElement("div");
                        el.className = "infolegend legend";
                        el.innerHTML = ''

                        let grades = [0, 100, 300, 500];
                        let grades1 = [1, 101, 301];
                        el.innerHTML = '<p class="title">数量(份)：</p><i style="background:' +
                            colors[0] +
                            '"></i>' + grades[0] + "<br>"
                        for (let i = 0; i < grades.length; i++) {
                            el.innerHTML +=
                                '<i style="background:' +
                                colors[i+1] +
                                '"></i>' +
                                (grades[i + 1] ? grades1[i] + "–" + grades[i + 1] + "<br>" : ">" + grades[i]);
                        }
                        return el;
                    };

                    this.$map.addControl(legend);
                }else {
                    this.$message.error("数据分类不正确!请检查")
                }
            }
        },
        beforeDestroy() {
            if (this.$map != null) {
                // if(this.$map.getControl()) this.$map.getControl().destroy();
                this.$map.destroy();
            }
        },
        methods: {
            getColor(val) {
                // const colors = [ '#33f52d', '#6da8ef', '#f1e60b',
                //     '#f18008', '#f10e0e'];
                return val>500? colors[4] :
                    val> 300 ? colors[3] :
                        val> 100 ? colors[2] :
                            val> 0 ? colors[1] : colors[0]
            },
            getPop(val) {
                return val !== 'undefined' ? val : 0
            }
        }
    }
</script>

<style lang="scss" >
    #map {
        position: relative;
        top: 0;
        bottom: 0;
        height: 100%;
        min-height: 350px;
        border-radius: 4px;
    }

    .l7-top {
        .infolegend {
            padding: 6px 8px;
            font: 14px/16px Arial, Helvetica, sans-serif;
            background: white;
            background: rgba(255, 255, 255, 0.8);
            box-shadow: 0 0 15px rgba(0, 0, 0, 0.2);
            border-radius: 5px;
        }
        .infolegend h4 {
            margin: 0 0 5px;
            color: #777;
        }
        .legend {
            line-height: 20px;
            color: #555;
        }

        .legend i {
             width: 18px;
             height: 18px;
             float: left;
             margin-right: 8px;
             opacity: 0.7;
         }

        .infolegend.legend .title {
            color: #6A6876;
            margin: 0 0 10px;
            font-weight: bold;
            font-size: 16px;
        }
    }



</style>
