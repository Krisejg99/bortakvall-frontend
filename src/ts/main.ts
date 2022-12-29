import 'bootstrap/dist/css/bootstrap.css'
import '../css/style.css'
import '../css/media.css'
import { fetchProducts, createNewOrder } from "./api"
import { IData, IProduct, IOrder, ICustomerInfo } from "./interface"

/**
 ********************************************************************************************
 * FÖRKORNINGAR
 */

const dqs = (el: string) => document.querySelector(`${el}`)!
const hide = (element: string) => dqs(element).classList.add('d-none')
const display = (element: string) => dqs(element).classList.remove('d-none')

/**
 ********************************************************************************************
 */

const form = dqs('.customer-details') as HTMLFormElement
const customerFirstName = dqs('#customer-first-name') as HTMLInputElement
const customerLastName = dqs('#customer-last-name') as HTMLInputElement
const customerAddress = dqs('#customer-address') as HTMLInputElement
const customerPostal = dqs('#customer-postal-number') as HTMLInputElement
const customerCity = dqs('#customer-city') as HTMLInputElement
const customerPhone = dqs('#customer-phone') as HTMLInputElement
const customerEmail = dqs('#customer-email') as HTMLInputElement

let products: IData
// let products: IProduct[] = []

// localStorage starts
let jsonCartItems = localStorage.getItem('Shopping cart') ?? '[]'
let cartItems: IProduct[] = JSON.parse(jsonCartItems)

let jsonCartTotal = localStorage.getItem('Total price') ?? '0'
let cartTotal: number = JSON.parse(jsonCartTotal)

const saveCart = () => {
    dqs('#cart-item-count').textContent = String(cartItems
        .map( item => item.qty )
        .reduce( (num, sum) => num + sum, 0))
    localStorage.setItem('Shopping cart', JSON.stringify(cartItems))
    countTotalPrice()
}

const renderCart = () => {
    saveCart()
    renderCartItems()
    renderTotalPrice()
}
// localStorage ends

// Cart total price starts
const renderTotalPrice = () => {
    dqs('#cart-total').textContent = `${cartTotal}kr`
}

const countTotalPrice = () => {
    let cartPrices = [0]
    cartPrices = [0, ...cartItems.map(item => item.price * item.qty)]
    cartTotal = cartPrices.reduce((price, sum) => sum += price)
    localStorage.setItem('Total price', JSON.stringify(cartTotal))
}
// Cart total price ends

// Allt denna funktion ska göra är att hitta produkten man clickar på
const findClickedProduct = async (clickedId: number): Promise<IProduct> => {
    const products = await fetchProducts()
    const foundProduct: IProduct = products.data.find(prod => clickedId === prod.id) as IProduct
    return foundProduct
}

const renderCartItems = () => {
    dqs('#cart-list').innerHTML = cartItems
    .map(item => `
        <li class="cart-item">
            <img class="cart-image" src="https://www.bortakvall.se${item.images.thumbnail}" alt="${item.name}">
            <div class="card-body cart-descript">
                <p class="card-title text-dark">${item.name}</p>
                
                <p class="cart-adjust">
                    <span data-product-id="${item.id}" class="decrease">-</span>
                    <input class="prod-qty" data-input-id="${item.id}" id="input-${item.id}" value="${item.qty}" style="width: 30px; text-align: center">
                    <span data-product-id="${item.id}" class="increase">+</span>
                </p>
                <p class="card-text-cart text-dark" id="cart-item-price">${item.price} kr/st  </p>
                
                <p class="card-text-cart text-dark" id="item-price-${item.id}">${item.price * item.qty} kr</p>
            </div>
            <button class="cart-remove-item" data-product-id="${item.id}"><i class="bi bi-trash cart-remove-item-i" data-product-id="${item.id}"></i></button>
        </li>
    `)
    .join('')
}

// Input field on every cart item starts
dqs('#cart-list').addEventListener('keyup', e => {
    const target = e.target as HTMLElement
    const clickedId = Number(target.dataset.inputId)
    if (!clickedId) return
    const inCartItem = cartItems.find(item => item.id === clickedId) as IProduct
    const inputField = dqs(`#input-${clickedId}`) as HTMLInputElement
    inCartItem.qty = Number(inputField.value)
    saveCart()
    const itemTotal = dqs(`#item-price-${clickedId}`) as HTMLParagraphElement
    itemTotal.textContent = `${inCartItem.price * inCartItem.qty} kr`
    renderTotalPrice()
})

