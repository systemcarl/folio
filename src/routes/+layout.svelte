<script lang="ts">
  import useLocale from '$lib/hooks/useLocale';
  import useThemes from '$lib/hooks/useThemes';
  import useGraphics from '$lib/hooks/useGraphics';

  const { data, children } = $props();

  const { setLocale } = useLocale();
  const { setThemes } = useThemes();
  const { setGraphics } = useGraphics();

  setLocale(data.locale);
  setThemes(data.themes);
  setGraphics(data.graphics);
</script>

{@render children()}
