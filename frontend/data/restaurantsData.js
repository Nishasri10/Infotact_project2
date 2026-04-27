// Complete Restaurant Data with Multiple Food Varieties
const restaurantsData = [
    {
        id: 1,
        name: "Biryani House",
        cuisine: ["Indian", "Mughlai", "Hyderabadi"],
        rating: 4.7,
        totalReviews: 342,
        distance: 1.2,
        deliveryTime: "25-35 min",
        priceForTwo: 600,
        isOpen: true,
        image: "https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?w=500",
        coverImage: "https://images.unsplash.com/photo-1585937421612-70a008356fbe?w=1200",
        address: "Connaught Place, New Delhi",
        phone: "+91 98765 43210",
        email: "contact@biryanihouse.com",
        description: "Authentic Hyderabadi biryani since 1985. Known for our secret spice blend and slow-cooked meats.",
        openingHours: "11:00 AM - 11:00 PM",
        menu: [
            { id: 101, name: "Chicken Biryani", description: "Authentic Hyderabadi chicken biryani with aromatic spices", price: 250, category: "Main Course", isVeg: false, popular: true },
            { id: 102, name: "Mutton Biryani", description: "Slow-cooked mutton biryani", price: 350, category: "Main Course", isVeg: false, popular: true },
            { id: 103, name: "Veg Biryani", description: "Fresh vegetables with basmati rice", price: 180, category: "Main Course", isVeg: true },
            { id: 104, name: "Chicken 65", description: "Spicy deep-fried chicken", price: 220, category: "Starters", isVeg: false, popular: true },
            { id: 105, name: "Paneer Tikka", description: "Grilled cottage cheese with spices", price: 200, category: "Starters", isVeg: true },
            { id: 106, name: "Haleem", description: "Slow-cooked meat and lentil stew", price: 280, category: "Main Course", isVeg: false },
            { id: 107, name: "Raita", description: "Fresh yogurt with cucumber and mint", price: 40, category: "Sides", isVeg: true },
            { id: 108, name: "Gulab Jamun", description: "Soft milk dumplings in sugar syrup", price: 60, category: "Dessert", isVeg: true },
            { id: 109, name: "Double Ka Meetha", description: "Bread pudding with dry fruits", price: 80, category: "Dessert", isVeg: true }
        ],
        tables: [
            { id: "T1", number: "Table 1", capacity: 2, isAvailable: true },
            { id: "T2", number: "Table 2", capacity: 4, isAvailable: true },
            { id: "T3", number: "Table 3", capacity: 4, isAvailable: true },
            { id: "T4", number: "Table 4", capacity: 6, isAvailable: false },
            { id: "T5", number: "Table 5", capacity: 8, isAvailable: true }
        ],
        reviews: [
            { id: 1, userName: "Rajesh K.", rating: 5, title: "Best biryani in town!", comment: "Absolutely amazing food. The chicken biryani is a must try!", date: "2024-01-15" },
            { id: 2, userName: "Priya S.", rating: 4, title: "Great taste", comment: "Loved the mutton biryani. Service was quick.", date: "2024-01-10" }
        ]
    },
    {
        id: 2,
        name: "Pizza Paradise",
        cuisine: ["Italian", "American", "Pizza"],
        rating: 4.5,
        totalReviews: 289,
        distance: 2.1,
        deliveryTime: "30-40 min",
        priceForTwo: 800,
        isOpen: true,
        image: "https://images.unsplash.com/photo-1513104890138-7c749659a591?w=500",
        coverImage: "https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=1200",
        address: "Saket, New Delhi",
        phone: "+91 98765 43211",
        email: "info@pizzaparadise.com",
        description: "Wood-fired pizzas made with fresh ingredients. Best pizza in town!",
        openingHours: "12:00 PM - 11:00 PM",
        menu: [
            { id: 201, name: "Margherita Pizza", description: "Classic cheese and basil", price: 350, category: "Pizza", isVeg: true, popular: true },
            { id: 202, name: "Pepperoni Pizza", description: "Spicy pepperoni with mozzarella", price: 450, category: "Pizza", isVeg: false, popular: true },
            { id: 203, name: "BBQ Chicken Pizza", description: "Grilled chicken with BBQ sauce", price: 499, category: "Pizza", isVeg: false, popular: true },
            { id: 204, name: "Garlic Bread", description: "Crispy garlic bread with herbs", price: 120, category: "Sides", isVeg: true },
            { id: 205, name: "Pasta Alfredo", description: "Creamy alfredo sauce with parmesan", price: 280, category: "Pasta", isVeg: true },
            { id: 206, name: "Tiramisu", description: "Classic Italian dessert", price: 180, category: "Dessert", isVeg: true },
            { id: 207, name: "Cheese Burst Pizza", description: "Extra cheese with crust filled with cheese", price: 550, category: "Pizza", isVeg: true }
        ],
        tables: [
            { id: "P1", number: "Table 1", capacity: 2, isAvailable: true },
            { id: "P2", number: "Table 2", capacity: 4, isAvailable: true },
            { id: "P3", number: "Table 3", capacity: 6, isAvailable: true }
        ],
        reviews: []
    },
    {
        id: 3,
        name: "Sushi Master",
        cuisine: ["Japanese", "Asian", "Sushi"],
        rating: 4.9,
        totalReviews: 156,
        distance: 0.8,
        deliveryTime: "20-30 min",
        priceForTwo: 1200,
        isOpen: true,
        image: "https://images.unsplash.com/photo-1579871494447-9811cf80d66c?w=500",
        coverImage: "https://images.unsplash.com/photo-1553621042-f6e147245754?w=1200",
        address: "Hauz Khas, New Delhi",
        phone: "+91 98765 43212",
        email: "hello@sushimaster.com",
        description: "Authentic Japanese sushi made by expert chefs. Fresh fish flown daily.",
        openingHours: "12:00 PM - 10:30 PM",
        menu: [
            { id: 301, name: "California Roll", description: "Crab, avocado, cucumber", price: 450, category: "Sushi", isVeg: false, popular: true },
            { id: 302, name: "Rainbow Roll", description: "Assorted fish", price: 550, category: "Sushi", isVeg: false, popular: true },
            { id: 303, name: "Dragon Roll", description: "Eel and cucumber with avocado", price: 650, category: "Sushi", isVeg: false, popular: true },
            { id: 304, name: "Miso Soup", description: "Traditional Japanese soup", price: 90, category: "Soup", isVeg: true },
            { id: 305, name: "Tempura", description: "Deep-fried vegetables and shrimp", price: 320, category: "Appetizer", isVeg: false },
            { id: 306, name: "Sashimi Platter", description: "Fresh raw fish slices", price: 750, category: "Sushi", isVeg: false }
        ],
        tables: [
            { id: "S1", number: "Table 1", capacity: 2, isAvailable: true },
            { id: "S2", number: "Table 2", capacity: 4, isAvailable: true },
            { id: "S3", number: "Table 3", capacity: 4, isAvailable: false }
        ],
        reviews: []
    },
    {
        id: 4,
        name: "Spice Garden",
        cuisine: ["Indian", "South Indian", "Tamil"],
        rating: 4.6,
        totalReviews: 428,
        distance: 1.5,
        deliveryTime: "25-35 min",
        priceForTwo: 500,
        isOpen: true,
        image: "https://images.unsplash.com/photo-1585937421612-70a008356fbe?w=500",
        coverImage: "https://images.unsplash.com/photo-1596799645730-96eaddf6e750?w=1200",
        address: "Koramangala, Bangalore",
        phone: "+91 98765 43213",
        email: "contact@spicegarden.com",
        description: "Authentic South Indian cuisine with traditional recipes passed down generations.",
        openingHours: "7:00 AM - 10:30 PM",
        menu: [
            { id: 401, name: "Masala Dosa", description: "Crispy dosa with potato filling", price: 120, category: "South Indian", isVeg: true, popular: true },
            { id: 402, name: "Idli Sambar", description: "Steamed rice cakes with sambar", price: 80, category: "South Indian", isVeg: true },
            { id: 403, name: "Vada", description: "Crispy lentil donuts", price: 60, category: "South Indian", isVeg: true },
            { id: 404, name: "Chicken Chettinad", description: "Spicy chicken curry", price: 280, category: "Main Course", isVeg: false, popular: true },
            { id: 405, name: "Fish Curry", description: "Traditional fish curry", price: 320, category: "Main Course", isVeg: false },
            { id: 406, name: "Filter Coffee", description: "Authentic South Indian coffee", price: 30, category: "Beverages", isVeg: true }
        ],
        tables: [
            { id: "G1", number: "Table 1", capacity: 2, isAvailable: true },
            { id: "G2", number: "Table 2", capacity: 4, isAvailable: true },
            { id: "G3", number: "Table 3", capacity: 6, isAvailable: true }
        ],
        reviews: []
    }
];