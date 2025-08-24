<script lang="ts">
  const { children } = $props();
</script>

<main>
  {@render children()}
</main>

<style>
  main {
    display: flex;
    flex-direction: column;
    min-height: 100vh;
  }
</style>
