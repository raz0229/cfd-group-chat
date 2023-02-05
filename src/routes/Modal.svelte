<script>
	import { createEventDispatcher, onDestroy } from 'svelte';
	import xMark from '../lib/images/close_icon.svg'
	import { onMount } from 'svelte';
	import { browser } from '$app/environment';
	import Loader from './Loader.svelte';
	import { deleteUser } from '$lib/config/controllers';

	const dispatch = createEventDispatcher();
	const close = () => dispatch('close');

	let modal;
	let user, uuid;
	let showLoadingBar = false;

	onMount(() => {
		if (browser) {
			user = localStorage.getItem('uname')
			uuid = localStorage.getItem('uuid')
		}
	})

	const handle_keydown = e => {
		if (e.key === 'Escape') {
			close();
			return;
		}

		if (e.key === 'Tab') {
			// trap focus
			const nodes = modal.querySelectorAll('*');
			const tabbable = Array.from(nodes).filter(n => n.tabIndex >= 0);

			let index = tabbable.indexOf(document.activeElement);
			if (index === -1 && e.shiftKey) index = 0;

			index += tabbable.length + (e.shiftKey ? -1 : 1);
			index %= tabbable.length;

			tabbable[index].focus();
			e.preventDefault();
		}
	};


	const deleteHandler = async () => {
		showLoadingBar = true;
		const status = await deleteUser(user, uuid);

		if (status === 0) {
			showLoadingBar = false;
			location.reload();
			localStorage.removeItem("uname");
			localStorage.removeItem("uuid")
		}

	}

	const previously_focused = typeof document !== 'undefined' && document.activeElement;

	if (previously_focused) {
		onDestroy(() => {
			previously_focused.focus();
		});
	}
</script>

<svelte:window on:keydown={handle_keydown}/>

<div class="modal-background" on:click={close}></div>

<div class="modal" role="dialog" aria-modal="true" bind:this={modal}>
	<span id="closeModal" on:click={close}><img src="{xMark}" alt="X"></span>
	<slot name="header"></slot>
    <h2><strong style="font-size:23px;">Enter Username</strong></h2>
	<hr>
	<slot></slot>
	
	{#if user}
		<hr>
		{#if !showLoadingBar}
			<button type="submit" on:click={deleteHandler} >Delete Account</button>
		{:else}
			<Loader />
		{/if}
	{/if}
</div>

<style>
	button[type="submit"] {
		background-color: rgb(245, 61, 61);
		text-align: center;
		color: #fff;
		width: 100%;
		margin: 25px 0;
		font-size: 20px;
		font-weight: 700;
		height: 2.5rem;
		border: solid 1px #7f7f7f;
		
	}
	button[type="submit"]:hover {
		background-color: rgb(175, 42, 42);
	}
	#closeModal {
		position: absolute;
		right: 3rem;
		width: 15px;
	}
	.modal-background {
		position: fixed;
		top: 0;
		left: 0;
		width: 100%;
		height: 100%;
		background: rgba(0,0,0,0.3);
		z-index: 8;
	}

	.modal {
		position: absolute;
		left: 50%;
		top: 50%;
		width: calc(100vw - 4em);
		max-width: 32em;
		max-height: calc(100vh - 4em);
		overflow: auto;
		transform: translate(-50%,-50%);
		padding: 1em;
		border-radius: 0.2em;
		background: white;
        z-index: 9;
	}

	button {
		display: block;
	}
</style>