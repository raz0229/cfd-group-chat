<script>
	import { page } from '$app/stores';
	import logo from '$lib/images/profile_icon.svg';
	import github from '$lib/images/github.svg';
	import Modal from './Modal.svelte';
	import { browser } from "$app/environment"
	import { createUser, deleteUser } from '$lib/config/controllers';
	import Loader from './Loader.svelte';
	import { v4 as uuidv4 } from 'uuid';

	let showModal = false, showLoadingBar = false;
	let newUname = '', uuid = '';
	const format = /[ `!@#$%^&*()+\=\[\]{};':"\\|,<>\/?~]/;
	const emojiFormat = /<a?:.+?:\d{18}>|\p{Extended_Pictographic}/gu;
	let errorMessage = '';
	let uname = 'Type here';
	
	if (browser) {
		let getName = localStorage.getItem("uname");
		uuid = localStorage.getItem("uuid")
		if (!getName)
			showModal = true;
		else
			uname = getName
	}

	const submitHandler = async () => {
		errorMessage = '';
		showLoadingBar = true;
		const status = await createUser(newUname);
		if (status !== -1) {
			await deleteUser(uname, uuid);
			localStorage.setItem("uname", newUname.trim().toLowerCase());
			localStorage.setItem("uuid", status)
			location.reload();
		}
		else {
			errorMessage = 'User already exists!';
			showLoadingBar = false;
		}
			
	}

	const disableButton = () => {
		const submit = document.querySelector('#submitButton')
		if (format.test(newUname) || emojiFormat.test(newUname)) {
			errorMessage = 'Can\'t use any special characters'
			submit.disabled = true;
		}
		else {
			if (newUname.length >= 15) {
				errorMessage = 'Username is too long'
				submit.disabled = true;
			} else {
				submit.disabled = false;
				errorMessage = "";
			}
		}
	}
</script>

<header>
	<div on:click="{() => showModal = true}" class="corner">
		<a href="#">
			<img src={logo} alt="SvelteKit" />
		</a>
	</div>

	<nav>
		<svg viewBox="0 0 2 3" aria-hidden="true">
			<path d="M0,0 L1,2 C1.5,3 1.5,3 2,3 L2,0 Z" />
		</svg>
		<ul>
			<li aria-current={$page.url.pathname === '/' ? 'page' : undefined}>
				<a href="/">FAST-CFD Group Chat</a>
			</li>
		</ul>
		<svg viewBox="0 0 2 3" aria-hidden="true">
			<path d="M0,0 L0,3 C0.5,3 0.5,3 1,2 L2,0 Z" />
		</svg>
	</nav>

	{#if showModal}
	<Modal on:close="{() => showModal = false}">
		{#if showLoadingBar}
		
		<Loader/>
			
		{:else}
		<form on:submit={submitHandler}>
			<input type="text" name="name" class="question" id="nme" bind:value={newUname} on:keyup={disableButton} required autocomplete="off" />
			<label for="nme"><span>&nbsp; {uname}</span></label>
			<h4 style="text-align:center; font-weight: 800; padding: 7px 0; color:crimson;">{errorMessage}</h4>
			<input id="submitButton" disabled type="submit">
		  </form>	
		{/if}
	</Modal>
{/if}

	<div class="corner">
		<a href="https://github.com/raz0229/cfd-group-chat">
			<img src={github} alt="GitHub" />
		</a>
	</div>
</header>

<style>
	form input[type="submit"] {
		background-color: hsl(580,90%,60%);
		text-align: center;
		color: #fff;
		width: 100%;
		margin: 25px 0;
		height: 2.5rem;
		border: solid 1px hsl(75,50%,90%);
		
	}
	form input[type="submit"]:disabled {
		background-color: #999999;
	}
	form input[type="submit"]:hover :not(input:disabled) {
		background-color: hsl(580,90%,40%);
	}
	header {
		display: flex;
		justify-content: space-between;
	}

	.corner {
		width: 3em;
		height: 3em;
	}

	.corner a {
		display: flex;
		align-items: center;
		justify-content: center;
		width: 100%;
		height: 100%;
	}

	.corner img {
		width: 2em;
		height: 2em;
		object-fit: contain;
	}

	nav {
		display: flex;
		justify-content: center;
		--background: rgba(255, 255, 255, 0.7);
	}

	svg {
		width: 2em;
		height: 3em;
		display: block;
	}

	path {
		fill: var(--background);
	}

	ul {
		position: relative;
		padding: 0;
		margin: 0;
		height: 3em;
		display: flex;
		justify-content: center;
		align-items: center;
		list-style: none;
		background: var(--background);
		background-size: contain;
	}

	li {
		position: relative;
		height: 100%;
	}

	li[aria-current='page']::before {
		--size: 6px;
		content: '';
		width: 0;
		height: 0;
		position: absolute;
		top: 0;
		left: calc(50% - var(--size));
		border: var(--size) solid transparent;
		border-top: var(--size) solid var(--color-theme-1);
	}

	nav a {
		display: flex;
		height: 100%;
		align-items: center;
		padding: 0 0.5rem;
		color: var(--color-text);
		font-weight: 700;
		font-size: 0.8rem;
		text-transform: uppercase;
		letter-spacing: 0.1em;
		text-decoration: none;
		transition: color 0.2s linear;
	}

	a:hover {
		color: var(--color-theme-1);
	}
	h1 {
  font-size: 28px;
  margin-bottom: 2.5%;
}

input,
span,
label,
textarea {
  font-family: 'Ubuntu', sans-serif;
  display: block;
  margin: 10px;
  padding: 5px;
  border: none;
  font-size: 22px;
}

textarea:focus,
input:focus {
  outline: 0;
}
/* Question */

input.question,
textarea.question {
  font-size: 48px;
  font-weight: 300;
  border-radius: 2px;
  /*margin: 0;*/
  border: none;
  width: 80%;
  background: rgba(0, 0, 0, 0);
  transition: padding-top 0.2s ease, margin-top 0.2s ease;
  overflow-x: hidden; /* Hack to make "rows" attribute apply in Firefox. */
}
/* Underline and Placeholder */

input.question + label,
textarea.question + label {
  display: block;
  position: relative;
  white-space: nowrap;
  padding: 0;
  margin: 0;
  width: 10%;
  border-top: 1px solid red;
  -webkit-transition: width 0.4s ease;
  transition: width 0.4s ease;
  height: 0px;
}

input.question:focus + label,
textarea.question:focus + label {
  width: 80%;
}

input.question:focus,
input.question:valid {
  padding-top: 35px;
}

textarea.question:valid,
textarea.question:focus {
  margin-top: 35px;
}

input.question:focus + label > span,
input.question:valid + label > span {
  top: -100px;
  font-size: 22px;
  color: #333;
}

textarea.question:focus + label > span,
textarea.question:valid + label > span {
  top: -150px;
  font-size: 22px;
  color: #333;
}

input.question:valid + label,
textarea.question:valid + label {
  border-color: green;
}

input.question:invalid,
textarea.question:invalid {
  box-shadow: none;
}

input.question + label > span,
textarea.question + label > span {
  font-weight: 300;
  font-style: italic;
  margin: 0;
  position: absolute;
  color: #8F8F8F;
  font-size: 32px;
  top: -66px;
  left: 0px;
  z-index: -1;
  -webkit-transition: top 0.2s ease, font-size 0.2s ease, color 0.2s ease;
  transition: top 0.2s ease, font-size 0.2s ease, color 0.2s ease;
}

@-webkit-keyframes appear {
  100% {
    opacity: 1;
  }
}

@keyframes appear {
  100% {
    opacity: 1;
  }
}

</style>
