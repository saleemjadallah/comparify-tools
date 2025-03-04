
// Fallback mock data for development/testing
export const mockFeatureData: Record<string, Record<string, { rating: number; description: string }>> = {
  "Performance": {
    "iPhone 14 Pro": { 
      rating: 9, 
      description: "Exceptional performance with the A16 Bionic chip. Handles all tasks with ease."
    },
    "Samsung Galaxy S23": { 
      rating: 8, 
      description: "Fast and responsive with the Snapdragon 8 Gen 2 processor."
    }
  },
  "Battery Life": {
    "iPhone 14 Pro": { 
      rating: 7, 
      description: "Decent battery life that will get most users through a full day of moderate use."
    },
    "Samsung Galaxy S23": { 
      rating: 8, 
      description: "Good battery life with improved efficiency. Easily lasts a full day."
    }
  },
  "Display Quality": {
    "iPhone 14 Pro": { 
      rating: 9, 
      description: "Stunning display with excellent brightness and color accuracy."
    },
    "Samsung Galaxy S23": { 
      rating: 9, 
      description: "Beautiful AMOLED display with vibrant colors and deep blacks."
    }
  },
  "Storage": {
    "iPhone 14 Pro": { 
      rating: 8, 
      description: "Comes with ample storage options but no expandable storage."
    },
    "Samsung Galaxy S23": { 
      rating: 9, 
      description: "Good internal storage options plus microSD card support for expansion."
    }
  },
  "Design": {
    "iPhone 14 Pro": { 
      rating: 8, 
      description: "Premium build quality with elegant design and excellent materials."
    },
    "Samsung Galaxy S23": { 
      rating: 8, 
      description: "Sleek design with premium materials and good ergonomics."
    }
  },
  "Warranty": {
    "iPhone 14 Pro": { 
      rating: 7, 
      description: "Standard 1-year warranty with optional AppleCare+ for extended coverage."
    },
    "Samsung Galaxy S23": { 
      rating: 7, 
      description: "Standard manufacturer warranty with optional Samsung Care+ available."
    }
  }
};
