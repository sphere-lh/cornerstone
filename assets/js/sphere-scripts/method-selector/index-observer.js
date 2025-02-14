// Variables globales
const topTime = new Date();
topTime.setHours(11, 0, 0, 0); // Establece el horario
const methodId = 3; // Índice del método a forzar

/* *********
Este módulo elimina el texto (Opcional) del título
********** */
const updateTitle = storeSelector => {
  const optionalText = storeSelector?.querySelector('.optimizedCheckout-contentSecondary')
  optionalText?.remove()
}

// Variable global para controlar si se seleccionó un método
let methodSelected = false;

// Función para actualizar el estado del botón "Continuar"
const updateContinueButtonState = () => {
  const continueButton = document.getElementById("checkout-shipping-continue");
  if (continueButton) {
    // Deshabilita el botón si no se ha seleccionado ningún método
    continueButton.disabled = !methodSelected;
  }
};

// Función para configurar los listeners en los radio buttons de shipping
const setupShippingMethodListeners = () => {
  const radioButtons = document.querySelectorAll('#checkout-shipping-options input[type="radio"]');
  if (!radioButtons.length) return;

  radioButtons.forEach(radio => {
    radio.addEventListener('change', function () {
      if (this.checked) {
        // Una vez que el usuario selecciona una opción, se marca la variable
        methodSelected = true;
        updateContinueButtonState();
      }
    });
  });
};

// Inicialmente, se deshabilita el botón "Continuar"
updateContinueButtonState();

/* *********
Este módulo es un observador permanente del DOM
y tiene como objetivo revisar si las shipping options y
el store selector están presentes. En caso sea así,
se modifican estos elementos.
********** */
const observer = new MutationObserver(mutations => {
  mutations.forEach(mutation => {
    safeDOMUpdate(() => {
      // Ejemplo: se agrega un contenedor de botones (según tu lógica)
      addButtonsContainer("sphere-method-selector");
      setupButtonFunctionality();
      // Configuramos los listeners en los métodos de envío
      setupShippingMethodListeners();
      // Actualizamos el estado del botón por si se agregó o modificó en el DOM
      updateContinueButtonState();
    });
  });
});

// Observa cambios en todo el body
observer.observe(document.body, { childList: true, subtree: true })

/* *********
Este módulo desconecta temporalmente el observador
para realizar modificaciones seguras en el DOM y
luego lo reactiva, evitando bucles de observación.
********** */
const safeDOMUpdate = func => {
  observer.disconnect()
  func()
  observer.observe(document.body, { childList: true, subtree: true })
}


// ****************************** Create Buttons Container

// Función auxiliar para crear un botón con texto y clases adicionales.
function crearBoton(texto, claseExtra) {
  const boton = document.createElement("button");
  boton.textContent = texto;
  boton.className = `btn ${claseExtra}`;

  // Deshabilitar funcionalidades por defecto al hacer click
  boton.addEventListener("click", function (event) {
    event.preventDefault();   // Evita la acción por defecto
    event.stopPropagation();  // Evita la propagación del evento
  });
  return boton;
}

function addButtonsContainerStyles() {
  const style = document.createElement("style");
  style.textContent = `
    /* Estilos para el contenedor específico de los botones */
    #sphere-method-selector {
      display: flex;
      gap: 16px;
      margin: 16px 0;
    }
    
    /* Estilos base para los botones dentro del contenedor */
    #sphere-method-selector .btn {
      padding: 12px 24px;
      font-size: 1.1rem;
      background-color: white;
      color: black;
      border: 1px solid black;
      border-radius: 8px;
      cursor: pointer;
      transition: all 0.2s ease;
      margin: 8px;
    }
    
    /* Efecto hover: sombra al pasar el mouse */
    #sphere-method-selector .btn:hover {
      box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
    }
    
    /* Efecto active: sombra y pequeño movimiento cuando se hace click */
    #sphere-method-selector .btn:active {
      box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
      transform: translateY(2px);
    }
    
    /* Estilo para el botón activo (seleccionado) */
    #sphere-method-selector .btn.active {
      background-color: #ddd;
      box-shadow: 0 4px 8px rgba(0, 0, 0, 0.3);
    }
  `;
  document.head.appendChild(style);
}

function createButtonsContainer(id = 'method-selector') {
  // Add buttonContainer styles
  addButtonsContainerStyles();

  // Crear un contenedor para los botones
  const botonesContainer = document.createElement("div");
  botonesContainer.id = id;
  botonesContainer.className = "botones-envio";

  // Crear los dos botones
  const botonRecojo = crearBoton("Recojo en tienda", "btn-primary");
  const botonEntrega = crearBoton("Entrega a domicilio", "btn-secondary");

  // Agregar los botones al contenedor
  botonesContainer.appendChild(botonRecojo);
  botonesContainer.appendChild(botonEntrega);
  return botonesContainer
}

