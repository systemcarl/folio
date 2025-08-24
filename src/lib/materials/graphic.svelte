<script lang="ts">
  import type { Graphic } from '$lib/utils/theme';
  import useGraphics from '$lib/hooks/useGraphics';
  import useThemes from '$lib/hooks/useThemes';

  const { src, graphic : graphicKey, alt } : {
    src ?: string;
    graphic ?: string;
    alt ?: string;
  } = $props();

  const { isGraphic, renderGraphic } = useGraphics();
  const { onGraphicChange, makeProvider } = useThemes();

  let graphic = $state<Graphic | undefined>();
  let content = $derived<string>(renderGraphic(src ?? graphic?.src ?? ''));

  const { provider } = makeProvider({ graphicKey });
  onGraphicChange((g) => { graphic = g; });
  const { class : className, ...rest } = provider;
</script>

{#if content}
  <div class={`${className} graphic`} {...rest} aria-hidden="true">
    {@html content}
  </div>
{:else if (!isGraphic(src ?? graphic?.src ?? ''))}
  <img
    class="graphic"
    src={src ?? graphic?.src ?? ''}
    alt={alt ?? graphic?.alt ?? ''}
  />
{/if}
