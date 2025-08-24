<script lang="ts">
  import type { Snippet } from 'svelte';
  import Background from './background.svelte';

  const { verticalAlignment = 'top', children } : {
    verticalAlignment ?: 'top' | 'centre';
    children : Snippet<[]>;
  } = $props();

  const vAlign = verticalAlignment === 'centre' ? 'center' : 'flex-start';
</script>

<section>
  <Background>
    <div class="layout" style="--vertical-alignment: {vAlign};">
      {@render children()}
    </div>
  </Background>
</section>

<style>
  section {
    display: flex;
    flex-direction: column;
    width: 100%;
  }

  section:last-child {
    flex-grow: 1;
  }

  .layout {
    display: flex;
    flex-grow: 1;
    width: 100%;
    flex-direction: column;
    justify-content: center;
    align-items: var(--vertical-alignment);
    gap: var(--layout-spacing);
    padding: var(--layout-spacing);
  }
</style>
