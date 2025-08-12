<script lang="ts">
  import useThemes from './useThemes';

  interface Props {
    setThemes ?: (() => Record<string, unknown>);
    getThemes ?: ((themes : Record<string, unknown>) => void);
    setTheme ?: (() => string | undefined);
    getTheme ?: ((theme : string) => void);
    makeProvider ?: {
      keys ?: {
        sectionKey ?: string;
        typographyKey ?: string;
        graphicKey ?: string;
      };
      className ?: ((className : string) => void);
    };
  }

  const props : Props = $props();

  const {
    setThemes,
    getThemes,
    setTheme,
    getTheme,
    makeProvider,
  } = useThemes();

  if (props.setThemes) setThemes(props.setThemes());
  if (props.getThemes) props.getThemes(getThemes());
  if (props.setTheme) setTheme(props.setTheme());
  if (props.getTheme) props.getTheme(getTheme());
  if (props.makeProvider) {
    const provider = makeProvider(props.makeProvider.keys ?? {}).provider;
    props.makeProvider.className?.(provider.class);
  }
</script>
