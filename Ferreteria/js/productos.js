// js/productos.js: Lógica para Cargar Productos, Agregar al Carrito con Validación Stock
// Incluye: Notificación en pantalla (toast), límite stock, un solo listener, anti-spam
// Productos cargados desde array local (sin JSON externo)

document.addEventListener('DOMContentLoaded', function() {
    console.log('PRODUCTOS.JS CARGADO - Iniciando...');
    
    // Verificar sesión (redirige si no logueado)
    if (!localStorage.getItem('usuario')) {
        console.log('No hay sesión – Redirigiendo a index.html');
        window.location.href = 'index.html';
        return;
    }
    console.log('Sesión verificada – Usuario OK');
    
    // Objeto global con stocks disponibles por ID (AJUSTA ESTOS VALORES CON TUS PRODUCTOS REALES)
    window.stocksDisponibles = {
        1: 15,  // Ej: Taladro Eléctrico
        2: 120,   // Ej: Martillo de Albañil
        3: 100,   // Ej: Tornillos para Madera
        4: 35,  // Ej: Destornillador Set
        5: 25,   // Ej: Cinta Métrica 5m
        6: 15,  // Ej: Llave Inglesa Ajustable
        7: 10,  // Ej: Pintura Esmalte Blanco
        8: 60,  // Ej: Guantes de Trabajo
        9: 15,  // Ej: Sierra Circular
        10: 4,  // Ej: Cables Eléctricos
        11: 30, // Ej: Combo Griferia para baño
        12: 30  // Ej: Combo ladrillo hueco
        // Agrega más IDs y stocks aquí para tus productos
    };
    
    // Array de productos (AJUSTA ESTOS DATOS CON TUS PRODUCTOS REALES)
    // Asegúrate de que los IDs aquí coincidan con los de window.stocksDisponibles
    let productos = [
            {
        "id": 1,
        "nombre": "Taladro Eléctrico",
        "descripcion": "Taladro inalámbrico de 18V con batería recargable y kit de brocas.",
        "precio": 150000,
        "stock": 15,
        "imagen": "taladro electrico.jpg"
    },
    {
        "id": 2,
        "nombre": "Martillo de Albañil",
        "descripcion": "Martillo ergonómico con mango antideslizante, ideal para construcción.",
        "precio": 8000,
        "stock": 120,
        "imagen": "martillo.jpg"
    },
    {
        "id": 3,
        "nombre": "Tornillos para Madera (Paquete 100)",
        "descripcion": "Tornillos galvanizados de 4cm, resistentes a la corrosión.",
        "precio": 3500,
        "stock": 100,
        "imagen": "tornillos.jpg"
    },
    {
        "id": 4,
        "nombre": "Destornillador Set",
        "descripcion": "Juego de 12 destornilladores de precisión para electrónica y bricolaje.",
        "precio": 12000,
        "stock": 35,
        "imagen": "destornilladores.jpg"
    },
    {
        "id": 5,
        "nombre": "Cinta Métrica 5m",
        "descripcion": "Cinta métrica profesional con bloqueo automático y carcasa resistente.",
        "precio": 4500,
        "stock": 25,
        "imagen": "cinta-metrica.jpg"
    },
    {
        "id": 6,
        "nombre": "Llave Inglesa Ajustable",
        "descripcion": "Llave de 300mm para tuercas y pernos, con mango ergonómico.",
        "precio": 9000,
        "stock": 15,
        "imagen": "llave-inglesa.jpg"
    },
    {
        "id": 7,
        "nombre": "Pintura Esmalte Blanco (Galón)",
        "descripcion": "Pintura de alta calidad para interiores y exteriores, cubre 10m².",
        "precio": 25000,
        "stock": 10,
        "imagen": "pintura.jpg"
    },
    {
        "id": 8,
        "nombre": "Guantes de Trabajo",
        "descripcion": "Guantes de cuero resistentes para protección en obras.",
        "precio": 3000,
        "stock": 60,
        "imagen": "guantes.jpg"
    },
    {
        "id": 9,
        "nombre": "Sierra Circular",
        "descripcion": "Sierra eléctrica de 7-1/4 pulgadas para cortes precisos en madera.",
        "precio": 3500000,
        "stock": 15,
        "imagen": "sierra.jpg"
    },
    {
        "id": 10,
        "nombre": "Cables Eléctricos (Rollo 10m)",
        "descripcion": "Cable multipolar de 2.5mm² para instalaciones eléctricas residenciales.",
        "precio": 17000,
        "stock": 4,
        "imagen": "cables.jpg"
    },
        {
        "id": 11,
        "nombre": "Combo Griferia para baño",
        "descripcion": "Combo Grifería Ramón Soler Civic (bidet + ducha d/ embutir + lavatorio bajo)",
        "precio": 120000,
        "stock": 30,
        "imagen": "baño.png"
    },
        {
        "id": 12,
        "nombre": "Combo ladrillo hueco",
        "descripcion": "Combo Ladrillo Hueco 08x18x33 198 Unidades.",
        "precio": 850000,
        "stock": 30,
        "imagen": "ladrillo.jpg"
    }
    ];
    
    console.log('Productos de ejemplo cargados:', productos.length);
    
    // Renderiza los productos directamente desde el array local
    renderizarProductos(productos);
    
    // UN SOLO LISTENER GLOBAL para botones "Agregar"
    document.addEventListener('click', function(e) {
        if (bloqueandoClics) {
            console.log('Clic ignorado: Procesando agregar anterior...');
            return;
        }
        
        if (e.target.classList.contains('btn-agregar')) {
            const id = parseInt(e.target.dataset.id);
            agregarAlCarrito(id, productos);
        }
    });
    
    updateCartCount();
    console.log('PRODUCTOS.JS INICIALIZADO COMPLETO');
});

