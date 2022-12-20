/**
 ********************************************************************************
 * IMPORTS
 */


import 'bootstrap/dist/css/bootstrap.css'
import '../css/style.css'

import { fetchProducts } from "./api"
import { IData, IProduct } from "./interface"


/**
 ********************************************************************************
 * VARIABLES
 */

let products: IData
// let products: IProduct[] = []


/**
 ********************************************************************************
 * FUNCTIONS
 */



const getProducts = async () => {
    products = await fetchProducts()
    // console.log(products)
    renderProducts()
}

const renderProducts = () => {
    document.querySelector('.product-main')!.innerHTML = products.data
        .map( prod => `
            <div class="col-12 col-md-6 col-lg-3 product-cards">
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

const findClickedProduct = async (clickedId: number) => {

    const products = await fetchProducts()
    const foundProduct: IProduct = products.data.find(prod => clickedId === prod.id) as IProduct
    // console.log('foundProduct:', foundProduct)
    renderInfo(foundProduct)
    return foundProduct
}


/**
 ********************************************************************************
 * EVENT LISTENERS
 */

// Click event on each product
document.querySelector('main')?.addEventListener('click', e => {
    const target = e.target as HTMLElement

    let clickedId: number

    clickedId = Number(target.dataset.productId)
    console.log('clicked product id:', clickedId)

    if (target.className.includes('product-wrap' || 'product-wrap-child')) {

        if (target.tagName === 'BUTTON') {
            console.log('added to cart')

            findClickedProduct(clickedId)
        }
        else {
            console.log('viewing product')
            document.body.style.overflow = 'hidden';
            findClickedProduct(clickedId)
        }
    }
})


/**
 ********************************************************************************
 * START
 */
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
document.querySelector('.info-background')!.addEventListener('click', e => {
    const target = e.target as HTMLElement
    if (target.tagName === 'BUTTON') {
        console.log(Number(target.dataset.prodId))
        console.log('added to cart')
        document.querySelector('.info-background')!.classList.add('d-none')
        // findClickedProduct(clickedId)
    
    }
    else {
        document.querySelector('.info-background')!.classList.add('d-none')
        document.body.style.removeProperty('overflow');
    }
})

  // end info-section




getProducts()
