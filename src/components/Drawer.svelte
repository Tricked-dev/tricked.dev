<script>
  import { onMount } from 'svelte';

  // Canvas size
  const width = 700;
  const height = 500;

  // Drawing variables
  let canvas;
  let ctx;
  let isDrawing = false;
  let lastX = 0;
  let lastY = 0;
  
  // Tool settings
  let selectedColor = '#000000';
  let brushSize = 5;
  let eraserMode = false;
  let brushType = 'round'; // Default brush type
  
  // Brush types
  const brushTypes = [
    { id: 'round', name: 'Round', icon: '●' },
    { id: 'square', name: 'Square', icon: '■' },
    { id: 'calligraphy', name: 'Calligraphy', icon: '/' },
    { id: 'spray', name: 'Spray', icon: '✺' },
  ];
  
  // Color palette
  const colors = [
    '#000000', '#ffffff', '#ff0000', '#00ff00', '#0000ff', 
    '#ffff00', '#00ffff', '#ff00ff', '#a52a2a', '#808080'
  ];

  // Initialize canvas on component mount
  onMount(() => {
    ctx = canvas.getContext('2d');
    
    // Set canvas to white background
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, width, height);
    
    // Initialize drawing events
    setupEvents();
  });

  function setupEvents() {
    canvas.addEventListener('mousedown', startDrawing);
    canvas.addEventListener('mousemove', draw);
    canvas.addEventListener('mouseup', stopDrawing);
    canvas.addEventListener('mouseout', stopDrawing);
    
    // Touch support
    canvas.addEventListener('touchstart', handleTouch);
    canvas.addEventListener('touchmove', handleTouchMove);
    canvas.addEventListener('touchend', stopDrawing);
  }

  function startDrawing(e) {
    isDrawing = true;
    [lastX, lastY] = [e.offsetX, e.offsetY];
    
    // For spray brush, start immediately
    if (brushType === 'spray' && isDrawing) {
      drawSpray(e.offsetX, e.offsetY);
    }
  }

  function draw(e) {
    if (!isDrawing) return;
    
    const currentX = e.offsetX;
    const currentY = e.offsetY;
    const currentColor = eraserMode ? '#ffffff' : selectedColor;
    
    switch(brushType) {
      case 'round':
        drawRoundBrush(currentX, currentY, currentColor);
        break;
      case 'square':
        drawSquareBrush(currentX, currentY, currentColor);
        break;
      case 'calligraphy':
        drawCalligraphyBrush(currentX, currentY, currentColor);
        break;
      case 'spray':
        drawSpray(currentX, currentY);
        break;
      default:
        drawRoundBrush(currentX, currentY, currentColor);
    }
    
    [lastX, lastY] = [currentX, currentY];
  }
  
  function drawRoundBrush(x, y, color) {
    ctx.beginPath();
    ctx.moveTo(lastX, lastY);
    ctx.lineTo(x, y);
    ctx.strokeStyle = color;
    ctx.lineWidth = brushSize;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.stroke();
  }
  
  function drawSquareBrush(x, y, color) {
    ctx.beginPath();
    ctx.moveTo(lastX, lastY);
    ctx.lineTo(x, y);
    ctx.strokeStyle = color;
    ctx.lineWidth = brushSize;
    ctx.lineCap = 'square';
    ctx.lineJoin = 'miter';
    ctx.stroke();
  }
  
  function drawCalligraphyBrush(x, y, color) {
    ctx.beginPath();
    ctx.moveTo(lastX, lastY);
    ctx.lineTo(x, y);
    ctx.strokeStyle = color;
    ctx.lineWidth = brushSize;
    ctx.lineCap = 'butt';
    
    // Calculate angle of line
    const angle = Math.atan2(y - lastY, x - lastX);
    ctx.setTransform(
      Math.cos(angle), Math.sin(angle), 
      -Math.sin(angle), Math.cos(angle), 
      x, y
    );
    
    // Draw flattened line
    ctx.lineWidth = brushSize;
    ctx.lineCap = 'butt';
    ctx.moveTo(0, 0);
    ctx.lineTo(-Math.sqrt((x - lastX) ** 2 + (y - lastY) ** 2), 0);
    ctx.stroke();
    
    // Reset transformation
    ctx.setTransform(1, 0, 0, 1, 0, 0);
  }
  
  function drawSpray(x, y) {
    const density = brushSize * 2;
    const radius = brushSize * 2;
    
    ctx.fillStyle = eraserMode ? '#ffffff' : selectedColor;
    
    for (let i = 0; i < density; i++) {
      const offsetX = Math.random() * 2 - 1;
      const offsetY = Math.random() * 2 - 1;
      const distance = Math.sqrt(offsetX * offsetX + offsetY * offsetY);
      
      if (distance <= 1) { // Ensure we're within a unit circle
        const sprayX = x + offsetX * radius;
        const sprayY = y + offsetY * radius;
        
        ctx.beginPath();
        ctx.arc(sprayX, sprayY, 0.5, 0, Math.PI * 2);
        ctx.fill();
      }
    }
  }

  function stopDrawing() {
    isDrawing = false;
  }

  function handleTouch(e) {
    e.preventDefault();
    const touch = e.touches[0];
    const mouseEvent = new MouseEvent('mousedown', {
      clientX: touch.clientX,
      clientY: touch.clientY
    });
    canvas.dispatchEvent(mouseEvent);
  }

  function handleTouchMove(e) {
    e.preventDefault();
    const touch = e.touches[0];
    const rect = canvas.getBoundingClientRect();
    const mouseEvent = new MouseEvent('mousemove', {
      offsetX: touch.clientX - rect.left,
      offsetY: touch.clientY - rect.top
    });
    canvas.dispatchEvent(mouseEvent);
  }

  function clearCanvas() {
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, width, height);
  }

  function toggleEraser() {
    eraserMode = !eraserMode;
  }

  function saveAsPNG() {
    const link = document.createElement('a');
    link.download = 'drawing.png';
    link.href = canvas.toDataURL('image/png');
    link.click();
  }
