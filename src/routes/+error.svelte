<script lang="ts">
  import { page } from '$app/state';

  import useLocale from '$lib/hooks/useLocale';
  import Content from '$lib/materials/content.svelte';
  import TitleCard from '$lib/materials/titleCard.svelte';

  const { getLocale } = useLocale();
  const errorLocale = getLocale().errors;
  let detail : string = errorLocale.default;
  if (page.status === 400) detail = errorLocale.invalid;
  if (page.status === 401) detail = errorLocale.not_authenticated;
  if (page.status === 403) detail = errorLocale.forbidden;
  if (page.status === 404) detail = errorLocale.not_found;
  if (page.status === 500) detail = errorLocale.unexpected;
</script>

<Content verticalAlignment='centre'>
  <TitleCard
    title={ `${page.status} ${page.error?.message}` }
    subtitle={ detail }
  />
</Content>