dqs('#cart-list').addEventListener('focusout', e => {
    const target = e.target as HTMLElement
    const clickedId = Number(target.dataset.inputId)
    if (!clickedId) return
    const inCartItem = cartItems.find(item => item.id === clickedId) as IProduct
    if (!(inCartItem.qty > 0)) {
        cartItems.splice(cartItems.indexOf(inCartItem), 1)
        renderCart()
    }
})
// Input field on every cart item ends

// Remove, + and - starts
dqs('#cart-list').addEventListener('click', async e => {
    const target = e.target as HTMLElement
    const clickedId = Number(target.dataset.productId)
    if (!clickedId) return
    const inCartItem = cartItems.find(item => item.id === clickedId) as IProduct  // Hitta produkten i cart som har samma ID som produkten jag klickade på

    if (target.className.includes('increase')) {
        increaseQty(inCartItem)
    }
    else if (target.className.includes('decrease')) {
        inCartItem.qty--
    }
    else if (target.className.includes('cart-remove-item' || 'cart-remove-item-i')) {
        inCartItem.qty = 0
    }

    if (!(inCartItem.qty > 0)) {
        cartItems.splice(cartItems.indexOf(inCartItem), 1) // removes it from cart-array
    }
    renderCart()
})
// Remove, + and - ends

const getProducts = async (): Promise<void> => {
    display('#spinner')
    try {
        products = await fetchProducts()
        renderProducts()  
    }
    catch {
        dqs('#output').innerHTML = `<h2 class="nav-item px-2">🚨 KUNDE INTE HÄMTA DATA FRÅN SERVER 🚨 <br> försök igen senare...</h2>`
        dqs('#main').innerHTML = `<h2 class="p-5">❌</h2>`
    }
    hide('#spinner')
}

const renderProducts = (): void => {
    console.log(products.data)
    const itemsInStock = products.data // räknar antal produkter instock och totalt antal produkter
    .map( prod => prod.stock_status)
    .filter(x => x === 'instock').length
    dqs('#output').innerHTML = `Vi har ${itemsInStock} st av ${products.data.length} st produkter i lager`
     
    products.data // sorteras efter produktnamn
    .sort((a, b) => a.name
    .localeCompare(b.name))

    dqs('.product-main').innerHTML = products.data
    .map( prod => `
        <div class="col- 12 col-sm-6 col-md-6 col-lg-3 product-cards">
            <div class="card product-wrap border-0">
                <img src="https://www.bortakvall.se${prod.images.thumbnail}" alt="${prod.name}" class="card-img-top card-img product-wrap-child" data-product-id="${prod.id}">
                <div class="card-body">
                    <p id="product-name" class="card-title product-wrap-child" data-product-id="${prod.id}">${prod.name}</p>
                    <p id="product-price" class="card-text text-dark">${prod.price} kr</p>
                    <p class="info-icon-wrap">
                        <i class="product-wrap-child bi bi-info-square" id="info-icon" data-product-id="${prod.id}"></i>
                    </p>
                    <button class="product-wrap-child product-btn ${(prod.stock_status === 'outofstock') ? 'product-btn-outofstock' : ''}" data-product-id="${prod.id}" ${(prod.stock_status === 'outofstock') ? 'disabled' : ''}>
                        ${(prod.stock_status === 'outofstock') ? 'SLUT I LAGER' : 'LÄGG TILL I VARUKORG'}
                    </button>
                    <p id="stock-qty">Antal i lager: ${(prod.stock_quantity === null) ? '0': prod.stock_quantity} </p>
                </div>
            </div>
        </div>
    `)
    .join('')

}

const noMoreCandy = (candy: IProduct) => {
    dqs('#no-more-candy').innerHTML = `<p>${candy.name}<br> är inte längre tillgängligt.</p>`
    display('#no-more-candy')
    setTimeout(() => {
        hide('#no-more-candy')
    }, 2000)
}

