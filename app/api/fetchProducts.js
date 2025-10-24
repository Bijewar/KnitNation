// services/fetchProducts.js

export async function fetchMenProducts() {
    const response = await fetch('/api/men');
    if (!response.ok) {
      throw new Error('Failed to fetch men products');
    }
    const data = await response.json();
    return data;
  }
  
  export async function fetchWomenProducts() {
    const response = await fetch('/api/women');
    if (!response.ok) {
      throw new Error('Failed to fetch women products');
    }
    const data = await response.json();
    return data;
  }
  