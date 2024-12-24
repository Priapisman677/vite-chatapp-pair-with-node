console.log("v.21!");
import { io } from "socket.io-client";
import Mustache from "mustache";
import Moment from "moment";
import queryString from "query-string";


const socket = io("http://localhost:3000");

socket.on("connect", () => {
	console.log("Connected to server!!!");
	console.log(socket.id);
});
console.log("client id: ", socket.id);
// window.socket? = socket;
// const socket = io();

//$ This would be the same as const socket = io() without the url since It will take whatever the URL it is that is in the browser window;

//*Elements:
const $messageForm = document.querySelector("#message-form");
const $messageFormInput = $messageForm!.querySelector("input");
const $messageFormButton = $messageForm?.querySelector("button");
const $sendLocationButton = document.querySelector("#send-location");
const $messages: any = document.querySelector("#messages");

//* Templates
const $messageTemplate = document.querySelector("#message-template")!.innerHTML;
const $locationTemplate =
	document.querySelector("#location-template")!.innerHTML;
const $sidebarTemplate = document.querySelector("#sidebar-template")!.innerHTML;

//*Options:
const { username, room } = queryString.parse(location.search);

//*Recievers (on()'s):
socket.on("connect", () => {
	console.log("Connected to server!!!");
	console.log(socket.id);
});

const autoscroll = () => {
	// New message element
	const $newMessage: any = $messages!.lastElementChild;

	// Height of the new message
	const newMessageStyles = getComputedStyle($newMessage!);
	const newMessageMargin = parseInt(newMessageStyles.marginBottom); 
	//$offsetHeight gives you the height of an element in pixels
	//$ It doesn't include the margin, we need to add it manually.
	const newMessageHeight = $newMessage!.offsetHeight + newMessageMargin; 
	console.log('margin: ', newMessageMargin);

	// Visible height
	const visibleHeight = $messages!.offsetHeight;

	// Height of messages container
	//$scrollHeight is the distance from the top of the element to the bottom of the element
	const containerHeight = $messages!.scrollHeight;

	// How far have I scrolled?
	//$scrollTop is the distance from the top of the element to the top of the viewport
	const scrollOffset = $messages!.scrollTop + visibleHeight;

	if (containerHeight - newMessageHeight <= scrollOffset) {
		//$ if we wanted to scroll to JUST  the bottom we would just need this line down here WITHOUT all the complexity:
		$messages.scrollTop = $messages.scrollHeight;
	}
};

socket.on("mainMessage", (msg) => {
	const html = Mustache.render($messageTemplate, {
		username: msg.username,
		message: msg.text,
		createdAt: Moment(msg.createdAt).format("h:mm a"),
	});
	$messages!.insertAdjacentHTML("beforeend", html);
	autoscroll();
});

socket.on("location", (msg) => {
	const html = Mustache.render($locationTemplate, {
		username: msg.username,
		location: msg.url,
		createdAt: Moment(msg.createdAt).format("h:mm a"),
	});
	$messages!.insertAdjacentHTML("beforeend", html);
	autoscroll();
});

socket.on("roomData", ({ room, users }) => {
	//expect: users to be an array, room to be a string
	const html = Mustache.render($sidebarTemplate, { room, users });
	document.querySelector(".chat__sidebar")!.innerHTML = html;
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

	socket.emit("sendMessage", input, (cb: string) => {
		//! enable
		$messageFormButton!.removeAttribute("disabled");
		if (cb === "Profanity is not allowed") {
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
				(cbConfirmantion: string) => {
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

socket.emit("join", { username, room }, (cb: string) => {
	if (cb === "User is in use") {
		alert(cb);
		location.href = "/";
	}
});
