<script>
	import { spring } from 'svelte/motion';
	import sendIcon from '../lib/images/send_icon.svg';
	import sendIconDisabled from '../lib/images/send_icon_disabled.svg';
	import { browser } from '$app/environment';
	import { onMount } from 'svelte';
	import Loader from './Loader.svelte';
	import { sendMessage, getMessages, addToSeenList, clearSeenList, getSeenList } from '$lib/config/controllers';
	import { db } from '$lib/config/app';
	import { doc, onSnapshot, collection, query, where } from "firebase/firestore";
	import { blur } from 'svelte/transition';
	
	let count = 0, message = 'Aa...', user = '';
	const uname_cols = new Set();

	let showLoadingBar = false;
	let messages = [];
	let counter = 50;
	let readers = [];
	const displayed_count = spring();
	$: displayed_count.set(count);
	$: offset = modulo($displayed_count, 1);
	
	onMount(async () => {
		if (browser) {

		showLoadingBar = true;

		const outgoing = document.querySelector('.out-going input')
		const img = document.querySelector('.out-going img')
		user = localStorage.getItem('uname');
		if (!user) {	
			outgoing.disabled = true;
			img.src = sendIconDisabled;
		}

		try {
			messages = await getMessages();
			messages.splice(0, messages.length - counter);
		} catch {
			messages = [{message:"Network Error! Please reload", created: ":(", uname: "*-*"}]; 
		}

		await addToSeenList(user);
		readers = await getSeenList();
		showLoadingBar = false;
	}
	})

	// Listen for real-time updates
	const q = query(collection(db, "chats"), where("state", "==", "active"));
	const unsub = onSnapshot(q, (snapshot) => {
		snapshot.docChanges().forEach(async (change) => {

			// NEW message is received?
			if (change.type === 'modified') {
				counter++;
				messages = change.doc.data().messages;
				messages.splice(0, messages.length - counter);
				await clearSeenList();
				// if (user) {
				// 	try {
				// 		await addToSeenList(user);
				// 	} catch (e) {
				// 		console.log("Seen List not found")
				// 	}
				// }
			}

			setTimeout(() => scrollDown());
		})

	});

	const q2 = query(collection(db, "chats"), where("state", "==", "seen"));
	const unsubSeenList = onSnapshot(q2, (snapshot) => {
		snapshot.docChanges().forEach(async (change) => {

			if (change.type === 'modified' || change.type === 'added') {
				readers = change.doc.data().seen;
			}

			if (user) {
				try {
					await addToSeenList(user);
				} catch (e) {
					console.log("Seen List not found")
				}
			}
		})

	});

	/**
	 * @param {number} n
	 * @param {number} m
	 */
	function modulo(n, m) {
		// handle negative numbers
		return ((n % m) + m) % m;
	}

	function handleClick() {
		message = '';
	}
	
	async function sendHandler() {
		const msg = message.trim();

		new Audio('/audio/message-appear.wav').play();

		message = '';

		await sendMessage(msg, user);
	}

	function handleKeyDown(pressed) {
		
		let img = document.querySelector('.sendIcon');
		
		new Audio('/audio/single-button-press.wav').play();

		if (message.trim().length == 0)
			img.src = sendIconDisabled;
		else
			img.src = sendIcon;

		if (pressed.key == 'Enter')
			sendHandler()

	}
	
	function scrollDown() {
		if (browser) {
			const wrapper = document.querySelector(".messages-wrapper")
			if (wrapper)
				wrapper.scrollTo(0, wrapper.scrollHeight);
		}
	}

	function getRand(uname='') {
		let col_val;
		uname_cols.forEach(elem => {
			if (elem.uname === uname)
				col_val = elem.val
		})

		if (col_val == undefined) {
			col_val = Math.floor(Math.random() * 1000);
			uname_cols.add({
				"uname": uname,
				"val": col_val
			})
		}
		return col_val
	}

	function getUname(uname='') {
		if (uname == 'raz0229')
			return `
			👑 raz0229
			<span>
				<sup>DEV</sup>
			</span>
			`
		if (uname == 'ꮧꮰ043')
			return `
			👑 ꮧꮰ043
			<span>
				<sup>MOD</sup>
			</span>
			`
		return uname;
	}

	function insertClass(uname) {
		if (uname === user)
			return "out-message"
		else
			return "in-message"
	}

	function handleMessageLoad(msg = '') {
		let span;
		for (const [i, phrase] of msg.trim().split('@').entries()) {
			if (i!==0) {
				let uname = phrase.split(' ')[0]
				span = `<span class="mentioned"> @` + uname + '</span>';
				msg = msg.replace(`@${uname}`, span)
			}
		}
		return msg;
	}