</script>

<div class="drawer-content flex flex-col w-[90rem]">
  <div class="flex flex-row items-center p-4 gap-4">
    <div class="card bg-base-100 shadow-xl">
      <div class="card-body p-2">
        <canvas 
          bind:this={canvas} 
          width={width} 
          height={height}
          class="border border-base-300 rounded-md cursor-crosshair"
        ></canvas>
      </div>
    </div>
    
    <div class="card bg-base-100 shadow-xl w-full max-w-3xl">
      <div class="card-body">
        <h2 class="card-title">Drawing Tools</h2>
        
        <!-- Color Selection -->
        <div class="divider">Colors</div>
        <div class="flex flex-wrap gap-2">
          {#each colors as color}
            <button 
              class="btn btn-circle w-8 h-8 border-2 {selectedColor === color && !eraserMode ? 'ring ring-primary ring-offset-2' : ''}"
              style="background-color: {color}; border-color: {color === '#ffffff' ? '#ddd' : color};"
              on:click={() => { selectedColor = color; eraserMode = false; }}
            ></button>
          {/each}
          <label class="flex items-center gap-2">
            <span class="btn btn-circle btn-sm">+</span>
            <input 
              type="color" 
              bind:value={selectedColor} 
              on:change={() => eraserMode = false}
              class="w-8 h-8 cursor-pointer"
            >
          </label>
        </div>
        
        <!-- Brush Types -->
        <div class="divider">Brush Type</div>
        <div class="flex flex-wrap gap-2">
          {#each brushTypes as brush}
            <button 
              on:click={() => brushType = brush.id}
              class="btn {brushType === brush.id ? 'btn-primary' : 'btn-outline'}"
            >
              <span class="mr-1">{brush.icon}</span>
              {brush.name}
            </button>
          {/each}
          <button 
            class="btn {eraserMode ? 'btn-secondary' : 'btn-outline'}"
            on:click={toggleEraser}
          >
            <span class="mr-1">⌫</span>
            Eraser
          </button>
        </div>
        
        <!-- Brush Size -->
        <div class="divider">Brush Size</div>
        <div class="form-control w-full">
          <label class="label">
            <span class="label-text">Size: {brushSize}px</span>
          </label>
          <input 
            type="range" 
            min="1" 
            max="50" 
            bind:value={brushSize}
            class="range range-primary"
          />
        </div>
        
        <!-- Actions -->
        <div class="divider">Actions</div>
        <div class="flex flex-wrap gap-2">
          <button class="btn btn-outline" on:click={clearCanvas}>
            Clear Canvas
          </button>
          <button class="btn btn-success" on:click={saveAsPNG}>
            Save as PNG
          </button>
        </div>
      </div>
    </div>
  </div>
</div>