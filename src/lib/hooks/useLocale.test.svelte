<script lang="ts">
  import { defaultLocale } from '$lib/utils/locale';
  import useLocale from './useLocale';

  interface Props {
    src ?: string;
    setLocale ?: () => unknown;
    getLocale ?: (locale : typeof defaultLocale) => void;
  }

  const props : Props = $props();

  const {
    setLocale,
    getLocale,
  } = useLocale();

  $effect(() => {
    if (props.setLocale) setLocale(props.setLocale());
    if (props.getLocale) props.getLocale(getLocale());
  });
</script>
