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
Este módulo es un obsevador permanente del DOM
y tiene como objetivo revisar si las shipping
options y el store selector están presentes. En
caso sea así, se modifican estos elementos.
********** */

const observer = new MutationObserver(mutations => {
  mutations.forEach(mutation => {
    // const storeSelector = document.querySelector('.dynamic-form-field.dynamic-form-field--field_52') // Comment to use closes() to get that element
    const storeSelectorChild = document.querySelector("#field_52Input");
    const storeSelector = storeSelectorChild.closest(".dynamic-form-field.dynamic-form-field--field_52");
    const shippingOptions = document.querySelector('#checkout-shipping-options')

    console.log('Hello')
    if (storeSelector && shippingOptions) {
      // Realizamos cambios en el DOM
      safeDOMUpdate(() => {
        updateTitle(storeSelector)
        moveStoreSelector(storeSelector, shippingOptions)
        hideStoreSelector(storeSelector, shippingOptions)
      })
    }
  })
})

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
