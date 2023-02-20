import {
	getDictDataList
} from "@/utils";

export const reportOption = {
	indexLabel: "序号",
	index: true,
	tip: true,
	selection: false,
	addBtn: false,
	addRowBtn: false,
	cellBtn: false,
	border: true,
	stripe: true,
	menu: true,
	editBtn: false,
	delBtn: false,
	viewBtn: false,
	columnBtn: true,
	size: "mini",
	searchMenuSpan: 12,
	searchMenuPosition: "right",
	menuPosition: "right",
	headerAlign: "center",
	align: "center",
	lazy: true,
	column: [{
			label: "调查对象",
			prop: "taskName",
			overHidden: true,
			slot: true,
			search: true,
		},
		{
			label: "性别",
			prop: "gender",
			search: false,
			searchSpan: 6,
			dicData: getDictDataList("gender"),
			props: {
				label: "dictLabel",
				value: "dictValue",
			},
		},
		{
			label: "证件号",
			prop: "identity",
			search: true,
			searchPlaceholder: "搜索证件号",
			searchSpan: 6,
			overHidden: true,
		},
	]
};
