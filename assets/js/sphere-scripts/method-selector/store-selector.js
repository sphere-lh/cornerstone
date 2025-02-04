function setStoreSelector(storeSelector, ok = false) {
  // const storeSelector = document.querySelector('.dynamic-form-field.dynamic-form-field--field_52');

  if (storeSelector) {
    const emptyOption = storeSelector.querySelector('option[value=""]')

    // Ocultar la opción con value="" en cualquier caso
    if (emptyOption) {
      emptyOption.style.display = 'none'
    }

    // Mostrar u ocultar el selector dependiendo del valor de "ok"
    storeSelector.style.display = ok ? 'block' : 'none'
  }
}

function moveStoreSelector() {
  const storeSelector = document.querySelector('.dynamic-form-field.dynamic-form-field--field_52')

  if (storeSelector) {
    console.log('Elemento detectado:', storeSelector)

    // Cambiar titulo
    const optionalText = storeSelector.querySelector('.optimizedCheckout-contentSecondary')

    if (optionalText) {
      optionalText.remove()
    }

    // Crear un nuevo <li> para insertar el selector
    const nuevoLi = document.createElement('li')
    nuevoLi.appendChild(storeSelector)

    // Insertar el nuevo <li> en la lista de opciones de envío
    const ulShippingOptions = document.querySelector('#checkout-shipping-options ul.form-checklist')
    if (ulShippingOptions) {
      ulShippingOptions.appendChild(nuevoLi)
      console.log('Elemento movido dentro de la lista de opciones de envío.')

      // Escuchar cambios en la selección de opciones de envío

      const sendByWeightOption = document.getElementById(
        'shippingOptionRadio-670d3bc252f6d-c97694551ad0f17976db915df5c7e19e',
      )
      const checkShippingOption = () => setStoreSelector(storeSelector, !sendByWeightOption?.checked)
      ulShippingOptions.addEventListener('change', checkShippingOption)
      checkShippingOption()
      return true
    } else {
      console.log('No se encontró la lista de opciones de envío.')
    }
  }
  return false
}

// Crear un observador para detectar cambios en el DOM y mover el selector
const observer = new MutationObserver(mutationsList => {
  for (const mutation of mutationsList) {
    if (mutation.type === 'childList') {
      if (moveStoreSelector()) {
        observer.disconnect() // Dejar de observar una vez encontrado el elemento
        break
      }
    }
  }
})

// Configuración del observador
const config = { childList: true, subtree: true }

// Iniciar la observación del cuerpo del documento
observer.observe(document.body, config)
