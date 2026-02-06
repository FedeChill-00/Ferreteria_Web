// js/carrito.js: Lógica para Carrito, Formulario de Compra y Mensaje de Agradecimiento
// Incluye: Controles de cantidad +/- (de a 1 exacto, sin x2), Límite por stock, anti-clavado

document.addEventListener('DOMContentLoaded', function() {
    console.log('CARRITO.JS CARGADO');
    
    // Verificar sesión (main.js ya lo hace, pero fallback)
    if (!localStorage.getItem('usuario')) {
        window.location.href = 'index.html';
        return;
    }
    
    // NUEVO: Objeto global con stocks disponibles por ID (ajusta según tus productos)
    // Ej: ID 1 (Martillo) stock 10, ID 2 (Destornillador) stock 5, etc. – Agrega más si tienes
    window.stocksDisponibles = {
        1: 10,  // Ej: Martillo
        2: 5,   // Ej: Destornillador
        3: 8,   // Ej: Sierra
        4: 15,  // Ej: Taladro
        5: 20   // Ej: Clavos – Ajusta IDs y stocks reales de tu productos.json
        // Agrega más: , 6: 12, etc.
    };
    
    cargarCarrito();
    bindEventos();
    
    // NUEVO: UN SOLO LISTENER GLOBAL para + / - / quitar (evita acumulación y x2)
    document.addEventListener('click', function(e) {
        if (bloqueandoClics) {
            console.log('Clic ignorado: Procesando cambio anterior...');
            return;
        }
        
        const id = parseInt(e.target.dataset.id);
        
        // Botones + y -
        if (e.target.classList.contains('btn-sumar')) {
            actualizarCantidad(id, 1); // +1 exacto
        } else if (e.target.classList.contains('btn-restar')) {
            actualizarCantidad(id, -1); // -1 exacto
        }
        // Quitar (mantiene aquí para consistencia)
        else if (e.target.classList.contains('btn-quitar')) {
            quitarDelCarrito(id);
            cargarCarrito();
        }
    });
});

// Flag global para anti-clavado y anti-múltiples clics (mínimo)
let bloqueandoClics = false;

function cargarCarrito() {
    const carrito = JSON.parse(localStorage.getItem('carrito') || '[]');
    const container = document.getElementById('carritoItems');
    const totalSection = document.getElementById('carritoTotal');
    const totalSpan = document.getElementById('totalPrecio');
    const vacioMsg = document.getElementById('carritoVacio');
    
    if (carrito.length === 0) {
        container.innerHTML = '';
        if (vacioMsg) vacioMsg.style.display = 'block';
        if (totalSection) totalSection.style.display = 'none';
        bloqueandoClics = false;
        return;
    }
    
    if (vacioMsg) vacioMsg.style.display = 'none';
    
    let total = 0;
    container.innerHTML = '';
    
    carrito.forEach(item => {
        // Stock: Usa del item si existe, sino del global
        const stock = item.stock || window.stocksDisponibles[item.id] || 999; // Fallback ilimitado
        const subtotal = item.precio * item.cantidad;
        const maxCantidad = Math.min(stock, 999); // Límite práctico
        const btnSumarDisabled = item.cantidad >= stock ? 'disabled' : ''; // NUEVO: Deshabilita + si al stock max
        
        const itemDiv = document.createElement('div');
        itemDiv.className = 'item-carrito';
        itemDiv.innerHTML = `
            <img src="img/${item.imagen}" alt="${item.nombre}" onerror="this.src='https://via.placeholder.com/60?text=${item.nombre}'">
            <div class="item-info">
                <h4>${item.nombre}</h4>
                <p class="item-precio">Precio unit: $${item.precio.toLocaleString()}</p>
                <p>Stock disponible: ${stock}</p> <!-- NUEVO: Muestra stock para UX -->
            </div>
            <div class="cantidad-controls">
                <button class="btn-cantidad btn-restar" data-id="${item.id}">-</button>
                <input type="number" class="input-cantidad" value="${item.cantidad}" readonly data-id="${item.id}">
                <button class="btn-cantidad btn-sumar" data-id="${item.id}" ${btnSumarDisabled}>+</button>
            </div>
            <p>Subtotal: $${subtotal.toLocaleString()}</p>
            <button class="btn-quitar" data-id="${item.id}">Quitar</button>
        `;
        container.appendChild(itemDiv);
        total += subtotal;
    });
    
    if (totalSpan) totalSpan.textContent = total.toLocaleString();
    if (totalSection) totalSection.style.display = 'block';
    
    console.log('Carrito cargado:', carrito.length, 'items. Total:', total);
}

function actualizarCantidad(id, delta) {
    if (bloqueandoClics) {
        console.log('Clic bloqueado: Procesando cambio anterior...');
        return;
    }
    
    bloqueandoClics = true;
    console.log('Procesando cambio de cantidad:', delta === 1 ? '+' : '-', 'para ID:', id);
    
    let carrito = JSON.parse(localStorage.getItem('carrito') || '[]');
    const itemIndex = carrito.findIndex(item => item.id === id);
    
    if (itemIndex !== -1) {
        const stock = carrito[itemIndex].stock || window.stocksDisponibles[id] || 999;
        const nuevaCantidad = carrito[itemIndex].cantidad + delta;
        
        // NUEVO: Validación stock para +
        if (delta === 1 && nuevaCantidad > stock) {
            console.log('No se puede sumar: Stock máximo alcanzado (', stock, ') para ID:', id);
            alert(`No hay más stock disponible para ${carrito[itemIndex].nombre}. Máximo: ${stock}`); // Opcional: Quita si no quieres popup
            bloqueandoClics = false;
            return; // No suma, sale
        }
        
        // Validación: Mínimo 1, si <1 remover
        if (nuevaCantidad < 1) {
            carrito.splice(itemIndex, 1);
            console.log('Item removido por cantidad 0:', id);
        } else {
            carrito[itemIndex].cantidad = nuevaCantidad; // Asigna exacta (+1 o -1)
            console.log('Cantidad actualizada (de a 1):', id, 'Nueva cantidad:', nuevaCantidad);
        }
        
        localStorage.setItem('carrito', JSON.stringify(carrito));
        cargarCarrito(); // Recarga con botón + disabled si al max
        updateCartCount();
        
        bloqueandoClics = false; // Reset inmediato (anti-clavado)
        console.log('Bloqueo liberado – Listo para próximo clic');
    } else {
        bloqueandoClics = false;
    }
}

