/**
 ********************************************************************************
 * IMPORTS
 */


import 'bootstrap/dist/css/bootstrap.css'
import '../css/style.css'
import '../css/media.css'

import { fetchProducts, fetchOrder } from "./api"
import { IData, IProduct, IOrder, ICustomerInfo } from "./interface"


/**
 ********************************************************************************
 * VARIABLES
 */

let products: IData
// let products: IProduct[] = []


// localStorage starts
let jsonCartItems = localStorage.getItem('Shopping cart') ?? '[]'
let cartItems: IProduct[] = JSON.parse(jsonCartItems)

const saveCart = () => {
    document.querySelector('#cart-item-count')!.textContent = String(cartItems.length)
    localStorage.setItem('Shopping cart', JSON.stringify(cartItems))
    localStorage.setItem('Cart total', JSON.stringify(cartTotal))
}
// localStorage ends

console.log("cart items:", cartItems)


const testOrder = await fetchOrder(
    {
        customer_first_name: 'Sean',
        customer_last_name: 'Banan',
        customer_address: 'Drottningatan 4b',
        customer_postcode: '21211',
        customer_city: 'Malmö',
        customer_email: 'testhejsan@gmail.com',
        customer_phone: '0723738495',
        order_total: 48,
        order_items: [
            {
                product_id: 6545,
                qty: 3,
                item_price: 8,
                item_total: 24,
            },
            {
                product_id: 6545,
                qty: 3,
                item_price: 8,
                item_total: 24,
            },
        ],
    }
)
// console.log(testOrder)

// Cart total price starts
const renderTotalPrice = () => {
    document.querySelector('#cart-total')!.textContent = `${cartTotal}kr`
}

let cartTotal = 0

const countTotalPrice = () => {
    let cartPrices = [0]
    cartPrices = [0, ...cartItems.map(item => item.price)]
    cartTotal = cartPrices.reduce((price, sum) => sum += price)
}
saveCart() // called to view number of item in cart when page loads
renderTotalPrice()
// Cart total price ends

/**
 ********************************************************************************
 * FUNCTIONS
 */


const renderCartItems = () => {
    document.querySelector('#cart-list')!.innerHTML = cartItems
    .map(item => `
        <li class="cart-item">
            <img class="cart-image" src="https://www.bortakvall.se${item.images.thumbnail}" alt="${item.name}">
            <div class="card-body" data-product-id="${item.id}">
                <p class="card-title text-dark" data-product-id="${item.id}">${item.name}</p>
                <p class="card-text text-dark" data-product-id="${item.id}">${item.price} kr</p>
            </div>
            <button class="btn btn-danger cart-remove-item"><i class="bi bi-trash"></i></button>
        </li>
    `)
    .join('')

}
const getProducts = async (): Promise<void> => {
    products = await fetchProducts()
    // console.log(products)
    renderProducts()  
}

const renderProducts = (): void => {
    document.querySelector('.product-main')!.innerHTML = products.data
        .map( prod => `
            <div class="col- 12 col-sm-6 col-md-6 col-lg-3 product-cards">
                <div class="card product-wrap border-0"  data-product-id="${prod.id}">
                    <img src="https://www.bortakvall.se${prod.images.thumbnail}" alt="${prod.name}" class="card-img-top card-img product-wrap-child" data-product-id="${prod.id}">
                    <div class="card-body product-wrap-child" data-product-id="${prod.id}">
                        <p id="product-name" class="card-title text-dark product-wrap-child" data-product-id="${prod.id}">${prod.name}</p>
                        <p id="product-price" class="card-text text-dark product-wrap-child" data-product-id="${prod.id}">${prod.price} kr</p>
                        <button class="btn btn-warning btn-span mb-0 py-1 product-wrap-child product-btn" data-product-id="${prod.id}">LÄGG I VARUKORG</button>
                    </div>
                </div>
            </div>
        `)
        .join('')
}

// Allt denna funktion ska göra är att hitta produkten man clickar på
const findClickedProduct = async (clickedId: number): Promise<IProduct> => {

    const products = await fetchProducts()
    const foundProduct: IProduct = products.data.find(prod => clickedId === prod.id) as IProduct
    // console.log('foundProduct:', foundProduct)
    return foundProduct
}