const addProduct = async (target: HTMLElement) => {
    const clickedId = Number(target.dataset.productId)
    const clickedProduct = await findClickedProduct(clickedId)
    const inCartIds = cartItems.map(item => item.id)       
    const inCartItem = cartItems.find(item => item.id === clickedId) as IProduct  // Hitta produkten i cart som har samma ID som produkten jag klickade på

    // Kolla om produkten redan finns i varukorgen
    if (!inCartItem || !inCartIds.includes(clickedId)) {
        clickedProduct.qty = 1
        cartItems.push(clickedProduct)
    }
    else if (inCartIds.includes(clickedId)) {
        increaseQty(inCartItem)
        
    }
}

const increaseQty = (prod: IProduct) => {
    if (!(prod.stock_quantity > prod.qty)) {
        noMoreCandy(prod)
        return
    }
    else {
        prod.qty++
    }
}

// Click event on each product
dqs('main').addEventListener('click', async e => {
    const target = e.target as HTMLElement
    const clickedId = Number(target.dataset.productId)
    const clickedProduct = await findClickedProduct(clickedId)
    
    // Skippa allt efter denna rad om man inte klicka på rätt ställe
    if (!target.className.includes('product-wrap-child')) return
    
    // 'Lägg till i varukorgen' knappen på en produkt
    if (target.tagName === 'BUTTON') {

        await addProduct(target)
        renderCart()

        dqs('#cart-wrap').classList.add('shake')
        setTimeout( () => {
            dqs('#cart-wrap').classList.remove('shake')                
        },950)
    }
    // Om man klickar någon annan stans på produkten. (info)
    else {
        renderInfo(clickedProduct)
        document.body.style.overflow = 'hidden';
    }
})

// View cart
dqs('#title-cart').addEventListener('click', () => {
    dqs('.cart-background').classList.add('show')
    document.body.style.overflow = 'hidden';
    
})

// Close cart
dqs('#cart-close').addEventListener('click', () => {
    dqs('.cart-background').classList.remove('show')
    document.body.style.removeProperty('overflow');

})

// Remove items from local storage(cart)
dqs('#clear-cart-btn').addEventListener('click', async () => {
    localStorage.removeItem('Shopping cart')
    jsonCartItems = localStorage.getItem('Shopping cart') ?? '[]'
    cartItems = JSON.parse(jsonCartItems)
    renderCart()
    setTimeout(() => {
    dqs('.cart-background').classList.remove('show')
    document.body.style.removeProperty('overflow');
    },500)
})

// Info-section start
const renderInfo = (productInfo: IProduct) => {
    display('.info-background')
    dqs('.info-background').classList.add('show-info')
    dqs('#info-section').innerHTML = `    
        <div class="info-section-l">
            <img src="https://www.bortakvall.se/${productInfo.images.large}" alt="${productInfo.name}" class="info-img">
            <p class="info-name" class="mt-3">
                ${productInfo.name}
                <span class="info-price">
                    ${productInfo.price}
                    <span>kr</span>
                </span>
            </p>
            <button class="product-btn m-2 p-2" data-product-id="${productInfo.id}" style="font-weight: bold;" ${(productInfo.stock_status === 'outofstock') ? 'disabled' : ''}>${(productInfo.stock_status === 'outofstock') ? 'SLUT I LAGER' : 'LÄGG TILL I VARUKORG'}</button>
        </div>
        <div class="info-section-r">
            <h3>Beskrivning</h3>
            ${productInfo.description}
            <p class="info-close">
                <i class="bi bi-x-lg close-info"></i>
            </p>
        </div>
    `
}

// Click event on info-section
dqs('.info-background').addEventListener('click', async e => {
    const target = e.target as HTMLElement

    if (target.tagName === 'BUTTON') {      
        await addProduct(target)
        renderCart()
        
        document.body.style.removeProperty('overflow');
        dqs('#cart-wrap').classList.add('shake')
        setTimeout( () => { 
            hide('.info-background')
            dqs('#cart-wrap').classList.remove('shake')
        },950)
    }
    else if (target.className.includes('close-info')) {
        hide('.info-background')
        document.body.style.removeProperty('overflow');
    }
})
// end info-section



