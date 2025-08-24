<script lang="ts">
  import type { Snippet } from 'svelte';
  import Text from './text.svelte';

  const { flex, as, children } : {
    flex ?: boolean;
    as : 'h2' | 'h3' | 'h4' | 'h5' | 'h6' | 'p';
    children : Snippet<[]>;
  } = $props();
</script>

<Text
  as={as}
  inset
  flex={flex}
  typography='subtitle'
>
  {@render children()}
</Text>
