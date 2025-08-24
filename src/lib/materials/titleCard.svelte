<script lang="ts">
  import Title from './title.svelte';
  import Subtitle from './subtitle.svelte';
  import Graphic from './graphic.svelte';

  const { title, subtitle } : {
    title ?: string;
    subtitle ?: string;
  } = $props();
</script>

<div class="card">
  <Title as="h1" centred flex>{ title }</Title>
  <div class="subtitle">
    <Subtitle as="h2" flex>{ subtitle }</Subtitle>
    <div class="filler">
      <div class="filler-content">
        <Graphic graphic="titleAccent" />
      </div>
    </div>
  </div>
</div>

<style>
  .card {
    display: flex;
    flex-direction: column;
    align-items: left;
    width: fit-content;
    min-width: 200px;
  }

  .subtitle {
    display: flex;
    width: 100%;
    flex-grow: 1;
    flex-direction: row;
    align-items: end;
  }

  .filler {
    position: relative;
    height: 100%;
    flex-grow: var(--title-graphic-shift, 1);
  }

  .filler-content {
    position: absolute;
    top: var(--title-graphic-top);
    right: var(--title-graphic-right);
    width: var(--title-graphic-size);
    height: var(--title-graphic-size);
    transition: all 0.1s ease;
  }
</style>
