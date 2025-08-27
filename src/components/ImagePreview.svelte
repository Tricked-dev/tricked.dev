<script lang="ts">
  import { onMount, onDestroy } from 'svelte';

  let mounted = false;
  let previewElement: HTMLDivElement;
  let currentImage = '';
  let showPreview = false;
  let mouseX = 0;
  let mouseY = 0;
  let imageLoaded = false;

  function handleMouseEnter(event: MouseEvent) {
    const target = event.target as HTMLElement;
    const imageUrl = target.dataset.imagePreview;
    
    if (imageUrl) {
      currentImage = imageUrl;
      showPreview = true;
      imageLoaded = false;
      updatePosition(event);
    }
  }

  function handleMouseMove(event: MouseEvent) {
    if (showPreview) {
      updatePosition(event);
    }
  }

  function handleMouseLeave() {
    showPreview = false;
    currentImage = '';
    imageLoaded = false;
  }

  function updatePosition(event: MouseEvent) {
    const padding = 20;
    const previewWidth = 300;
    const previewHeight = 200;
    
    mouseX = event.clientX + padding;
    mouseY = event.clientY + padding;
    
    // Adjust position if preview would go off screen
    if (mouseX + previewWidth > window.innerWidth) {
      mouseX = event.clientX - previewWidth - padding;
    }
    
    if (mouseY + previewHeight > window.innerHeight) {
      mouseY = event.clientY - previewHeight - padding;
    }
  }

  function handleImageLoad() {
    imageLoaded = true;
  }

  onMount(() => {
    mounted = true;
    
    // Add event listeners to all image preview links
    const links = document.querySelectorAll('[data-preview-enabled="true"]');
    
    links.forEach(link => {
      link.addEventListener('mouseenter', handleMouseEnter);
      link.addEventListener('mousemove', handleMouseMove);
      link.addEventListener('mouseleave', handleMouseLeave);
    });

    return () => {
      links.forEach(link => {
        link.removeEventListener('mouseenter', handleMouseEnter);
        link.removeEventListener('mousemove', handleMouseMove);
        link.removeEventListener('mouseleave', handleMouseLeave);
      });
    };
  });

  onDestroy(() => {
    // Cleanup is handled in onMount return
  });
</script>

{#if mounted && showPreview}
  <div 
    bind:this={previewElement}
    class="image-preview-tooltip"
    style="left: {mouseX}px; top: {mouseY}px;"
  >
    <div class="preview-content">
      {#if !imageLoaded}
        <div class="loading-spinner">
          <div class="spinner"></div>
        </div>
      {/if}
      <img 
        src={currentImage} 
        alt="Preview" 
        on:load={handleImageLoad}
        class:loaded={imageLoaded}
      />
    </div>
  </div>
{/if}

<style>
  .image-preview-tooltip {
    position: fixed;
    z-index: 9999;
    pointer-events: none;
    max-width: 300px;
    max-height: 200px;
  }

  .preview-content {
    position: relative;
    background: white;
    border: 2px solid #e2e8f0;
    border-radius: 8px;
    box-shadow: 0 10px 25px rgba(0, 0, 0, 0.2);
    overflow: hidden;
    min-height: 100px;
    min-width: 150px;
  }

  .loading-spinner {
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    z-index: 2;
  }

  .spinner {
    width: 24px;
    height: 24px;
    border: 2px solid #f3f3f3;
    border-top: 2px solid #3498db;
    border-radius: 50%;
    animation: spin 1s linear infinite;
  }

  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }

  img {
    width: 100%;
    height: auto;
    max-width: 300px;
    max-height: 200px;
    object-fit: contain;
    opacity: 0;
    transition: opacity 0.2s ease;
  }

  img.loaded {
    opacity: 1;
  }

  /* Dark mode support */
  @media (prefers-color-scheme: dark) {
    .preview-content {
      background: #1f2937;
      border-color: #374151;
    }
    
    .spinner {
      border-color: #4b5563;
      border-top-color: #60a5fa;
    }
  }
</style>