// login.js: Login + Registro Completo con Toggle y Validación
// Incluye: Inicialización automática de usuarios específicos (admin, cliente, invitado)

console.log('LOGIN.JS CARGADO');

document.addEventListener('DOMContentLoaded', function() {
    console.log('DOM LISTO – Inicializando login y registro');
    
    // Inicializar usuarios base (admin, cliente, invitado) si no existen
    inicializarUsuariosBase();
    
    const toggleBtn = document.getElementById('toggleRegistro');
    const loginForm = document.getElementById('loginForm');
    const registroSection = document.getElementById('registroSection');
    const volverBtn = document.getElementById('volverLogin');
    const usernameInput = document.getElementById('username');
    const passwordInput = document.getElementById('password');
    const errorDiv = document.getElementById('errorMessage');
    const regUsernameInput = document.getElementById('regUsername');
    const regPasswordInput = document.getElementById('regPassword');
    const regMessageDiv = document.getElementById('regMessage');
    
    if (!loginForm || !registroSection || !toggleBtn || !usernameInput || !passwordInput || !regUsernameInput || !regPasswordInput) {
        console.error('Elementos no encontrados');
        return;
    }
    
    console.log('Elementos OK – Bindando eventos');
    
    // Limpia mensajes iniciales
    if (errorDiv) errorDiv.textContent = '';
    if (regMessageDiv) regMessageDiv.textContent = '';
    
    // Toggle entre login y registro
    toggleBtn.addEventListener('click', function() {
        const isRegistroVisible = registroSection.style.display !== 'none';
        if (isRegistroVisible) {
            // Oculta registro, muestra login
            registroSection.style.display = 'none';
            loginForm.style.display = 'block';
            toggleBtn.textContent = '¿Nuevo usuario? Registrarse';
            console.log('Toggle: Volviendo a login');
        } else {
            // Muestra registro, oculta login
            registroSection.style.display = 'block';
            loginForm.style.display = 'none';
            toggleBtn.textContent = '¿Ya tienes cuenta? Iniciar Sesión';
            console.log('Toggle: Mostrando registro');
        }
    });
    
    // Botón volver a login
    if (volverBtn) {
        volverBtn.addEventListener('click', function() {
            registroSection.style.display = 'none';
            loginForm.style.display = 'block';
            toggleBtn.textContent = '¿Nuevo usuario? Registrarse';
            if (regMessageDiv) regMessageDiv.textContent = '';
        });
    }
    
    // Función común para procesar login
    function procesarLogin(username, password, messageDiv) {
        const usuarios = obtenerUsuarios();
        const usuario = usuarios.find(u => u.username === username && u.password === password);
        
        console.log('Buscando usuario:', username);
        
        if (!usuario) {
            if (messageDiv) {
                messageDiv.textContent = 'Usuario o contraseña incorrectos.';
                messageDiv.className = 'mensaje error show';
            }
            return false;
        }
        
        console.log('LOGIN EXITOSO:', usuario.username, usuario.rol);
        
        const userData = { username: usuario.username, rol: usuario.rol };
        localStorage.setItem('usuario', JSON.stringify(userData));
        
        if (messageDiv) {
            messageDiv.textContent = '¡Login exitoso! Redirigiendo...';
            messageDiv.className = 'mensaje exito show';
        }
        
        setTimeout(function() {
            window.location.href = 'productos.html';
        }, 1000);
        return true;
    }
    
    // Listener para login
    loginForm.addEventListener('submit', function(e) {
        e.preventDefault();
        console.log('LOGIN SUBMIT ACTIVADO');
        
        const username = usernameInput.value.trim();
        const password = passwordInput.value;
        
        if (!username || !password) {
            if (errorDiv) {
                errorDiv.textContent = 'Ingresa usuario y contraseña.';
                errorDiv.className = 'mensaje error show';
            }
            return;
        }
        
        procesarLogin(username, password, errorDiv);
    });
    
    // Listener para registro
    const registroForm = document.getElementById('registroForm');
    if (registroForm) {
        registroForm.addEventListener('submit', function(e) {
            e.preventDefault();
            console.log('REGISTRO SUBMIT ACTIVADO');
            
            const username = regUsernameInput.value.trim();
            const password = regPasswordInput.value;
            
            if (!username || !password) {
                if (regMessageDiv) {
                    regMessageDiv.textContent = 'Ingresa usuario y contraseña.';
                    regMessageDiv.className = 'mensaje error show';
                }
                return;
            }
            
            if (password.length < 3) {
                if (regMessageDiv) {
                    regMessageDiv.textContent = 'La contraseña debe tener al menos 3 caracteres.';
                    regMessageDiv.className = 'mensaje error show';
                }
                return;
            }
            
            const usuarios = obtenerUsuarios();
            if (usuarios.find(u => u.username === username)) {
                if (regMessageDiv) {
                    regMessageDiv.textContent = 'El usuario ya existe. Elige otro.';
                    regMessageDiv.className = 'mensaje error show';
                }
                return;
            }
            
            // Agrega nuevo usuario (rol: cliente)
            usuarios.push({ username: username, password: password, rol: 'cliente' });
            localStorage.setItem('usuarios', JSON.stringify(usuarios));
            
            console.log('REGISTRO EXITOSO:', username);
            
            if (regMessageDiv) {
                regMessageDiv.textContent = '¡Usuario registrado! Iniciando sesión...';
                regMessageDiv.className = 'mensaje exito show';
            }
            
            // Auto-login
            setTimeout(function() {
                procesarLogin(username, password, regMessageDiv);
            }, 1000);
        });
    }
    
    console.log('LOGIN Y REGISTRO INICIALIZADOS');
});

// Función para obtener usuarios de localStorage
function obtenerUsuarios() {
    let usuarios = localStorage.getItem('usuarios');
    if (!usuarios) {
        usuarios = [];
    } else {
        usuarios = JSON.parse(usuarios);
    }
    return usuarios;
}

// Función para inicializar usuarios base (admin, cliente, invitado)
function inicializarUsuariosBase() {
    const usuarios = obtenerUsuarios();
    
    // Agrega admin si no existe
    if (!usuarios.find(u => u.username === 'admin')) {
        usuarios.push({ username: 'admin', password: '123', rol: 'administrador' });
        console.log('Admin creado automáticamente');
    }
    
    // Agrega cliente si no existe
    if (!usuarios.find(u => u.username === 'cliente')) {
        usuarios.push({ username: 'cliente', password: '456', rol: 'cliente' });
        console.log('Cliente creado automáticamente');
    }
    
    // Agrega invitado si no existe
    if (!usuarios.find(u => u.username === 'invitado')) {
        usuarios.push({ username: 'invitado', password: '789', rol: 'invitado' });
        console.log('Invitado creado automáticamente');
    }
    
    // Guarda todos los usuarios en localStorage
    localStorage.setItem('usuarios', JSON.stringify(usuarios));
    console.log('Usuarios base inicializados. Total:', usuarios.length);
}