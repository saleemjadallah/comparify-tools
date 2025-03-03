
// Product categories
export const productCategories = [
  "Smartphones",
  "Laptops",
  "Headphones",
  "TVs",
  "Cameras",
  "Smartwatches",
  "Gaming Consoles",
  "Smart Home Devices",
  "Tablets",
];

// Mock product database for search functionality
export const mockProductDatabase: Record<string, Array<{id: string; name: string; brand: string; price: number}>> = {
  "Smartphones": [
    { id: "s1", name: "iPhone 14 Pro", brand: "Apple", price: 999 },
    { id: "s2", name: "Samsung Galaxy S23", brand: "Samsung", price: 799 },
    { id: "s3", name: "Google Pixel 7", brand: "Google", price: 599 },
    { id: "s4", name: "OnePlus 11", brand: "OnePlus", price: 699 },
  ],
  "Laptops": [
    { id: "l1", name: "MacBook Pro 14\"", brand: "Apple", price: 1999 },
    { id: "l2", name: "Dell XPS 13", brand: "Dell", price: 1299 },
    { id: "l3", name: "Lenovo ThinkPad X1", brand: "Lenovo", price: 1499 },
    { id: "l4", name: "HP Spectre x360", brand: "HP", price: 1399 },
  ],
  "Headphones": [
    { id: "h1", name: "AirPods Pro", brand: "Apple", price: 249 },
    { id: "h2", name: "Sony WH-1000XM5", brand: "Sony", price: 399 },
    { id: "h3", name: "Bose QuietComfort", brand: "Bose", price: 329 },
    { id: "h4", name: "Sennheiser Momentum 4", brand: "Sennheiser", price: 349 },
  ],
};