// Flag para anti-spam
let bloqueandoClics = false;

function renderizarProductos(productos) {
    console.log('Iniciando renderizado de productos... Cantidad:', productos ? productos.length : 0);
    
    const container = document.getElementById('productosList'); // FIX: Usar #productosList
    if (!container) {
        console.error('ERROR: No se encontró #productosList en HTML. Asegúrate de que productos.html tenga <div id="productosList"></div>');
        // Si no se encuentra, no se puede renderizar, se detiene aquí.
        return;
    }
    
    if (!productos || productos.length === 0) {
        container.innerHTML = '<p style="text-align: center; color: red;">No hay productos disponibles. Verifica el array de productos en productos.js.</p>';
        console.error('Array de productos vacío – No se puede renderizar');
        return;
    }
    
    container.innerHTML = ''; // Limpia el mensaje "Cargando productos..."
    
    productos.forEach(producto => {
        // Usa el stock del producto si está definido, sino el global, sino un fallback alto
        const stock = producto.stock || window.stocksDisponibles[producto.id] || 999;
        const btnDisabled = stock === 0 ? 'disabled' : '';
        
        const card = document.createElement('div');
        card.className = 'producto-card';
        card.innerHTML = `
            <img src="img/${producto.imagen}" alt="${producto.nombre}" onerror="this.src='https://via.placeholder.com/200?text=${producto.nombre}'">
            <h3>${producto.nombre}</h3>
            <p>Precio: $${producto.precio.toLocaleString()}</p>
            <p>Stock disponible: ${stock}</p>
            <button class="btn-agregar" data-id="${producto.id}" ${btnDisabled}>Agregar al Carrito</button>
        `;
        container.appendChild(card);
    });
    
    console.log('Productos renderizados exitosamente:', productos.length);
    mostrarNotificacion(`Cargados ${productos.length} productos disponibles!`, 'success');
}

function agregarAlCarrito(id, productos) {
    if (bloqueandoClics) return;
    
    bloqueandoClics = true;
    console.log('Agregando producto ID:', id);
    
    const producto = productos.find(p => p.id === id);
    if (!producto) {
        mostrarNotificacion('Producto no encontrado.', 'error');
        bloqueandoClics = false;
        return;
    }
    
    // Usa el stock del producto si está definido, sino el global, sino un fallback alto
    const stock = producto.stock || window.stocksDisponibles[id] || 999;
    
    let carrito = JSON.parse(localStorage.getItem('carrito') || '[]');
    const itemExistente = carrito.find(item => item.id === id);
    
    let nuevaCantidad;
    if (itemExistente) {
        nuevaCantidad = itemExistente.cantidad + 1;
        if (nuevaCantidad > stock) {
            console.log('Stock insuficiente para', producto.nombre);
            mostrarNotificacion(`No hay stock suficiente para ${producto.nombre}. Máximo: ${stock} unidades.`, 'error');
            bloqueandoClics = false;
            return;
        }
        itemExistente.cantidad = nuevaCantidad;
        itemExistente.stock = stock; // Asegura que el stock del item en carrito esté actualizado
    } else {
        if (1 > stock) {
            mostrarNotificacion(`Sin stock disponible para ${producto.nombre}.`, 'error');
            bloqueandoClics = false;
            return;
        }
        carrito.push({
            id: producto.id,
            nombre: producto.nombre,
            precio: producto.precio,
            imagen: producto.imagen,
            cantidad: 1,
            stock: stock // Incluye stock para usar en carrito
        });
        nuevaCantidad = 1;
    }
    
    localStorage.setItem('carrito', JSON.stringify(carrito));
    updateCartCount();
    
    mostrarNotificacion(`${producto.nombre} agregado al carrito! (${nuevaCantidad} unidad${nuevaCantidad > 1 ? 'es' : ''})`, 'success');
    console.log('Producto agregado:', producto.nombre);
    
    bloqueandoClics = false;
}

function mostrarNotificacion(mensaje, tipo = 'error') {
    let toast = document.getElementById('notificacion-toast');
    if (!toast) {
        toast = document.createElement('div');
        toast.id = 'notificacion-toast';
        document.body.appendChild(toast);
    }
    
    toast.textContent = mensaje;
    toast.className = tipo; // Asigna 'success' o 'error'
    toast.classList.add('mostrar');
    
    setTimeout(() => {
        toast.classList.remove('mostrar');
        setTimeout(() => {
            if (toast && toast.parentNode) {
                toast.parentNode.removeChild(toast);
            }
        }, 300); // Tiempo para que la transición de salida se complete
    }, 3000); // El toast se muestra por 3 segundos
    
    console.log(`${tipo.toUpperCase()}: ${mensaje}`);
}

function updateCartCount() {
    const cartCountElements = document.querySelectorAll('#cartCount'); // Selecciona todos los elementos con id="cartCount"
    const carrito = JSON.parse(localStorage.getItem('carrito') || '[]');
    const totalItems = carrito.reduce((sum, item) => sum + (item.cantidad || 0), 0);
    
    cartCountElements.forEach(el => {
        el.textContent = totalItems;
    });
    
    console.log('Contador carrito actualizado en productos:', totalItems);
}