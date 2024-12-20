console.log("Hello from TS 13!");
import { io } from "socket.io-client";
const socket = io();

const $messageForm = document.querySelector("#message-form");
const $messageFormInput = $messageForm!.querySelector("input");
const $messageFormButton = $messageForm?.querySelector("button");
const $sendLocationButton = document.querySelector("#send-location");

//!
$messageFormInput;

socket.on("mainMessage", (msg) => {
	console.log(msg);
});

//*Button to send a message
$messageForm!.addEventListener("submit", (e) => {
	//! disable
	e.preventDefault();
	$messageFormButton?.setAttribute("disabled", "disabled");
	$messageFormInput!.value = "";
	$messageFormInput!.focus();

	const input: any = (e.target as any).elements.message!.value;
	//$e = event, target = form element, elements = all form elements, message = name of the element (name="message")
	socket.emit("sendMessage", input, (e: any) => {
		//! enable
		if (e) {
			return console.log(e);
		}
		console.log("Message delivered!");

		// console.log(cbConfirmantion);
	});

	socket.emit("eventName", "Hello", (acknoMsg: any) => {
		console.log(acknoMsg);
	});
});

//* Button to send location:
$sendLocationButton!.addEventListener("click", () => {
	if (!navigator.geolocation) {
		return alert("Geolocation is not supported by your browser");
	}
	$sendLocationButton!.setAttribute("disabled", "disabled");

	navigator.geolocation.getCurrentPosition(
		(position) => {
			socket.emit(
				"location",
				`https://www.google.com/maps?q=${position.coords.latitude},${position.coords.longitude}`,
				(cbConfirmantion: any) => {
					console.log(cbConfirmantion);
				}
			);
			$sendLocationButton!.removeAttribute("disabled");
		},

		(error) => {
			console.error(
				`Error occurred while fetching location: Code ${error.code}, Message: ${error.message}`
			);
			// $sendLocationButton!.removeAttribute("disabled");
		}
	);
});
