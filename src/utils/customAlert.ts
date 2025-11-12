export function customAlert(stockDisponible: number) {
  // Crear overlay (fondo difuminado)
  const overlay = document.createElement("div");
  overlay.style.cssText = `
    position: fixed;
    inset: 0;
    background: rgba(0, 0, 0, 0.45);
    backdrop-filter: blur(4px);
    display: flex;
    justify-content: center;
    align-items: center;
    z-index: 9999;
    animation: fadeIn 0.25s ease;
  `;

  // Crear el modal
  const modal = document.createElement("div");
  modal.style.cssText = `
    background: #fff;
    padding: 2rem;
    border-radius: 16px;
    box-shadow: 0 10px 35px rgba(0, 0, 0, 0.25);
    width: 90%;
    max-width: 360px;
    text-align: center;
    font-family: 'Poppins', sans-serif;
    animation: popIn 0.3s ease;
  `;

  modal.innerHTML = `
    <style>
      @keyframes fadeIn {
        from { opacity: 0; }
        to { opacity: 1; }
      }
      @keyframes popIn {
        from { transform: scale(0.9); opacity: 0; }
        to { transform: scale(1); opacity: 1; }
      }
      @keyframes fadeOut {
        to { opacity: 0; transform: scale(0.95); }
      }
    </style>

    <div style="
      width: 60px;
      height: 60px;
      background: #fef3c7;
      border-radius: 50%;
      display: flex;
      justify-content: center;
      align-items: center;
      margin: 0 auto 1rem;
    ">
      <svg width="30" height="30" fill="none" stroke="#eab308" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
        <circle cx="15" cy="15" r="12"></circle>
        <line x1="15" y1="9" x2="15" y2="14"></line>
        <line x1="15" y1="19" x2="15.01" y2="19"></line>
      </svg>
    </div>

    <h3 style="
      font-size: 1.25rem;
      font-weight: 600;
      color: #78350f;
      margin-bottom: 0.5rem;
    ">
      Stock máximo alcanzado
    </h3>
    <p style="
      color: #92400e;
      margin-bottom: 1.25rem;
      line-height: 1.4;
    ">
      No puedes agregar más de <strong>${stockDisponible}</strong> unidades.
    </p>
  `;

  overlay.appendChild(modal);
  document.body.appendChild(overlay);

  // Auto-cierre después de 2.5 segundos
  setTimeout(() => {
    modal.style.animation = "fadeOut 0.3s ease";
    setTimeout(() => overlay.remove(), 300);
  }, 2500);
}
