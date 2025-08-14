<script lang="ts">
  import useThemes from '$lib/hooks/useThemes';
  import useGraphics from '$lib/hooks/useGraphics';

  const { data, children } = $props();

  const { setThemes } = useThemes();
  const { setGraphics } = useGraphics();

  setThemes(data.themes);
  setGraphics(data.graphics);
</script>

{@render children()}
