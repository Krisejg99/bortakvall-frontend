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
  products = await fetchProducts()
  console.log(products)
  renderProducts()
  
}

const renderProducts = () => {
    document.querySelector('.product-main')!.innerHTML = products.data
        .map( prod => `
            <div class="product-cards row col-3 my-5 bg-white>
                <div class="product-wrap"  data-product-id="${prod.id}">
                    <img src="https://www.bortakvall.se${prod.images.thumbnail}" alt="${prod.name}" class="card-img-top card-img product-wrap-child" data-product-id="${prod.id}">
                    
                    <div class="card-body product-wrap-child" data-product-id="${prod.id}">
                        <p id="product-name" class="card-title text-dark product-wrap-child" data-product-id="${prod.id}">${prod.name}</p>

                        <p id="product-price" class="card-text text-dark product-wrap-child" data-product-id="${prod.id}">${prod.price} kr</p>
                        
                        <button class="btn btn-warning py-2 product-wrap-child" data-product-id="${prod.id}">Lägg till i<br> varukorg</button>
                    </div>
                </div>
            </div>
        `)
        .join('')
}

const findClickedProduct = async (clickedId: number) => {

    const products = await fetchProducts()
    const foundProduct: IProduct = products.data.find(prod => clickedId === prod.id) as IProduct
    console.log('foundProduct:', foundProduct)
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
    console.log(productInfo)
    document.querySelector('#info-section')!.innerHTML = `    
    <div class="info-section-l">
        <img src="https://www.bortakvall.se/${productInfo.images.large}" alt="${productInfo.name}" class="mt-3 info-img">
        <p class="info-name" class="mt-3">${productInfo.name}<span class="info-price">${productInfo.price}<span>kr</span></span></p>
        <button class="btn btn-warning m-2 p-2" value="${productInfo.id}">Lägg till i varukorg</button>
    </div>
      <div class="mt-3 info-section-r"><h3 class="p-4">Beskrivning</h3>${productInfo.description}
    </div>
    `
  }

  
  // end info-section




getProducts()
