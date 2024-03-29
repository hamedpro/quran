import { useEffect, useState } from "react";
import axios from "axios";
import CheckBoxOutlineBlankOutlinedIcon from "@mui/icons-material/CheckBoxOutlineBlankOutlined";
import { CheckBox, Edit, Person2Rounded } from "@mui/icons-material";
import "./tailwind_output.css";
import image1 from "./image.jpg";
import "./styles.css";
import ReactSelect from "react-select";
export default function App() {
	var [modal_visibility, set_modal_visibility] = useState(false);
	var [selected_record_to_edit, set_selected_record_to_edit] = useState();
	if (window.localStorage.getItem("records") === null) {
		window.localStorage.setItem("records", JSON.stringify([]));
	}
	function calc_empty_parts() {
		//returns an array of numbers according to current "records"
		var result = [];
		for (var i = 1; i < 31; i++) {
			if (records.find((record) => record.part_number === i) === undefined) {
				result.push(i);
			}
		}
		return result;
	}
	var [records, set_records] = useState();
	var [selected_part, set_selected_part] = useState();
	var [is_checkbox_active, set_is_checkbox_active] = useState(false);
	async function fetch_records() {
		return (
			await axios({
				baseURL: vite_api_endpoint /* vite will replace it during build  */,
				url: "records",
			})
		).data;
	}
	async function get_data() {
		set_records(await fetch_records());
		set_selected_part(undefined);
	}
	async function change_record_is_read(record_id, new_state) {
		if (!JSON.parse(window.localStorage.getItem("records")).includes(record_id)) {
			alert("این بخش انتخاب شما نبوده است");
			return;
		}
		//new_state must be a boolean
		//record_id must be a string
		if (
			(
				await axios({
					baseURL: vite_api_endpoint,
					url: "new_is_read_state",
					data: {
						new_is_read_state: new_state,
						record_id,
					},
					method: "post",
				})
			).data === "ok"
		) {
			get_data();
		}
	}
	async function change_record_name(record_id) {
		await axios({
			baseURL: vite_api_endpoint,
			url: `/records/${record_id}`,
			method: "patch",
			data: {
				name: window.prompt("نام جدید را وارد کنید"),
			},
		});
		get_data();
		alert("با موفقیت انجام شد");
	}
	async function toggle_record_privacy_mode(record_id) {
		//todo this kind of toggleing may not work if button is pressed many times in a short time
		await axios({
			baseURL: vite_api_endpoint,
			url: `/records/${record_id}`,
			method: "patch",
			data: {
				privacy_mode: !records.find((i) => i._id === record_id).privacy_mode,
			},
		});
		get_data();
		alert("با موفقیت انجام شد");
	}
	async function new_record() {
		var tmp = (
			await axios({
				baseURL: vite_api_endpoint /* vite will replace it during build  */,
				url: "records",
				method: "post",
				data: {
					name: document.getElementById("name_input").value,
					privacy_mode: is_checkbox_active,
					part_number: selected_part.value,
				},
			})
		).data;
		if (tmp === "taken") {
			alert(
				"شماره ای که انتخاب کرده اید توسط کاربر دیگری انتخاب شده است. (در همین زمانی که بعد از لود شدن جدول شما درخواست خود را ارسال کردید)"
			);
		} else {
			var insertedId = tmp;

			var current_saved_records = JSON.parse(window.localStorage.getItem("records"));
			current_saved_records.push(insertedId);
			window.localStorage.setItem("records", JSON.stringify(current_saved_records));
		}
		var tmp = await fetch_records();
		tmp.forEach((record, index) => {
			if (record._id === insertedId) {
				alert(`لطفا جز ${record.part_number} را قرائت فرمایید. التماس دعا`);
			}
		});
		get_data();
	}

	useEffect(() => {
		get_data();
	}, []);
	if (records === undefined) return <h1>loading ...</h1>;
	return (
		<>
			{modal_visibility && (
				<>
					<div className="fixed w-full h-full bg-gray-700 opacity-40"></div>
					<div
						className={
							"fixed rounded z-50 top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-1/2 w-1/2 bg-blue-500 p-2 flex flex-col items-end"
						}
					>
						<button
							onClick={() => set_modal_visibility(false)}
							className="w-10 h-10 bg-green-700 flex items-center justify-center mb-1 rounded"
						>
							x
						</button>
						<button
							className=" bg-blue-700 text-white rounded w-full"
							onClick={() => {
								toggle_record_privacy_mode(selected_record_to_edit);
								set_modal_visibility(false);
							}}
						>
							تغییر وضعیت حالت حریم شخصی
						</button>
						<button
							className=" bg-blue-700 text-white mt-1 rounded w-full "
							onClick={() => {
								change_record_name(selected_record_to_edit);
								set_modal_visibility(false);
							}}
						>
							تغییر نام
						</button>
					</div>
				</>
			)}
			<div className="">
				<div
					className="w-full h-1/3 top-0 left-0 landscape:hidden flex justify-center items-center"
					style={{
						justifyContent: "center",
					}}
				>
					<img src={image1} style={{ height: "33vh" }} />
				</div>
				<div style={{ direction: "rtl" }} className="p-2 relative ">
					<h1 className="text-xl">دوره ختم قرآن دسته جمعی</h1>
					<h1 className="text-2xl">به نیت حاج شکر الله یاقوت پور</h1>
					<p className="mt-2">لطفا نام و نام خانوادگی خود را وارد کنید :</p>
					<input id="name_input" className="border px-1 my-2 border-blue-500 rounded " />
					<p>لطفا از بین جزء های انتخاب نشده زیر موردی را انتخاب کنید </p>
					<div className="w-1/2 mb-2">
						<ReactSelect
							options={calc_empty_parts().map((i) => ({ label: i, value: i }))}
							onChange={set_selected_part}
							value={selected_part}
						/>
					</div>
					<div onClick={() => set_is_checkbox_active((prev) => !prev)}>
						{is_checkbox_active ? <CheckBox /> : <CheckBoxOutlineBlankOutlinedIcon />}
						نام من را به صورت عمومی نشان نده
					</div>
					<button
						onClick={new_record}
						className=" px-2 mt-2 bg-green-500 text-white hover:bg-green-600 duration-300 pushable"
					>
						<span className="front">اعلام جزء شما</span>
					</button>
					<h1>جزء های انتخاب شده تاکنون :‌ {records.length} جزء </h1>
					<h1>تعداد جزء باقی مانده : {30 - records.length} جزء </h1>
					<div className="flex justify-between mt-2">
						<h1 className="text-xl inline-block">جزء های انتخاب شده</h1>
						<span>(لطفا پس از قرائت ثبت فرمایید)</span>
					</div>

					{records
						.sort((i1, i2) => i1.part_number - i2.part_number)
						.map((record, index, array) => {
							return (
								<div
									className="bg-green-600 text-white rounded mb-1 px-1 flex items-center mx-1 justify-between"
									key={record._id}
								>
									<div>
										<Person2Rounded sx={{ color: "white" }} />
										{`جزء : ${record.part_number} `} --
										<span className="pr-2 px-2">
											{record.privacy_mode ? "ناشناس " : record.name}
										</span>
										<button
											onClick={() => {
												if (
													!JSON.parse(
														window.localStorage.getItem("records")
													).includes(record._id)
												) {
													alert("این بخش انتخاب شما نبوده است");
													return;
												}
												set_selected_record_to_edit(record._id);
												set_modal_visibility(true);
											}}
										>
											<Edit />
										</button>
									</div>

									<div
										onClick={() =>
											change_record_is_read(record._id, !record.is_read)
										}
										className="shrink-0"
									>
										<span>قرائت شد</span>{" "}
										{record.is_read ? (
											<CheckBox />
										) : (
											<CheckBoxOutlineBlankOutlinedIcon />
										)}
									</div>
								</div>
							);
						})}
				</div>
			</div>
		</>
	);
}