// ********************************************************************************

// ************* Add buttons container to Checkout

function addButtonsContainer(id = 'method-selector') {

  // Verificar si no está creado, sino terminar
  if (document.getElementById(id)) return

  // Obtener el fieldset de shipping options usando su ID
  const shippingFieldset = document.getElementById("checkout-shipping-options");
  if (!shippingFieldset) return

  // Obtener <legend> dentro del fieldset
  const legend = shippingFieldset?.querySelector("legend");
  if (!legend) return

  // Insertar el contenedor de botones justo después del <legend>
  legend.insertAdjacentElement("afterend", createButtonsContainer(id));
}

// ***********************************************************
// *************************** Add buttons Functionality

function setupButtonFunctionality() {
  const shippingOptionsFieldset = document.querySelector('#checkout-shipping-options');
  if (!shippingOptionsFieldset) return;
  
  // Selecciona el contenedor de botones por su id "sphere-method-selector"
  const buttonsContainer = document.getElementById("sphere-method-selector");
  if (!buttonsContainer) return;
  
  // Asumimos que dentro del contenedor existen dos botones 
  // (el primero: "Recojo en tienda", el segundo: "Entrega a domicilio")
  const botones = buttonsContainer.querySelectorAll("button");
  if (botones.length < 2) return;
  const [btnRecojo, btnEntrega] = botones;
  
  // Función auxiliar para actualizar el botón activo
  const updateActiveButton = (clickedButton) => {
    buttonsContainer.querySelectorAll("button").forEach(boton => {
      boton.classList.remove("active");
    });
    clickedButton.classList.add("active");
  };

  // Función manejadora para el botón "Recojo en tienda"
  const handleRecojoClick = (event) => {
    event.preventDefault();
    event.stopPropagation();
    updateActiveButton(btnRecojo);
    
    // Cada vez que hacemos clic, tomamos los listItems **actuales**
    const shippingOptionsFieldset = document.querySelector('#checkout-shipping-options');
    if (!shippingOptionsFieldset) return;
    const listItems = shippingOptionsFieldset.querySelectorAll('ul.form-checklist > li');
    if (!listItems.length) return;

    filterShippingOptions(listItems, true);
  };
  
  // Función manejadora para el botón "Entrega a domicilio"
  const handleEntregaClick = (event) => {
    event.preventDefault();
    event.stopPropagation();
    updateActiveButton(btnEntrega);

    // Lo mismo: adquirimos la lista actual de <li>
    const shippingOptionsFieldset = document.querySelector('#checkout-shipping-options');
    if (!shippingOptionsFieldset) return;
    const listItems = shippingOptionsFieldset.querySelectorAll('ul.form-checklist > li');
    if (!listItems.length) return;

    filterShippingOptions(listItems, false);
  };

  // Añadimos listeners solo si no se han agregado antes
  if (!btnRecojo.dataset.listenerAttached) {
    btnRecojo.addEventListener("click", handleRecojoClick);
    btnRecojo.dataset.listenerAttached = "true";
    // Simula el click en el primer botón para que se muestre por defecto
    btnRecojo.click();
  }

  if (!btnEntrega.dataset.listenerAttached) {
    btnEntrega.addEventListener("click", handleEntregaClick);
    btnEntrega.dataset.listenerAttached = "true";
  }
}

// Función encargada de filtrar las opciones de envío
  // segun `recojoEnTienda` (true = costo 0, false = costo > 0).
function filterShippingOptions(listItems, recojoEnTienda) {
  if (!listItems) return;

  listItems.forEach(item => {
    // Intentar obtener el elemento que contiene el precio
    const priceElement = item.querySelector('.shippingOption-price');
    if (!priceElement) {
      // Si no hay elemento de precio, mejor ocultar
      item.style.display = 'none';
      return;
    }

    // Extraer el texto, por ejemplo "S/.0.00", y convertirlo a número
    const priceText = priceElement.textContent.trim(); // "S/.0.00"
    // Eliminar todo lo que no sea dígito o punto (.)
    const numericPrice = parseFloat(priceText.replace(/[^\d.]/g, '')) || 0;

    // Si es recojoEnTienda, sólo mostramos métodos con costo 0
    if (recojoEnTienda) {
      if (numericPrice === 0) {
        item.style.display = "list-item";
      } else {
        item.style.display = "none";
      }
    } else {
      // Entrega a domicilio: métodos con costo > 0
      if (numericPrice > 0) {
        item.style.display = "list-item";
      } else {
        item.style.display = "none";
      }
    }
  });
}