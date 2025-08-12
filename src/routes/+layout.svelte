<script lang="ts">
  import useThemes from '$lib/hooks/useThemes';

  const { data, children } = $props();

  const { setThemes } = useThemes();

  setThemes(data.themes);
</script>

{@render children()}
