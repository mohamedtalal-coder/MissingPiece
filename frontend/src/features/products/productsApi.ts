import { apiClient } from '../../api/client';

export interface Product {
  id: string | number;
  title: string;
  description: string;
  price: number;
  stock: number;
  category: string;
  imageUrl: string;
}

const luxuryProducts: Product[] = [
  // --- 1. Jigsaw Puzzles ---
  {
    id: 'j1',
    title: 'Sunset Meadow Jigsaw',
    description: 'A breathtaking 1000-piece sunset landscape puzzle.',
    price: 350,
    stock: 12,
    category: 'Jigsaw Puzzles',
    imageUrl: 'https://images.unsplash.com/photo-1606144042614-b2417e99c4e3?w=500&auto=format&fit=crop&q=60'
  },
  {
    id: 'j2',
    title: 'Starry Night Galaxy',
    description: 'Immersive cosmic starry night glowing jigsaw puzzle.',
    price: 400,
    stock: 10,
    category: 'Jigsaw Puzzles',
    imageUrl: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=500&auto=format&fit=crop&q=60'
  },
  {
    id: 'j3',
    title: 'Alpine Snowy Village',
    description: 'Cozy winter wonderland 1000-piece challenge.',
    price: 300,
    stock: 15,
    category: 'Jigsaw Puzzles',
    imageUrl: 'https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?w=500&auto=format&fit=crop&q=60'
  },
  {
    id: 'j4',
    title: 'Tropical Beach Paradise',
    description: 'Vibrant turquoise waters and palm trees puzzle.',
    price: 380,
    stock: 8,
    category: 'Jigsaw Puzzles',
    imageUrl: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=500&auto=format&fit=crop&q=60'
  },
  {
    id: 'j5',
    title: 'Autumn Forest Trail',
    description: 'Golden leaves and serene woodland walking path.',
    price: 320,
    stock: 20,
    category: 'Jigsaw Puzzles',
    imageUrl: 'https://images.unsplash.com/photo-1473448912268-2022ce9509d8?w=500&auto=format&fit=crop&q=60'
  },

  // --- 2. 3D Puzzles ---
  {
    id: 'd1',
    title: 'Galaxy 3D Sphere',
    description: 'An illuminated rotating celestial globe 3D puzzle.',
    price: 500,
    stock: 7,
    category: '3D Puzzles',
    imageUrl: 'https://images.unsplash.com/photo-1614728894747-a83421e2b9c9?w=500&auto=format&fit=crop&q=60'
  },
  {
    id: 'd2',
    title: 'Eiffel Tower Architecture',
    description: 'Stunning metal and crystal 3D structural model.',
    price: 650,
    stock: 5,
    category: '3D Puzzles',
    imageUrl: 'https://images.unsplash.com/photo-1511739001486-6bfe10ce785f?w=500&auto=format&fit=crop&q=60'
  },
  {
    id: 'd3',
    title: 'Medieval Castle Fortress',
    description: 'Intricate castle defense walls and towers 3D build.',
    price: 550,
    stock: 9,
    category: '3D Puzzles',
    imageUrl: 'https://images.unsplash.com/photo-1599839575945-a9e5af0c3fa5?w=500&auto=format&fit=crop&q=60'
  },
  {
    id: 'd4',
    title: 'Ancient Steam Locomotive',
    description: 'Classic vintage steam train 3D mechanical puzzle.',
    price: 480,
    stock: 11,
    category: '3D Puzzles',
    imageUrl: 'https://images.unsplash.com/photo-1515165562839-978bbcfc9926?w=500&auto=format&fit=crop&q=60'
  },
  {
    id: 'd5',
    title: 'Crystal Pirate Ship',
    description: 'Translucent crystal blocks forming a majestic galleon.',
    price: 520,
    stock: 6,
    category: '3D Puzzles',
    imageUrl: 'https://images.unsplash.com/photo-1534447677768-be436bb09401?w=500&auto=format&fit=crop&q=60'
  },

  // --- 3. Wooden Puzzles ---
  {
    id: 'w1',
    title: 'Wooden Brain Teaser',
    description: 'Interlocking traditional wooden puzzle blocks.',
    price: 250,
    stock: 14,
    category: 'Wooden Puzzles',
    imageUrl: 'https://images.unsplash.com/photo-1587654780291-39c9404d746b?w=500&auto=format&fit=crop&q=60'
  },
  {
    id: 'w2',
    title: 'Soma Cube Master Set',
    description: 'Complex geometric wooden intelligence challenge.',
    price: 280,
    stock: 12,
    category: 'Wooden Puzzles',
    imageUrl: 'https://images.unsplash.com/photo-1563089145-599997674d42?w=500&auto=format&fit=crop&q=60'
  },
  {
    id: 'w3',
    title: 'Wooden Lock Box Puzzle',
    description: 'Secret compartment mechanical puzzle box.',
    price: 350,
    stock: 8,
    category: 'Wooden Puzzles',
    imageUrl: 'https://images.unsplash.com/photo-1509198397868-475647b2a1e5?w=500&auto=format&fit=crop&q=60'
  },
  {
    id: 'w4',
    title: 'Animal Kingdom Tangram',
    description: 'Artistic wooden puzzle shapes to form wildlife figures.',
    price: 220,
    stock: 18,
    category: 'Wooden Puzzles',
    imageUrl: 'https://images.unsplash.com/photo-1596461404969-9ae70f2830c1?w=500&auto=format&fit=crop&q=60'
  },
  {
    id: 'w5',
    title: 'Burr Knot Interlock',
    description: 'Precision-cut wooden sticks forming a solid interlocking knot.',
    price: 300,
    stock: 10,
    category: 'Wooden Puzzles',
    imageUrl: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=500&auto=format&fit=crop&q=60'
  },

  // --- 4. Mystery Puzzles ---
  {
    id: 'm1',
    title: 'The Detective Mystery',
    description: 'Solve the clues as you assemble the crime scene.',
    price: 450,
    stock: 9,
    category: 'Mystery Puzzles',
    imageUrl: 'https://images.unsplash.com/photo-1532012197267-da84d127e765?w=500&auto=format&fit=crop&q=60'
  },
  {
    id: 'm2',
    title: 'CSI Crime Scene Puzzle',
    description: 'Forensic evidence puzzle with hidden clues inside.',
    price: 420,
    stock: 11,
    category: 'Mystery Puzzles',
    imageUrl: 'https://images.unsplash.com/photo-1453733190371-0a3bedd82f93?w=500&auto=format&fit=crop&q=60'
  },
  {
    id: 'm3',
    title: 'Secret Agent Cipher',
    description: 'Decode secret messages embedded within the puzzle artwork.',
    price: 400,
    stock: 13,
    category: 'Mystery Puzzles',
    imageUrl: 'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=500&auto=format&fit=crop&q=60'
  },
  {
    id: 'm4',
    title: 'Haunted Manor Escape',
    description: 'Escape room style mystery puzzle adventure.',
    price: 460,
    stock: 7,
    category: 'Mystery Puzzles',
    imageUrl: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=500&auto=format&fit=crop&q=60'
  },
  {
    id: 'm5',
    title: 'The Alchemist Secret',
    description: 'Unravel ancient formulas and potions through the puzzle pieces.',
    price: 490,
    stock: 6,
    category: 'Mystery Puzzles',
    imageUrl: 'https://images.unsplash.com/photo-1509198397868-475647b2a1e5?w=500&auto=format&fit=crop&q=60'
  }
];

export const productsApi = {
  getAll: async (category: string = 'All'): Promise<Product[]> => {
    try {
      const response = await apiClient.get('/products', { params: { category } });
      return response.data?.length ? response.data : (category === 'All' ? luxuryProducts : luxuryProducts.filter(p => p.category === category));
    } catch (err) {
      return category === 'All' ? luxuryProducts : luxuryProducts.filter(p => p.category === category);
    }
  },
  getById: async (id: string): Promise<Product> => {
    try {
      const response = await apiClient.get(`/products/${id}`);
      return response.data;
    } catch (err) {
      return luxuryProducts.find(p => String(p.id) === id) || luxuryProducts[0];
    }
  },
  create: async (productData: Omit<Product, 'id'>): Promise<Product> => {
    const response = await apiClient.post('/products', productData);
    return response.data;
  },
  delete: async (id: string | number): Promise<void> => {
    try {
      await apiClient.delete(`/products/${id}`);
    } catch (err) {
      console.log('Deleted locally (mock mode)');
    }
  },
};