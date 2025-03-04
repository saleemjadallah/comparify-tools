
// Fetch detailed product data from Rainforest API
export async function getProductDetails(apiKey: string, asin: string): Promise<any> {
  const apiUrl = 'https://api.rainforestapi.com/request'
  const productParams = new URLSearchParams({
    api_key: apiKey,
    type: 'product',
    amazon_domain: 'amazon.com',
    asin: asin,
    include_summarization_attributes: 'true',
    include_all_full_description: 'true',
    include_specifications: 'true',
    include_reviews: 'true',
    include_top_reviews: 'true',
    include_pricing_context: 'true',
    include_similar_products: 'true'
  })
  
  console.log(`Fetching details for ASIN ${asin} with params: ${JSON.stringify(Object.fromEntries(productParams))}`)
  
  const productResponse = await fetch(`${apiUrl}?${productParams.toString()}`)
  
  if (!productResponse.ok) {
    console.error(`Error fetching product details for ASIN ${asin}:`, await productResponse.text())
    return null
  }
  
  const productData = await productResponse.json()
  console.log(`Retrieved product data for ASIN ${asin}: ${productData.product?.title || 'Unknown'}`)
  console.log(`Features count: ${productData.product?.features?.length || 0}`)
  console.log(`Specifications groups count: ${productData.product?.specifications?.length || 0}`)
  console.log(`Reviews count: ${productData.product?.top_reviews?.length || 0}`)
  
  return productData
}
