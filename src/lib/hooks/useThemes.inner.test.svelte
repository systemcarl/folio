<script lang="ts">
  import type { Snippet } from 'svelte';
  import type { Section, Typography, Graphic } from '$lib/utils/theme';
  import useThemes from './useThemes';

  interface Props {
    setThemes ?: (() => Record<string, unknown>);
    getThemes ?: ((themes : Record<string, unknown>) => void);
    setTheme ?: (() => string | undefined);
    getTheme ?: ((theme : string) => void);
    setSection ?: (() => string);
    setTypography ?: (() => string);
    setGraphic ?: (() => string);
    getSection ?: ((section : Section) => void);
    getTypography ?: ((typography : Typography) => void);
    getGraphic ?: ((graphic ?: Graphic) => void);
    onSectionChange ?: ((section : Section) => void);
    onTypographyChange ?: ((typography : Typography) => void);
    onGraphicChange ?: ((graphic ?: Graphic) => void);
    makeProvider ?: {
      keys ?: {
        sectionKey ?: string;
        typographyKey ?: string;
        graphicKey ?: string;
      };
      className ?: ((className : string) => void);
    };
    children ?: Snippet<[]>;
  }

  const props : Props = $props();

  const {
    setThemes,
    getThemes,
    setTheme,
    getTheme,
    getSection,
    getTypography,
    getGraphic,
    makeProvider,
    onSectionChange,
    onTypographyChange,
    onGraphicChange,
  } = useThemes();

  if (props.makeProvider) {
    const {
      provider,
      setSection,
      setTypography,
      setGraphic,
    } = makeProvider(props.makeProvider.keys ?? {});
    if (props.makeProvider.className) {
      props.makeProvider.className(provider.class);
    }

    $effect(() => {
      if (props.setSection) setSection(props.setSection());
      if (props.setTypography) setTypography(props.setTypography());
      if (props.setGraphic) setGraphic(props.setGraphic());
    });
  }

  if (props.onSectionChange) onSectionChange(props.onSectionChange);
  if (props.onTypographyChange) onTypographyChange(props.onTypographyChange);
  if (props.onGraphicChange) onGraphicChange(props.onGraphicChange);

  $effect.pre(() => {
    if (props.setThemes) setThemes(props.setThemes());
    if (props.getThemes) props.getThemes(getThemes());
    if (props.setTheme) setTheme(props.setTheme());
    if (props.getTheme) props.getTheme(getTheme());
    if (props.getSection) props.getSection(getSection());
    if (props.getTypography) props.getTypography(getTypography());
    if (props.getGraphic) props.getGraphic(getGraphic());
  });
</script>

{@render props.children?.()}