/**
 ********************************************************************************
 * EVENT LISTENERS
 */


// Click event on each product
document.querySelector('main')?.addEventListener('click', async e => {
    const target = e.target as HTMLElement
    const clickedId = Number(target.dataset.productId)
    // console.log('clicked product id:', clickedId)
    const clickedProduct = await findClickedProduct(clickedId)

    if (target.className.includes('product-wrap' || 'product-wrap-child')) {

        // Om man klickar på 'Lägg till i varukorgen' knappen på en produkt
        if (target.tagName === 'BUTTON') {
            console.log('added to cart')

            // Push item into cartItems
            cartItems.push(clickedProduct)
            // Save cartItems in localStorage
            saveCart()
            // Display items from cartItems
            renderCartItems()
            // Counts the total price of every item in the cart
            countTotalPrice()
            // Display the total price of all items
            renderTotalPrice()
            document.querySelector('#cart-wrap')!.classList.add('shake')
            setTimeout( () => {
                document.querySelector('#cart-wrap')!.classList.remove('shake')                
            },950)
            console.log(cartTotal)

        }
        // Om man klickar någon annan stans på produkten. (info)
        else {
            console.log('viewing product')

            renderInfo(clickedProduct)
            document.body.style.overflow = 'hidden';
            findClickedProduct(clickedId)
        }
    }
})
// View cart
document.querySelector('#title-cart')!.addEventListener('click', () => {
    document.querySelector('.cart-background')!.classList.remove('d-none')
    document.body.style.overflow = 'hidden';
    
})
// close cart
document.querySelector('#cart-close')!.addEventListener('click', () => {
    document.querySelector('.cart-background')!.classList.add('d-none')
    document.body.style.removeProperty('overflow');

})


// Remove items from local storage(cart)
document.querySelector('#clear-cart-btn')?.addEventListener('click', async () => {
    localStorage.removeItem('Shopping cart')
    jsonCartItems = localStorage.getItem('Shopping cart') ?? '[]'
    cartItems = JSON.parse(jsonCartItems)
    renderCartItems()
    // Counts the total price of every item in the cart
    countTotalPrice()
    // Display the total price of all items
    renderTotalPrice()
    saveCart()
    setTimeout(() => {
    document.querySelector('.cart-background')!.classList.add('d-none')
    document.body.style.removeProperty('overflow');
    },950)
})


/**
 ********************************************************************************
 * START
 */


getProducts()
renderCartItems()


// start info-section
const renderInfo = (productInfo: IProduct) => {
    document.querySelector('.info-background')!.classList.remove('d-none')
    document.querySelector('.info-background')!.classList.add('show-info')
    document.querySelector('#info-section')!.innerHTML = `    
    <div class="info-section-l">
        <img src="https://www.bortakvall.se/${productInfo.images.large}" alt="${productInfo.name}" class="info-img">
        <p class="info-name" class="mt-3">${productInfo.name}<span class="info-price">${productInfo.price}<span>kr</span></span></p>
        <button class="btn btn-warning m-2 p-2" data-prod-id="${productInfo.id}">Lägg till i varukorg</button>
    </div>
      <div class="info-section-r"><h3>Beskrivning</h3>${productInfo.description}
      <p class="info-close"><i class="bi bi-x-lg"></i></p>
    </div>
    `
}

document.querySelector('.info-background')!.addEventListener('click', async e => {
    const target = e.target as HTMLElement
    if (target.tagName === 'BUTTON') {
        const clickedId = Number(target.dataset.prodId)
        const clickedProduct = await findClickedProduct(clickedId)
        
        // Push item into cartItems
        cartItems.push(clickedProduct)
        // Save cartItems in localStorage
        saveCart()
        // Display items from cartItems
        renderCartItems()
        // Counts the total price of every item in the cart
        countTotalPrice()
        // Display the total price of all items
        renderTotalPrice()
        console.log(cartTotal)
        
        document.body.style.removeProperty('overflow');
        document.querySelector('#cart-wrap')!.classList.add('shake')
        setTimeout( () => { 
            document.querySelector('.info-background')!.classList.add('d-none')
            document.querySelector('#cart-wrap')!.classList.remove('shake')                
        },950)
    }
    else {
        document.querySelector('.info-background')!.classList.add('d-none')
        document.body.style.removeProperty('overflow');
    }
})
// end info-section


