
// Search for products on Amazon via Rainforest API
export async function searchProducts(
  apiKey: string,
  searchQuery: string,
  categoryName: string
): Promise<any> {
  const apiUrl = 'https://api.rainforestapi.com/request'
  const searchParams = new URLSearchParams({
    api_key: apiKey,
    type: 'search',
    amazon_domain: 'amazon.com',
    search_term: `${searchQuery} ${categoryName}`,
  })

  console.log(`Search parameters: ${JSON.stringify(Object.fromEntries(searchParams))}`)
  
  // Make the initial search request to Rainforest API
  const searchResponse = await fetch(`${apiUrl}?${searchParams.toString()}`)
  
  if (!searchResponse.ok) {
    const errorText = await searchResponse.text()
    console.error('Rainforest API search error:', errorText)
    throw new Error(`Rainforest API search error: ${searchResponse.status} ${errorText}`)
  }
  
  const searchData = await searchResponse.json()
  console.log(`Search results count: ${searchData.search_results?.length || 0}`)
  
  return searchData
}
