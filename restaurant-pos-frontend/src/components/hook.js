// src/hooks/hook.js
import { useState, useEffect } from 'react';
import axios from 'axios';

export const useProducts = () => {
  const [products, setProducts] = useState([]);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const token = localStorage.getItem('token');
        console.log('Fetching products from: http://localhost:3000/api/products');
        const { data } = await axios.get('http://localhost:3000/api/products', {
          headers: { Authorization: `Bearer ${token}` },
        });
        setProducts(data || []);
      } catch (error) {
        console.error('Error fetching products in hook:', error);
      }
    };

    fetchProducts();
  }, []);

  return products;
};