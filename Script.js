document.addEventListener('DOMContentLoaded', function() {
    const form = document.getElementById('historiaClinicaForm');
    const modal = document.getElementById('confirmModal');
    const closeModal = document.getElementById('closeModal');
    const guardarBtn = document.getElementById('guardarBtn');

    // Mostrar/ocultar campos condicionales
    setupConditionalFields();
    
    // Guardar borrador
    guardarBtn.addEventListener('click', guardarBorrador);
    
    // Enviar formulario
    form.addEventListener('submit', enviarHistoriaClinica);
    
    // Cerrar modal
    closeModal.addEventListener('click', () => {
        modal.style.display = 'none';
    });
    
    // Cargar datos guardados al iniciar
    cargarDatosGuardados();

    function setupConditionalFields() {
        // Hospitalizaciones
        document.querySelectorAll('input[name="hospitalizaciones"]').forEach(radio => {
            radio.addEventListener('change', function() {
                const detalle = document.getElementById('detalleHospitalizacion');
                detalle.style.display = this.value === 'si' ? 'block' : 'none';
            });
        });

        // Cirugías
        document.querySelectorAll('input[name="cirugias"]').forEach(radio => {
            radio.addEventListener('change', function() {
                const detalle = document.getElementById('detalleCirugias');
                detalle.style.display = this.value === 'si' ? 'block' : 'none';
            });
        });

        // Medicamentos
        document.querySelectorAll('input[name="medicamentos"]').forEach(radio => {
            radio.addEventListener('change', function() {
                const detalle = document.getElementById('detalleMedicamentos');
                detalle.style.display = this.value === 'si' ? 'block' : 'none';
            });
        });

        // Alergias
        document.querySelectorAll('input[name="alergias"]').forEach(radio => {
            radio.addEventListener('change', function() {
                const detalle = document.getElementById('detalleAlergias');
                detalle.style.display = this.value === 'si' ? 'block' : 'none';
            });
        });

        // Validación de checkboxes mutuamente excluyentes
        setupMutuallyExclusiveCheckboxes('enfermedades', 'ninguna');
        setupMutuallyExclusiveCheckboxes('antFamiliares', 'ninguna');
        setupMutuallyExclusiveCheckboxes('sintomas', 'ninguno');
    }

    function setupMutuallyExclusiveCheckboxes(groupName, exclusiveValue) {
        const checkboxes = document.querySelectorAll(`input[name="${groupName}"]`);
        const exclusiveCheckbox = document.querySelector(`input[name="${groupName}"][value="${exclusiveValue}"]`);

        checkboxes.forEach(checkbox => {
            checkbox.addEventListener('change', function() {
                if (this.value === exclusiveValue && this.checked) {
                    // Si se marca "ninguna", desmarcar todos los demás
                    checkboxes.forEach(cb => {
                        if (cb !== this) cb.checked = false;
                    });
                } else if (this.checked && exclusiveCheckbox.checked) {
                    // Si se marca cualquier otro, desmarcar "ninguna"
                    exclusiveCheckbox.checked = false;
                }
            });
        });
    }

    function guardarBorrador() {
        const formData = new FormData(form);
        const data = {};
        
        // Convertir FormData a objeto
        for (let [key, value] of formData.entries()) {
            if (data[key]) {
                if (Array.isArray(data[key])) {
                    data[key].push(value);
                } else {
                    data[key] = [data[key], value];
                }
            } else {
                data[key] = value;
            }
        }
        
        // Guardar en localStorage
        localStorage.setItem('historiaClinicaBorrador', JSON.stringify(data));
        
        mostrarMensaje('Borrador guardado exitosamente', 'success');
    }

    function cargarDatosGuardados() {
        const datosGuardados = localStorage.getItem('historiaClinicaBorrador');
        if (datosGuardados) {
            const data = JSON.parse(datosGuardados);
            
            // Llenar campos del formulario
            Object.keys(data).forEach(key => {
                const element = form.querySelector(`[name="${key}"]`);
                if (element) {
                    if (element.type === 'checkbox' || element.type === 'radio') {
                        if (Array.isArray(data[key])) {
                            data[key].forEach(value => {
                                const checkbox = form.querySelector(`[name="${key}"][value="${value}"]`);
                                if (checkbox) checkbox.checked = true;
                            });
                        } else {
                            const radio = form.querySelector(`[name="${key}"][value="${data[key]}"]`);
                            if (radio) radio.checked = true;
                        }
                    } else {
                        element.value = data[key];
                    }
                }
            });
            
            // Mostrar campos condicionales si es necesario
            setupConditionalFields();
            mostrarMensaje('Datos del borrador cargados', 'info');
        }
    }

    function enviarHistoriaClinica(e) {
        e.preventDefault();
        
        if (!validarFormulario()) {
            return;
        }
        
        // Simular envío (aquí conectarías con tu backend)
        const formData = new FormData(form);
        const data = {};
        
        for (let [key, value] of formData.entries()) {
            if (data[key]) {
                if (Array.isArray(data[key])) {
                    data[key].push(value);
                } else {
                    data[key] = [data[key], value];
                }
            } else {
                data[key] = value;
            }
        }
        
        // Aquí puedes agregar la lógica para enviar por email o WhatsApp
        console.log('Historia Clínica:', data);
        
        // Generar resumen para WhatsApp
        const resumen = generarResumenWhatsApp(data);
        
        // Limpiar borrador guardado
        localStorage.removeItem('historiaClinicaBorrador');
        
        // Mostrar modal de confirmación
        modal.style.display = 'block';
        
        // Opcional: Abrir WhatsApp con el resumen
        // const numeroMedico = "1234567890"; // Reemplazar con número real
        // const mensajeWhatsApp = encodeURIComponent(resumen);
        // window.open(`https://wa.me/${numeroMedico}?text=${mensajeWhatsApp}`, '_blank');
    }

    function validarFormulario() {
        const camposRequeridos = form.querySelectorAll('[required]');
        let valido = true;
        
        camposRequeridos.forEach(campo => {
            if (!campo.value.trim()) {
                campo.style.borderColor = '#e74c3c';
                valido = false;
            } else {
                campo.style.borderColor = '#27ae60';
            }
        });
        
        if (!valido) {
            mostrarMensaje('Por favor complete todos los campos requeridos', 'error');
            // Scroll al primer campo con error
            const primerError = form.querySelector('input[style*="rgb(231, 76, 60)"], select[style*="rgb(231, 76, 60)"], textarea[style*="rgb(231, 76, 60)"]');
            if (primerError) {
                primerError.scrollIntoView({ behavior: 'smooth', block: 'center' });
            }
        }
        
        return valido;
    }

    function generarResumenWhatsApp(data) {
        let resumen = "📋 *HISTORIA CLÍNICA DIGITAL*\n\n";
        
        // Datos personales
        resumen += "👤 *DATOS PERSONALES*\n";
        resumen += `• Nombre: ${data.nombres || 'No especificado'}\n`;
        resumen += `• Cédula: ${data.cedula || 'No especificado'}\n`;
        resumen += `• Edad: ${data.edad || 'No especificado'} años\n`;
        resumen += `• Sexo: ${data.sexo || 'No especificado'}\n`;
        resumen += `• Teléfono: ${data.telefono || 'No especificado'}\n\n`;
        
        // Motivo de consulta
        resumen += "🩺 *MOTIVO DE CONSULTA*\n";
        resumen += `${data.motivoConsulta || 'No especificado'}\n`;
        if (data.tiempoSintomas) {
            resumen += `• Tiempo de síntomas: ${data.tiempoSintomas.replace('-', ' ')}\n`;
        }
        resumen += "\n";
        
        // Antecedentes médicos
        resumen += "📋 *ANTECEDENTES MÉDICOS*\n";
        resumen += `• Hospitalizaciones: ${data.hospitalizaciones || 'No especificado'}\n`;
        if (data.detallesHosp) {
            resumen += `  Detalles: ${data.detallesHosp}\n`;
        }
        resumen += `• Cirugías: ${data.cirugias || 'No especificado'}\n`;
        if (data.detallesCir) {
            resumen += `  Detalles: ${data.detallesCir}\n`;
        }
        
        // Enfermedades
        if (data.enfermedades) {
            const enfermedades = Array.isArray(data.enfermedades) ? data.enfermedades : [data.enfermedades];
            resumen += `• Enfermedades crónicas: ${enfermedades.join(', ')}\n`;
        }
        resumen += "\n";
        
        // Medicamentos
        resumen += "💊 *MEDICAMENTOS*\n";
        resumen += `• Toma medicamentos: ${data.medicamentos || 'No especificado'}\n`;
        if (data.listaMedicamentos) {
            resumen += `  Lista: ${data.listaMedicamentos}\n`;
        }
        resumen += `• Alergias: ${data.alergias || 'No especificado'}\n`;
        if (data.listaAlergias) {
            resumen += `  Alergias: ${data.listaAlergias}\n`;
        }
        resumen += "\n";
        
        // Hábitos
        resumen += "🫁 *HÁBITOS*\n";
        resumen += `• Fuma: ${data.fuma || 'No especificado'}\n`;
        resumen += `• Alcohol: ${data.alcohol || 'No especificado'}\n`;
        resumen += `• Ejercicio: ${data.ejercicio || 'No especificado'}\n\n`;
        
        // Síntomas actuales
        if (data.sintomas) {
            const sintomas = Array.isArray(data.sintomas) ? data.sintomas : [data.sintomas];
            resumen += "🌡️ *SÍNTOMAS ACTUALES*\n";
            resumen += `${sintomas.join(', ')}\n`;
            if (data.otrosSintomas) {
                resumen += `Otros: ${data.otrosSintomas}\n`;
            }
            resumen += "\n";
        }
        
        // Información adicional
        if (data.informacionAdicional) {
            resumen += "ℹ️ *INFORMACIÓN ADICIONAL*\n";
            resumen += `${data.informacionAdicional}\n\n`;
        }
        
        resumen += `📅 Fecha: ${new Date().toLocaleDateString('es-ES')}\n`;
        resumen += `⏰ Hora: ${new Date().toLocaleTimeString('es-ES')}`;
        
        return resumen;
    }

    function mostrarMensaje(mensaje, tipo) {
        // Crear elemento de mensaje
        const messageDiv = document.createElement('div');
        messageDiv.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            padding: 15px 20px;
            border-radius: 8px;
            color: white;
            font-weight: 600;
            z-index: 9999;
            max-width: 300px;
            animation: slideIn 0.3s ease-out;
        `;
        
        // Colores según el tipo
        switch (tipo) {
            case 'success':
                messageDiv.style.backgroundColor = '#27ae60';
                break;
            case 'error':
                messageDiv.style.backgroundColor = '#e74c3c';
                break;
            case 'info':
                messageDiv.style.backgroundColor = '#3498db';
                break;
            default:
                messageDiv.style.backgroundColor = '#95a5a6';
        }
        
        messageDiv.textContent = mensaje;
        document.body.appendChild(messageDiv);
        
        // Remover después de 3 segundos
        setTimeout(() => {
            messageDiv.remove();
        }, 3000);
    }
});

// Estilos para animación
const style = document.createElement('style');
style.textContent = `
    @keyframes slideIn {
        from {
            transform: translateX(100%);
            opacity: 0;
        }
        to {
            transform: translateX(0);
            opacity: 1;
        }
    }
`;
document.head.appendChild(style);
