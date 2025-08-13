<script lang="ts">
  import type { ComponentProps } from 'svelte';
  import InnerTest from './useThemes.inner.test.svelte';

  type InnerProps = ComponentProps<typeof InnerTest>;
  interface Props extends InnerProps {
    innerProps ?: InnerProps;
  }

  const { innerProps, ...outerProps } : Props = $props();
</script>

<InnerTest {...outerProps}>
  <InnerTest {...innerProps} />
</InnerTest>
