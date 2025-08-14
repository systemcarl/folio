<script lang="ts">
  import useGraphics from './useGraphics';

  interface Props {
    src ?: string;
    setGraphics ?: (() => Record<string, string>);
    renderGraphic ?: ((src : string) => void);
  }

  const props : Props = $props();

  const {
    setGraphics,
    renderGraphic,
  } = useGraphics();

  $effect(() => {
    if (props.setGraphics) setGraphics(props.setGraphics());
    if (props.src && props.renderGraphic)
      props.renderGraphic(renderGraphic(props.src));
  });
</script>
