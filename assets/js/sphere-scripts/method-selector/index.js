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

// ********************** 3. Comportamiento principal: DOMContentLoaded + setInterval
document.addEventListener("DOMContentLoaded", function() {
  // Intervalo en milisegundos para revisar si se han actualizado las shipping options
  const CHECK_INTERVAL = 500;

  setInterval(() => {

    // 1. Buscar y limpiar título (Opcional)
    // Asumiendo que tienes un store selector con cierta clase o ID
    // const storeSelector = document.querySelector('#some-store-selector'); 
    // if (storeSelector) {
    //   updateTitle(storeSelector);
    // }

    // 3. Crear el contenedor de botones si aún no existe
    //    (O si tienes tu propia lógica, puedes revisar si ya fue creado)
    addButtonsContainer("sphere-method-selector");

    // 4. Configurar la funcionalidad de los botones (asocia eventos, etc.)
    //    Esto, si ya se configuró una vez, no se volverá a configurar porque
    //    internamente tu código (setupButtonFunctionality) revisa si los listeners ya están conectados.
    setupButtonFunctionality();

    

  }, CHECK_INTERVAL);
});

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
  // Selecciona el fieldset de opciones de envío
  const shippingOptionsFieldset = document.querySelector('#checkout-shipping-options');
  if (!shippingOptionsFieldset) return;
  
  // Selecciona los elementos de la lista de shipping options
  const listItems = shippingOptionsFieldset.querySelectorAll('ul.form-checklist > li');
  if (!listItems.length) return;
  
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
    // Remueve la clase 'active' de todos los botones del contenedor y la agrega solo al botón clicado
    buttonsContainer.querySelectorAll("button").forEach(boton => boton.classList.remove("active"));
    clickedButton.classList.add("active");
  };

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

  // Función manejadora para el botón "Recojo en tienda"
  const handleRecojoClick = (event) => {
    event.preventDefault();
    event.stopPropagation();
    updateActiveButton(btnRecojo);
    filterShippingOptions(listItems, true);
    console.log('Click btnRecojo');
  };
  
  // Función manejadora para el botón "Entrega a domicilio"
  const handleEntregaClick = (event) => {
    event.preventDefault();
    event.stopPropagation();
    updateActiveButton(btnEntrega);
    filterShippingOptions(listItems, false);
    console.log('Click btnEntrega');
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