// Add function that renders checkout-page and form to DOM

const checkout = () => {
    cartItems.forEach(product => {
        console.log('cart-item:', product)

        document.querySelector('.content-container')!.classList.add('d-none')
        document.querySelector('#title-cart')!.classList.add('d-none')
        document.querySelector('.cart-wrapper')!.classList.add('d-none')
        document.querySelector('.cart-background')!.classList.add('d-none')
        document.querySelector('#order-content')!.classList.remove('d-none')
        document.querySelector('.customer-details')!.classList.remove('d-none')

        document.body.style.removeProperty('overflow');

        document.querySelector('#order-content')!.innerHTML += `

            <li class="list-group-item d-flex justify-content-between align-items-center text-center">
                <img src="https://www.bortakvall.se/${product.images.thumbnail}" alt="${product.name}" class="checkout-img">
                ${product.name}<br>x 1<span>Styckpris: <br>${product.price} kr</span><span>Total:<br>10 kr</span>
            </li>
        `
    })

    document.querySelector('#order-content')!.innerHTML += `

            <h3 class="text-center mt-3">Att betala: ${cartTotal} kr</h3>
        `

    document.querySelector('.customer-details')!.innerHTML = `
        <h2 class="form-heading text-center mt-5">Beställare</h2>
            <div class="form-row">
                <div class="form-group">
                    <label for="customer-first-name"></label>
                    <input type="text" placeholder="Förnamn" id="customer-first-name" required class="form-control">
                </div>
                <div class="form-group">
                    <label for="customer-last-name"></label>
                    <input type="text" placeholder="Efternamn" id="customer-last-name" required class="form-control">
                </div>

                

                <button type="submit" class="send-order btn btn-primary my-3 py-2" id="send-order">Skicka beställning</button>
            </div> 
    `
    // will be added after testing of form is done
    // <div class="form-group">
    //                 <label for="customer-address"></label>
    //                 <input type="text" placeholder="Adress" id="customer-address" required class="form-control">
    //             </div>


    //             <div class="form-group">
    //                 <label for="customer-postal-number"></label>
    //                 <input type="text" placeholder="Postnummer" id="customer-postal-number" required class="form-control">
    //             </div>

    //             <div class="form-group">
    //                 <label for="customer-city"></label>
    //                 <input type="text" placeholder="Ort" id="customer-city" required class="form-control">
    //             </div>

    //             <div class="form-group">
    //                 <label for="customer-phone"></label>
    //                 <input type="text" placeholder="Telefon" id="customer-phone" class="form-control">
    //             </div>

    //             <div class="form-group">
    //                 <label for="customer-email"></label>
    //                 <input type="email" placeholder="Email" id="customer-email" required class="form-control mb-3">
    //             </div>


    //             <div class="form-group">
    //                 <input type="checkbox" value="" id="customer-checkbox" class="form-check-input">
    //                 <label for="customer-checkbox" class="form-check-label">Jag har kontrollerat att informationen jag angett stämmer</label>
    //             </div>  

    // add eventListener to submit form and send order
document.querySelector('#send-order')!.addEventListener('submit', e => {
    console.log('now work')
})


}


// Add clickEvent to proceed to check out with all products from cart

    document.querySelector('#checkout-btn')!.addEventListener('click', async e => {
        const target = e.target as HTMLButtonElement
        if (target.id === 'checkout-btn') {
            console.log('clicked on checkout')
            checkout()
        }
    })

// stores form inputs in local storage
let jsonCustomerInfo = localStorage.getItem('Customer data') ?? '[]'
let customerInfo: ICustomerInfo = JSON.parse(jsonCustomerInfo)

const saveCustomerData = () => {

    // converts array of customer data to json
    const json = JSON.stringify(customerInfo)

    // save json to localStorage
    localStorage.setItem('Customer info', json)

}