</script>

<div class="chatbox">
	<div class="messages">
		{#if showLoadingBar}
			<Loader />
		{:else}
		<div class="messages-wrapper">
			<div class="in-message">
				<span class="uname" style="color:hsl({getRand('raz0229')},70%,30%)"><b>👑 raz0229 <span><sup>DEV</sup></span>:</b></span>
				<span class="message">Hi! Welcome to FAST-CFD Chat. Be civil and respectful</span>
				<span class="timestamp">Feb 05 01:08</span>
			</div>
			
			{#if messages.length !== 0}
			{#each messages as msg}
			<div class="{insertClass(msg.uname)}" transition:blur>
				<span class="uname" style="color:hsl({getRand(msg.uname)},70%,30%)"><b>{@html getUname(msg.uname)}:</b></span>
				<span class="message">{@html handleMessageLoad(msg.message)}</span>
				<span class="timestamp">{ msg.created }</span>
			</div>
			{/each}
			{:else}
				<h1>No Messages Yet! :(</h1>
			{/if}

			{#if readers.length !== 0}
			<p class="readlist">Seen by:
				{#each readers as reader, i}
					{#if i < 10}
						<span>{ reader }
							{#if i < 9 && i < readers.length - 1}
							,
							{/if}
						</span>
					{/if}
				{/each}	
				{#if readers.length > 9}
				<span> + { readers.length - 9 } more</span>
				{/if}
			</p>
			{/if}

		</div>

		{/if}
	</div>
	<div class="out-going">
		<input type="text" id="message-input" bind:value={message} on:click|once={handleClick} on:keydown={handleKeyDown}>
		<img class="sendIcon" src="{sendIcon}" alt="send_icon" on:click={sendHandler} >
	</div>
</div>

<style>
	.messages {
		height: 600px;
	}
	.chatbox {
		position: relative;
        min-width: clamp(350px,100%,920px);
        background: hsl(0, 0%, 100%);
        border-radius: 15px;
        border: solid 2px #ff3e00;
		padding-bottom: 1rem;
    }
	.out-going {
		position: absolute;
		bottom: 2rem;
		width: 95%;
		height: 40px;
		border: solid 1px hsl(0, 0%, 82%);
		border-radius: 20px;
		margin-left: 2vw;
		margin-right: 2vw;
		background-color: #fff;
		/*background-color: #f3f3f5;*/
	}
	.out-going > #message-input {
		outline: none;
		margin: 1vh;
	}
	.in-message {
		text-align: left;
		border: solid 1px hsl(0, 25%, 90%);
	}
	.in-message .timestamp, .out-message .timestamp {
		position: absolute;
		right: 1vh;
		bottom: -2vh;
		font-size: 12px;
		color: hsl(0, 0%, 56%);
	}
	.out-message {
		background-color: #efefef;
	}
	.in-message, .out-message {
		position: relative;
		margin: 2rem;
		padding: 10px;
		border-radius: 20px;
		width: fit-content;
		min-width: 10vh;
	}
	.uname, .message {
		font-size: 20px;
	}
	.messages-wrapper {
		height: 550px;
		overflow-y: scroll;
	}
	.sendIcon {
		position: absolute;
		right: 1vw;
		top: 0;
		width: 35px;
		padding: 2px;
		cursor: pointer;
	}
	p.readlist {
    text-align: end;
    margin: 15px;
    font-size: 13px;
    color: #8b8d8f;
}
	/* Single line contenteditable paragraph input */
	/* [contenteditable="true"].single-line {
	    white-space: nowrap;
	    width:93%;
	    overflow: hidden;
	} 
	[contenteditable="true"].single-line br {
	    display:none;

	}
	[contenteditable="true"].single-line * {
	    display:inline;
	    white-space:nowrap;
	} */
	input#message-input:focus {
    outline: none;
}

input#message-input {
    width: 92%;
    outline: none;
    border: none;
    padding: 2px;
    font-size: 18px;
}
</style>
