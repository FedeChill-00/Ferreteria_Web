// main.js: Versión completa con bindLogout para productos.html

document.addEventListener('DOMContentLoaded', function() {
    console.log('MAIN.JS CARGADO');
    
    // Verificar sesión solo si NO es página de login
    const isLoginPage = window.location.pathname.includes('index.html') || window.location.pathname === '/';
    if (!isLoginPage) {
        verificarSesion();
        bindLogout(); // Bindar logout en páginas logueadas (ej: productos)
    } else {
        console.log('Página de login – Saltando verificación y logout');
    }
    
    // Update carrito si existe
    updateCartCount();
});

function verificarSesion() {
    const usuarioStr = localStorage.getItem('usuario');
    console.log('Verificando sesión:', usuarioStr ? 'Existe' : 'No');
    
    if (!usuarioStr) {
        console.log('No sesión – Redirigiendo a login');
        window.location.href = 'index.html';
        return false;
    }
    
    try {
        const usuario = JSON.parse(usuarioStr);
        console.log('Sesión válida:', usuario.username, usuario.rol);
        
        // Mostrar usuario en página (opcional: si tienes #userInfo en HTML)
        const userInfo = document.getElementById('userInfo');
        if (userInfo) {
            userInfo.textContent = `Bienvenido, ${usuario.username} (${usuario.rol})`;
        }
        
        return true;
    } catch (error) {
        console.error('Error en sesión:', error);
        localStorage.removeItem('usuario');
        window.location.href = 'index.html';
        return false;
    }
}

// Función para bindar logout al botón (funciona en productos.html)
function bindLogout() {
    const logoutBtn = document.getElementById('logoutBtn');
    if (logoutBtn) {
        console.log('Botón #logoutBtn encontrado – Bindando evento');
        logoutBtn.addEventListener('click', function(e) {
            e.preventDefault();
            console.log('LOGOUT ACTIVADO – Cerrando sesión');
            
            // Limpia sesión actual
            localStorage.removeItem('usuario');
            
            // Opcional: Limpia carrito (comenta si no quieres)
            // localStorage.removeItem('carrito');
            
            // Mensaje en div si existe (agrega <div id="logoutMessage" class="mensaje"></div> en HTML)
            const messageDiv = document.getElementById('logoutMessage');
            if (messageDiv) {
                messageDiv.textContent = 'Sesión cerrada exitosamente. Redirigiendo...';
                messageDiv.className = 'mensaje exito';
                messageDiv.style.display = 'block'; // Muestra si estaba oculto
            } else {
                // Fallback: Console o alert simple (quita alert si prefieres)
                console.log('Sesión cerrada. Redirigiendo al login.');
            }
            
            // Redirige a login
            setTimeout(function() {
                window.location.href = 'index.html';
            }, 1500); // 1.5s para ver mensaje
        });
    } else {
        console.warn('Botón #logoutBtn NO encontrado – Agrega <button id="logoutBtn"> en productos.html');
    }
}

function updateCartCount() {
    const cartCount = document.getElementById('cartCount');
    if (cartCount) {
        const carrito = JSON.parse(localStorage.getItem('carrito') || '[]');
        const total = carrito.reduce((sum, item) => sum + (item.cantidad || 0), 0);
        cartCount.textContent = total;
    }
}