// function that renders checkout-page and form to DOM
const checkout = () => {
    hide('.content-display')
    hide('#title-cart')
    hide('#main')
    hide('footer')
    display('#order-content')
    display('.customer-details')
    display('.back-button')
    dqs('.content-wrapper').classList.add('banner-checkout')
    dqs('.cart-background').classList.remove('show')

    cartItems.map(product => {
        document.body.style.removeProperty('overflow');

        let productTotal = (product.price * product.qty)

        dqs('#order-content').innerHTML += `
            <li class="list-group-item d-flex justify-content-between align-items-center text-center">
                <img src="https://www.bortakvall.se/${product.images.thumbnail}" alt="${product.name}" class="checkout-img">
                ${product.name}<br>x ${product.qty}<span>Á pris: <br>${product.price} kr</span><span>Total:<br> ${productTotal} kr</span>
            </li>
        `
    })

    dqs('#order-content').innerHTML += `

            <h3 class="text-center mt-3">Att betala: ${cartTotal} kr</h3>
        `
}

    // prefill form with customer data on page load
    const formAutoFill = () => {
    
        customerFirstName.value = customerData.customer_first_name ?? ''
        customerLastName.value = customerData.customer_last_name ?? ''
        customerAddress.value = customerData.customer_address ?? ''
        customerPostal.value = customerData.customer_postcode ?? ''
        customerCity.value = customerData.customer_city ?? ''
        customerPhone.value = customerData.customer_phone ?? ''
        customerEmail.value = customerData.customer_email ?? ''

    }

// function that renders form to DOM
const renderForm = () => {
    display('.customer-details')
    formAutoFill()            
}

// enable submit button when checkbox is checked
const checkbox = dqs('#customer-checkbox') as HTMLInputElement


checkbox.addEventListener('change', () => {
    dqs('.send-order').toggleAttribute('disabled' )
})

// get json data from localStorage
let jsonCustomerData = localStorage.getItem('Customer data') ?? '[]'

// parse json data into object
let customerData: ICustomerInfo = JSON.parse(jsonCustomerData)


const saveCustomerData = () => {

    customerData = {
    customer_first_name: customerFirstName.value,
    customer_last_name:  customerLastName.value,
    customer_address: customerAddress.value,
    customer_postcode: customerPostal.value,
    customer_city: customerCity.value,
    customer_phone: customerPhone.value,
    customer_email: customerEmail.value
}

// converts customerData to JSON
const json = JSON.stringify(customerData)

// saves JSON to localStorage
localStorage.setItem('Customer data', json)

console.log("customer data:", customerData)
}

// Add clickEvent to proceed to check out with all products from cart

dqs('#checkout-btn').addEventListener('click', e => {
    const target = e.target as HTMLButtonElement
    if (target.id === 'checkout-btn') {
        console.log('clicked on checkout')
        checkout()
        renderForm()
    }
})





// listen for submits, and save customer data to localStorage
form.addEventListener('submit', async e => {
    e.preventDefault()
    saveCustomerData()

    const orderedItems = cartItems.map(item => ({product_id: item.id, qty: item.qty, item_price: item.price, item_total:item.price*item.qty}))

    // object containing order content
    const newOrder: IOrder =   {
            customer_first_name: customerFirstName.value,
            customer_last_name: customerLastName.value,
            customer_address: customerAddress.value,
            customer_postcode: customerPostal.value,
            customer_city: customerCity.value,
            customer_email: customerEmail.value,
            customer_phone: customerPhone.value,
            order_total: cartTotal,
            order_items: orderedItems

        }
    

        // posting new order to server
        await createNewOrder(newOrder)
        // console.log('test-order', newOrder)

        // console.log('cartItems:', cartItems)

    

})




// remove saved customer data when reset button is clicked
dqs('.customer-details').addEventListener('reset', () => {
    localStorage.removeItem('Customer data')
    checkbox.checked = false
    dqs('.send-order').setAttribute('disabled', 'disabled')
})

// go back to product page once back button is clicked
dqs('.back-button').addEventListener('click', () => {
    display('.content-display')
    display('#title-cart')
    display('#main')
    display('footer')
    hide('#order-content')
    hide('.customer-details')
    hide('.back-button')
    dqs('.content-wrapper').classList.remove('banner-checkout')

    // empty HTML before checkout() runs again
    dqs('#order-content').innerHTML = ''
})




/* functions that are called when the page loads */
getProducts()
    
renderCart()
