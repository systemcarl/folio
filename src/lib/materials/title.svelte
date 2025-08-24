<script lang="ts">
  import type { Snippet } from 'svelte';
  import Text from './text.svelte';

  const { centred, flex, as, children } : {
    centred ?: boolean;
    flex ?: boolean;
    as : 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6';
    children : Snippet<[]>;
  } = $props();
</script>

<Text
  as={as}
  centred={centred}
  flex={flex}
  typography='title'
>
  {@render children()}
</Text>
