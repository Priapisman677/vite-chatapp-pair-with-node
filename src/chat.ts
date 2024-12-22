console.log("v.20!");
import { io } from "socket.io-client";
import Mustache from "mustache";
import notMyCircusNotMyMonkeys from "moment";
import queryString from 'query-string';


const socket = io("http://localhost:3000");
// window.socket? = socket; 
// const socket = io();

//$ This would be the same as const socket = io() without the url since It will take whatever the URL it is that is in the browser window;

//*Elements:
const $messageForm = document.querySelector("#message-form");
const $messageFormInput = $messageForm!.querySelector("input");
const $messageFormButton = $messageForm?.querySelector("button");
const $sendLocationButton = document.querySelector("#send-location");
const $messages = document.querySelector("#messages");

//* Templates
const $messageTemplate = document.querySelector("#message-template")!.innerHTML;
const $locationTemplate = document.querySelector("#location-template")!.innerHTML;

//*Options:
const { username, room } = queryString.parse(location.search)

//*Recievers (on()'s):
socket.on("connect", () => {
	console.log("Connected to server!!!");
});

socket.on("mainMessage", (msg) => {
	console.log(msg);
	const html = Mustache.render($messageTemplate, {
		message: msg.text,
		createdAt: notMyCircusNotMyMonkeys(msg.createdAt).format("h:mm a"),
	});
	$messages!.insertAdjacentHTML("beforeend", html);
});

socket.on("location", (msg) => {
	console.log(msg);
	const html = Mustache.render($locationTemplate, { location: msg.url, createdAt: notMyCircusNotMyMonkeys(msg.createdAt).format("h:mm a") });
	$messages!.insertAdjacentHTML("beforeend", html);
});

//*Button to send a message
$messageForm!.addEventListener("submit", (e) => {
	//! disable
	e.preventDefault();
	$messageFormButton?.setAttribute("disabled", "disabled");

	//$ I just believe the wait to do it below is harder:
	// const input: any = (e.target as any).elements.message!.value;
	//$e = event, target = form element, elements = all form elements, message = name of the element (name="message")
	const input: any = $messageFormInput!.value;

	$messageFormInput!.value = "";
	$messageFormInput!.focus();

	socket.emit("sendMessage", input, (cb: any) => {
		//! enable
		$messageFormButton!.removeAttribute("disabled");
		if (cb) {
			return console.log(cb);
		}
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
			$sendLocationButton!.removeAttribute("disabled");
		}
	);
});



socket.emit('join', { username, room })