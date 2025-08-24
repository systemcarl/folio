<script lang="ts">
  import type { Snippet } from 'svelte';
  import useThemes from '$lib/hooks/useThemes';

  const { centred, flex, inset, typography, as = 'span', children } : {
    centred ?: boolean;
    flex ?: boolean;
    inset ?: boolean;
    typography ?: 'body' | 'title' | 'subtitle';
    as ?: 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6' | 'p' | 'span';
    children : Snippet<[]>;
  } = $props();

  const { makeProvider } = useThemes();
  const { provider } = makeProvider({ typographyKey : typography });
  const { class : classes, ...attr } = provider;

  const className = [classes, 'text'];
  if (centred) className.push('text-centred');
  if (flex) className.push('text-flex');
  if (inset) className.push('text-inset');
</script>

<svelte:element
  {...attr}
  class="{className.join(' ')}"
  this={as}
>
  {@render children()}
</svelte:element>
