
/**
 * Generates mock analysis data for testing without using Claude API credits
 */
export function generateMockData(products: any[], features: string[]): any {
  return {
    products: products.map((product: any) => ({
      name: product.name,
      overview: `This is a high-quality product that offers good value for money with distinctive features.`,
      pros: [
        `Great ${features[0]} performance`,
        `Excellent ${features[1]} capabilities`,
        `Good overall build quality`
      ],
      cons: [
        `Could improve on ${features[2] || 'some aspects'}`,
        `Price is slightly higher than competitors`
      ],
      featureRatings: Object.fromEntries(
        features.map(feature => [
          feature, 
          {
            rating: Math.floor(Math.random() * 3) + 7, // Random rating between 7-9
            explanation: `This product performs ${['well', 'admirably', 'excellently'][Math.floor(Math.random() * 3)]} on this feature.`
          }
        ])
      )
    })),
    personalizedRecommendations: products.map((product: any, index: number) => ({
      productId: product.id,
      recommendationType: [`Budget-conscious user`, `Professional user`, `High-end enthusiast`][index % 3],
      reasoning: `This product provides an exceptional combination of performance in ${features[0]} and affordability, making it perfect for users who need reliability without breaking the bank. The ${features[1]} capability is particularly impressive given the price point, and users will appreciate the intuitive interface that requires minimal setup time.`,
      standoutFeatures: [features[index % features.length], features[(index + 1) % features.length]],
      relevantTradeoffs: `Users choosing this product may sacrifice some advanced ${features[2] || 'features'} capabilities found in premium alternatives, but the core functionality remains excellent.`,
      recommendedAccessory: `A protective case would complement this product well, enhancing durability for daily use.`
    }))
  };
}
