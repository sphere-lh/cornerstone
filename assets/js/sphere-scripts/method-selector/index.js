// Variables globales
const topTime = new Date();
topTime.setHours(11, 0, 0, 0); // Establece hoy a las 18:00:00
const methodId = 3; // Índice del método a forzar

/* *********
Este módulo elimina el texto (Opcional) del título
********** */
const updateTitle = storeSelector => {
  const optionalText = storeSelector?.querySelector('.optimizedCheckout-contentSecondary')
  optionalText?.remove()
}

/* *********
Este módulo es un obsevador permanente del DOM
y tiene como objetivo revisar si las shipping
options y el store selector están presentes. En
caso sea así, se modifican estos elementos.
********** */

const observer = new MutationObserver(mutations => {
  mutations.forEach(mutation => {
    safeDOMUpdate(() => {
      addButtonsContainer("sphere-method-selector")
      setupButtonFunctionality()
      // convertShippingMethodsToSelect()
    })
  })
})

// Convert Shipping-methods to Select list
const convertShippingMethodsToSelect = () => {
  // Selecciona el fieldset de opciones de envío
  const shippingOptionsFieldset = document.querySelector('#checkout-shipping-options');
  if (!shippingOptionsFieldset) return

  // Selecciona la lista de radio buttons
  const radioList = shippingOptionsFieldset.querySelector('.form-checklist');
  if (!radioList) return

  // Select radioButtons
  const radioButtons = radioList.querySelectorAll('input[type="radio"]');
  if (!radioButtons) return

  // Crea el elemento select
  const select = document.createElement('select');
  select.id = 'shipping-options-select';
  // select.classList.add('tu-clase-estilizada'); // Opcional: agrega clases para personalizar estilos

  // Itera sobre cada radio button para crear las opciones del select
  radioButtons.forEach(radio => {
    // Encuentra la etiqueta asociada al radio button (usando el atributo for)
    const label = shippingOptionsFieldset.querySelector(`label[for="${radio.id}"]`);
    // Extrae el texto de la opción (por ejemplo, descripción y precio)
    const optionText = label.textContent.trim();

    // Crea la opción
    const option = document.createElement('option');
    option.value = radio.value;
    option.textContent = optionText;

    // Si el radio button está marcado, selecciona la opción
    if (radio.checked) {
      option.selected = true;
    }

    // Agrega la opción al select
    select.appendChild(option);
  });

  // Oculta la lista original de radio buttons para que el usuario solo vea el select
  //radioList.style.display = 'none';

  // Inserta el select en el DOM, por ejemplo, al final del fieldset
  shippingOptionsFieldset.appendChild(select);

  // Vincula el evento change del select para actualizar la selección del radio button
  select.addEventListener('change', function () {
    const selectedValue = this.value;
    radioButtons.forEach(radio => {
      if (radio.value === selectedValue) {
        radio.checked = true;
        // Dispara el evento change para que BigCommerce actualice los costos de envío
        radio.dispatchEvent(new Event('change', { bubbles: true }));
      } else {
        radio.checked = false;
      }
    });
  });
}

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
  console.log('Se creó el container con id:', id);
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
  console.log('Se agrego container con id:', id);
}

// ***********************************************************
// *************************** Add buttons Functionality

function setupButtonFunctionality() {
  // Selecciona el fieldset de opciones de envío
  const shippingOptionsFieldset = document.querySelector('#checkout-shipping-options');
  if (!shippingOptionsFieldset) return;

  // Selecciona los elementos de la lista de shipping options.
  // Suponemos que la lista está estructurada como un <ul> con <li> y que existen al menos dos elementos.
  const listItems = shippingOptionsFieldset.querySelectorAll('ul.form-checklist > li');
  if (listItems.length < 2) return;

  // Selecciona el contenedor de botones por su id "sphere-method-selector"
  const buttonsContainer = document.getElementById("sphere-method-selector");
  if (!buttonsContainer) return;

  // Asumimos que dentro del contenedor existen dos botones (el primero: "Recojo en tienda", el segundo: "Entrega a domicilio")
  const botones = buttonsContainer.querySelectorAll("button");
  if (botones.length < 2) return;
  const [btnRecojo, btnEntrega] = botones;

  // Función manejadora para el botón "Recojo en tienda"
  const handleRecojoClick = (event) => {
    event.preventDefault();
    event.stopPropagation();
    showListItems(listItems, [1, 1, 1, 0, 0]);
  };

  // Función manejadora para el botón "Entrega a domicilio"
  const handleEntregaClick = (event) => {
    event.preventDefault();
    event.stopPropagation();
    showListItems(listItems, [0, 0, 0, 1, 1]);
  };

  // Verificar si el botón ya tiene asignado el _listener_ (utilizando un atributo data)
  if (!btnRecojo.dataset.listenerAttached) {
    btnRecojo.addEventListener("click", handleRecojoClick);
    btnRecojo.dataset.listenerAttached = "true";
    // Simula el click en el primer botón para que se muestre por defecto
    btnRecojo.click();
  }

  if (!btnEntrega.dataset.listenerAttached) {
    btnEntrega.addEventListener("click", handleEntregaClick);
    btnEntrega.dataset.listenerAttached = "true";
    // Simula el click en el primer botón para que se muestre por defecto
    btnRecojo.click();
  }

}

function showListItems(listItems, toShow = []) {
  // Verificar que listItems no sea nulo o undefined
  if (!listItems) return;

  // Recorrer cada elemento de listItems
  for (let i = 0; i < listItems.length; i++) {
    // Si existe toShow[i] y es distinto de cero, se muestra el elemento,
    // de lo contrario se oculta.
    if (toShow[i] && toShow[i] !== 0) {
      // Usamos "list-item" para respetar la propiedad de visualización por defecto de un <li>
      const now = new Date();
      console.log('Current hour:', now);
      if (i === methodId && now > topTime)
        listItems[i].style.display = "none";
      else
        listItems[i].style.display = "list-item";
    } else {
      listItems[i].style.display = "none";
    }
  }
}