// const storeIdSelected = ''

/* *********
Este módulo agrega comportamiento al keyInput. Cuando el
keyInput es seleccionada entonces la store selector debe
desaparecer, y aparecer en caso contrario.
********** */
const hideStoreSelector = (storeSelector, shippingOptions) => {
  if (storeSelector && shippingOptions) {
    // Obtener keyInput: Envio a domiciolio (2)
    const inputId = shippingOptions
      .querySelector('ul.form-checklist li:nth-child(2) label.form-label')
      ?.getAttribute('for')
    const keyInput = document.getElementById(inputId)

    // Mostrar/Ocultar storeSelector
    document.getElementById('store-selector-fieldset').style.display = keyInput?.checked ? 'none' : 'block'

    const selector = storeSelector.querySelector('#field_52Input')
    // Ocultar store "."
    selector.querySelector('option[value="0"]').style.display = 'none' // Comentar en caso no se maneje la store '.'

    // Setear opción "." cuando keyInput está seleccionada
    if (selector && keyInput?.checked) {
      selector.selectedIndex = 1 // Se elige la tienda '.'
      selector.dispatchEvent(new Event('change', { bubbles: true }))
    } else if (selector && selector.selectedIndex === 1) {
      // selector.selectedIndex = 0 // No se elige tienda
      selector.selectedIndex = 2 // Se elige tienda "2".
      selector.dispatchEvent(new Event('change', { bubbles: true }))

      // Add form-field--error class to div.form-field
      // const parent = selector.closest('.form-field')
      // parent?.classList.add('form-field--error')
    }
  }
}

/* *********
Este módulo mueve el store selector hacia el pie
de las shipping options
********** */
const moveStoreSelector = (storeSelector, shippingOptions) => {
  if (storeSelector && shippingOptions) {
    // const item = document.createElement('li')
    // item.appendChild(storeSelector)
    // shippingOptions.querySelector('ul.form-checklist')?.appendChild(item)

    // Seleccionamos el fieldset con el id 'checkout-shipping-options'
    const shippingOptionsFieldset = document.getElementById('checkout-shipping-options')
    const nextFieldset = shippingOptionsFieldset?.nextElementSibling

    // Si se encuentra un form-fieldset después de las shipping options, entonces insertar el storeSelector
    if (nextFieldset && nextFieldset.classList.contains('form-fieldset')) {
      // Creamos un nuevo fieldset
      const newFieldset = document.createElement('fieldset')
      newFieldset.id = 'store-selector-fieldset'
      newFieldset.appendChild(storeSelector)

      // Insertamos el nuevo fieldset después del fieldset 'checkout-shipping-options'
      if (newFieldset?.hasChildNodes()) {
        console.log(newFieldset)
        shippingOptionsFieldset.insertAdjacentElement('afterend', newFieldset)
      }
    }
  }
}

/* *********
Este módulo elimina el texto (Opcional) del título
********** */
const updateTitle = storeSelector => {
  const optionalText = storeSelector?.querySelector('.optimizedCheckout-contentSecondary')
  optionalText?.remove()
}

/* *********
Observador: Revisa cambios en el Checkout
********** */

// const observer = new MutationObserver(mutations => {
//   mutations.forEach(mutation => {
//     // const storeSelector = document.querySelector('.dynamic-form-field.dynamic-form-field--field_52') // Comment to use closes() to get that element
//     const storeSelectorChild = document.querySelector("#field_52Input");
//     const storeSelector = storeSelectorChild.closest(".dynamic-form-field.dynamic-form-field--field_52");
//     const shippingOptions = document.querySelector('#checkout-shipping-options')

//     console.log('Hello')
//     if (storeSelector && shippingOptions) {
//       // Realizamos cambios en el DOM
//       safeDOMUpdate(() => {
//         updateTitle(storeSelector)
//         moveStoreSelector(storeSelector, shippingOptions)
//         hideStoreSelector(storeSelector, shippingOptions)
//       })
//     }
//   })
// })

const observer = new MutationObserver(mutations => {
  mutations.forEach(mutation => {
    // Actualización segura
    safeDOMUpdate(() => {
      createSelectFromShippingOptions()
    })

    // Log
    console.log('Cambios realizados')
  })
})

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


function createSelectFromShippingOptions() {
  // 1. Selecciona el fieldset principal
  const shippingOptionsFieldset = document.querySelector('#checkout-shipping-options');
  if (!shippingOptionsFieldset) return;

  // 1.1. Verificar si el SELECT ya existe
  const existingSelect = shippingOptionsFieldset.querySelector('#sphere-shipping-method-select');
  if (existingSelect) {
    // Si existe, salimos para evitar recrearlo varias veces
    return;
  }

  // 2. Obtén la lista de <li> que contienen cada opción de envío
  const optionsList = shippingOptionsFieldset.querySelectorAll('.form-checklist-item');
  if (!optionsList.length) return;

  // 3. Crea el SELECT
  const selectElement = document.createElement('select');
  selectElement.id = "sphere-shipping-method-select";
  selectElement.classList.add("form-select"); // Clase para estilos, opcional

  // (Opcional) Guarda los radio inputs en un array si luego necesitas manipularlos
  const radioInputs = [];

  // 4. Recorre cada opción para crear un <option> en el SELECT
  optionsList.forEach(option => {
    const radioInput = option.querySelector('input[type="radio"]');
    if (!radioInput) return;

    // Guarda el radio input para referencia futura (si lo necesitas)
    radioInputs.push(radioInput);

    // Busca los elementos donde se encuentra la descripción y el precio
    const labelElement = option.querySelector('.shippingOption-desc');
    const priceElement = option.querySelector('.shippingOption-price');

    // Extrae el texto si existen
    const label = labelElement ? labelElement.textContent.trim() : '';
    const price = priceElement ? priceElement.textContent.trim() : '';

    // Crea la opción solo si tenemos al menos un label
    if (label) {
      const optionElement = document.createElement('option');
      optionElement.value = radioInput.value;

      // Si existe precio, combínalo en el texto, si no, solo usa el label
      optionElement.textContent = price ? `${label} (${price})` : label;

      // Si el radio estaba marcado, marcamos la opción en el SELECT
      if (radioInput.checked) {
        optionElement.selected = true;
      }

      selectElement.appendChild(optionElement);
    }
  });

  // 5. Elimina u oculta la lista de radios original antes de insertar el SELECT
  //    - Si quieres eliminarla completamente:
  // shippingOptionsFieldset.innerHTML = '';
  //
  //    - Si prefieres solo ocultarla para que los radios sigan existiendo en el DOM 
  //      (a veces es necesario si tu plataforma los requiere):
  const oldList = shippingOptionsFieldset.querySelector('.form-checklist');
  if (oldList) {
    oldList.style.display = 'none';
  }

  // Agrega el SELECT al fieldset
  shippingOptionsFieldset.appendChild(selectElement);

  // 6. Listener para cuando el usuario cambie la opción en el SELECT
  selectElement.addEventListener("change", function () {
    const selectedValue = selectElement.value;

    radioInputs.forEach(radio => {
      radio.checked = radio.value === selectedValue
      // Despacha el evento 'change' para que la plataforma reaccione al cambio
      radio.dispatchEvent(new Event('change', { bubbles: true }));
    });
  });
}
