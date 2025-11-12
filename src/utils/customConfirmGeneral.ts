export function customConfirmGeneral(
  message: string,
  title: string = "Confirmar acción"
): Promise<boolean> {
  return new Promise((resolve) => {
    // Crear overlay
    const overlay = document.createElement("div");
    overlay.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background: rgba(0, 0, 0, 0.45);
      backdrop-filter: blur(4px);
      display: flex;
      justify-content: center;
      align-items: center;
      z-index: 10000;
      animation: fadeIn 0.2s ease;
    `;

    // Crear modal
    const modal = document.createElement("div");
    modal.style.cssText = `
      background: #fff;
      padding: 2rem;
      border-radius: 12px;
      box-shadow: 0 10px 40px rgba(0, 0, 0, 0.2);
      max-width: 420px;
      width: 90%;
      animation: slideIn 0.3s ease;
      text-align: center;
    `;

    // Contenido del modal
    modal.innerHTML = `
      <style>
        @keyframes fadeIn { from {opacity: 0;} to {opacity: 1;} }
        @keyframes slideIn { from {transform: translateY(-20px); opacity: 0;} to {transform: translateY(0); opacity: 1;} }
        @keyframes fadeOut { from {opacity: 1;} to {opacity: 0;} }
      </style>
      <div>
        <div style="
          width: 50px;
          height: 50px;
          background: #eff6ff;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          margin: 0 auto 1rem;
        ">
          <svg width="26" height="26" fill="none" stroke="#2563eb" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M5 12l5 5L20 7" />
          </svg>
        </div>
        <h3 style="
          margin: 0 0 0.5rem;
          font-size: 1.25rem;
          font-weight: 600;
          color: #1f2937;
        ">${title}</h3>
        <p style="
          margin: 0 0 1.5rem;
          color: #6b7280;
          line-height: 1.5;
        ">${message}</p>
        <div style="
          display: flex;
          gap: 0.75rem;
          justify-content: center;
        ">
          <button class="cancel-btn" style="
            padding: 0.625rem 1.5rem;
            border: 1px solid #d1d5db;
            background: white;
            color: #374151;
            border-radius: 8px;
            font-size: 0.875rem;
            font-weight: 500;
            cursor: pointer;
            transition: all 0.2s;
          ">Cancelar</button>
          <button class="confirm-btn" style="
            padding: 0.625rem 1.5rem;
            border: none;
            background: #2563eb;
            color: white;
            border-radius: 8px;
            font-size: 0.875rem;
            font-weight: 500;
            cursor: pointer;
            transition: all 0.2s;
          ">Confirmar</button>
        </div>
      </div>
    `;

    overlay.appendChild(modal);
    document.body.appendChild(overlay);

    // Botones
    const confirmBtn = modal.querySelector(".confirm-btn") as HTMLButtonElement;
    const cancelBtn = modal.querySelector(".cancel-btn") as HTMLButtonElement;

    confirmBtn.addEventListener("mouseenter", () => {
      confirmBtn.style.background = "#1d4ed8";
    });
    confirmBtn.addEventListener("mouseleave", () => {
      confirmBtn.style.background = "#2563eb";
    });

    cancelBtn.addEventListener("mouseenter", () => {
      cancelBtn.style.background = "#f9fafb";
    });
    cancelBtn.addEventListener("mouseleave", () => {
      cancelBtn.style.background = "white";
    });

    // Eventos de cierre
    confirmBtn.addEventListener("click", () => {
      overlay.style.animation = "fadeOut 0.2s ease";
      setTimeout(() => {
        document.body.removeChild(overlay);
        resolve(true);
      }, 200);
    });

    cancelBtn.addEventListener("click", () => {
      overlay.style.animation = "fadeOut 0.2s ease";
      setTimeout(() => {
        document.body.removeChild(overlay);
        resolve(false);
      }, 200);
    });

    overlay.addEventListener("click", (e) => {
      if (e.target === overlay) {
        overlay.style.animation = "fadeOut 0.2s ease";
        setTimeout(() => {
          document.body.removeChild(overlay);
          resolve(false);
        }, 200);
      }
    });

    // Tecla ESC
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        overlay.style.animation = "fadeOut 0.2s ease";
        setTimeout(() => {
          document.body.removeChild(overlay);
          resolve(false);
        }, 200);
        document.removeEventListener("keydown", handleEscape);
      }
    };
    document.addEventListener("keydown", handleEscape);
  });
}