function bindEventos() {
    // Botón confirmar compra
    const confirmarBtn = document.getElementById('confirmarCompra');
    if (confirmarBtn) {
        confirmarBtn.addEventListener('click', function() {
            console.log('Confirmar compra activado');
            const formulario = document.getElementById('formularioCompra');
            if (formulario) formulario.style.display = 'block';
            confirmarBtn.style.display = 'none';
        });
    }
    
    // Formulario envío
    const form = document.getElementById('datosEnvioForm');
    if (form) {
        form.addEventListener('submit', function(e) {
            e.preventDefault();
            console.log('Formulario envío submit');
            
            if (validarFormulario()) {
                procesarCompra();
            }
        });
    }
    
    // Cancelar
    const cancelarBtn = document.getElementById('cancelarCompra');
    if (cancelarBtn) {
        cancelarBtn.addEventListener('click', function() {
            document.getElementById('formularioCompra').style.display = 'none';
            document.getElementById('confirmarCompra').style.display = 'block';
            form.reset();
            document.getElementById('errorMessage').textContent = '';
        });
    }
    
    // Volver a productos
    const volverBtn = document.getElementById('volverProductos');
    if (volverBtn) {
        volverBtn.addEventListener('click', function() {
            window.location.href = 'productos.html';
        });
    }
    
    // Nota: Quitar ya está en el listener global arriba
}

function validarFormulario() {
    const nombre = document.getElementById('nombre').value.trim();
    const apellido = document.getElementById('apellido').value.trim();
    const direccion = document.getElementById('direccion').value.trim();
    const telefono = document.getElementById('telefono').value.trim();
    const email = document.getElementById('email').value.trim();
    const errorDiv = document.getElementById('errorMessage');
    
    if (errorDiv) errorDiv.textContent = '';
    
    if (!nombre || nombre.length < 2) {
        mostrarError('El nombre debe tener al menos 2 caracteres.');
        return false;
    }
    
    if (!apellido || apellido.length < 2) {
        mostrarError('El apellido debe tener al menos 2 caracteres.');
        return false;
    }
    
    if (!direccion || direccion.length < 5) {
        mostrarError('La dirección debe tener al menos 5 caracteres.');
        return false;
    }
    
    if (!telefono || !/^\d{7,15}$/.test(telefono.replace(/\D/g, ''))) {
        mostrarError('El teléfono debe ser numérico y tener entre 7 y 15 dígitos.');
        return false;
    }
    
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        mostrarError('Ingresa un email válido.');
        return false;
    }
    
    return true;
}

function mostrarError(mensaje) {
    const errorDiv = document.getElementById('errorMessage');
    if (errorDiv) {
        errorDiv.textContent = mensaje;
        errorDiv.className = 'mensaje error';
    }
    console.error('Error en formulario:', mensaje);
}

function procesarCompra() {
    console.log('Procesando compra...');
    
    const datos = {
        nombre: document.getElementById('nombre').value.trim(),
        apellido: document.getElementById('apellido').value.trim(),
        direccion: document.getElementById('direccion').value.trim(),
        telefono: document.getElementById('telefono').value.trim(),
        email: document.getElementById('email').value.trim(),
        fecha: new Date().toLocaleString('es-AR'),
        carrito: JSON.parse(localStorage.getItem('carrito') || '[]'),
        total: parseFloat(document.getElementById('totalPrecio').textContent.replace(/\./g, '')) || 0
    };
    
    localStorage.setItem('ultimaCompra', JSON.stringify(datos));
    console.log('Datos de compra guardados:', datos);
    
    localStorage.removeItem('carrito');
    
    document.getElementById('formularioCompra').style.display = 'none';
    document.getElementById('carritoTotal').style.display = 'none';
    
    const mensajeDiv = document.getElementById('mensajeAgradecimiento');
    if (mensajeDiv) {
        mensajeDiv.style.display = 'block';
        console.log('Mensaje de agradecimiento mostrado');
    }
    
    updateCartCount();
    bloqueandoClics = false;
}

function quitarDelCarrito(id) {
    let carrito = JSON.parse(localStorage.getItem('carrito') || '[]');
    carrito = carrito.filter(item => item.id !== id);
    localStorage.setItem('carrito', JSON.stringify(carrito));
    console.log('Item quitado del carrito:', id);
    updateCartCount();
}

function updateCartCount() {
    const cartCount = document.getElementById('cartCount');
    if (cartCount) {
        const carrito = JSON.parse(localStorage.getItem('carrito') || '[]');
        const totalItems = carrito.reduce((sum, item) => sum + (item.cantidad || 0), 0);
        cartCount.textContent = totalItems;
        console.log('Contador carrito actualizado:', totalItems);
    }
}