export function customConfirm(message: string, itemName: string): Promise<boolean> {
  return new Promise((resolve) => {
    // Crear el overlay
    const overlay = document.createElement('div');
    overlay.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background: rgba(0, 0, 0, 0.5);
      backdrop-filter: blur(4px);
      display: flex;
      justify-content: center;
      align-items: center;
      z-index: 10000;
      animation: fadeIn 0.2s ease;
    `;

    // Crear el modal
    const modal = document.createElement('div');
    modal.style.cssText = `
      background: white;
      padding: 2rem;
      border-radius: 12px;
      box-shadow: 0 10px 40px rgba(0, 0, 0, 0.2);
      max-width: 400px;
      width: 90%;
      animation: slideIn 0.3s ease;
    `;

    // Crear el contenido del modal
    modal.innerHTML = `
      <style>
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes slideIn {
          from { transform: translateY(-20px); opacity: 0; }
          to { transform: translateY(0); opacity: 1; }
        }
        @keyframes fadeOut {
          from { opacity: 1; }
          to { opacity: 0; }
        }
      </style>
      <div style="text-align: center;">
        <div style="
          width: 50px;
          height: 50px;
          background: #fee;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          margin: 0 auto 1rem;
        ">
          <svg width="24" height="24" fill="none" stroke="#dc2626" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <circle cx="12" cy="12" r="10"></circle>
            <line x1="12" y1="8" x2="12" y2="12"></line>
            <line x1="12" y1="16" x2="12.01" y2="16"></line>
          </svg>
        </div>
        <h3 style="
          margin: 0 0 0.5rem;
          font-size: 1.25rem;
          font-weight: 600;
          color: #1f2937;
        ">Confirmar eliminación</h3>
        <p style="
          margin: 0 0 1.5rem;
          color: #6b7280;
          line-height: 1.5;
        ">${message} <strong style="color: #1f2937;">"${itemName}"</strong>?</p>
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
            background: #dc2626;
            color: white;
            border-radius: 8px;
            font-size: 0.875rem;
            font-weight: 500;
            cursor: pointer;
            transition: all 0.2s;
          ">Eliminar</button>
        </div>
      </div>
    `;

    overlay.appendChild(modal);
    document.body.appendChild(overlay);

    // Agregar efectos hover
    const confirmBtn = modal.querySelector('.confirm-btn') as HTMLButtonElement;
    const cancelBtn = modal.querySelector('.cancel-btn') as HTMLButtonElement;

    confirmBtn.addEventListener('mouseenter', () => {
      confirmBtn.style.background = '#b91c1c';
    });
    confirmBtn.addEventListener('mouseleave', () => {
      confirmBtn.style.background = '#dc2626';
    });

    cancelBtn.addEventListener('mouseenter', () => {
      cancelBtn.style.background = '#f9fafb';
    });
    cancelBtn.addEventListener('mouseleave', () => {
      cancelBtn.style.background = 'white';
    });

    // Manejar clicks
    confirmBtn.addEventListener('click', () => {
      overlay.style.animation = 'fadeOut 0.2s ease';
      setTimeout(() => {
        document.body.removeChild(overlay);
        resolve(true);
      }, 200);
    });

    cancelBtn.addEventListener('click', () => {
      overlay.style.animation = 'fadeOut 0.2s ease';
      setTimeout(() => {
        document.body.removeChild(overlay);
        resolve(false);
      }, 200);
    });

    // Cerrar al hacer click fuera del modal
    overlay.addEventListener('click', (e) => {
      if (e.target === overlay) {
        overlay.style.animation = 'fadeOut 0.2s ease';
        setTimeout(() => {
          document.body.removeChild(overlay);
          resolve(false);
        }, 200);
      }
    });

    // Cerrar con tecla ESC
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        overlay.style.animation = 'fadeOut 0.2s ease';
        setTimeout(() => {
          document.body.removeChild(overlay);
          resolve(false);
        }, 200);
        document.removeEventListener('keydown', handleEscape);
      }
    };
    document.addEventListener('keydown', handleEscape);
  });
}