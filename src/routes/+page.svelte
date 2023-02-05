<script>
	import ChatBox from './ChatBox.svelte';
	import { deleteOlderMessages } from '$lib/config/controllers';
	import { onMount } from 'svelte';

	onMount(async () => {
		await deleteOlderMessages();
	})
	
</script>

<svelte:head>
	<title>FAST-CFD Chat</title>
	<meta name="description" content="A random group chat targetted towards students of FAST-CFD campus" />
</svelte:head>

<section>
	<ChatBox />
</section>

<style>
	section {
		display: flex;
		flex-direction: column;
		justify-content: center;
		align-items: center;
		flex: 0.6;
	}

</style>
