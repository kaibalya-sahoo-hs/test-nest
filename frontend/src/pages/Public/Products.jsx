import React, { useEffect, useState, useMemo } from 'react'
import { CiHeart } from 'react-icons/ci';
import { FaAngleLeft, FaAngleRight, FaIndianRupeeSign, FaStar } from 'react-icons/fa6';
import { useNavigate } from 'react-router';
import api from '../../utils/api';
import ProductFilterBar from '../../components/ProductFilterBar';

function Products() {
    const [products, setProducts] = useState([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(null)
    const navigate = useNavigate()

    // 1. Add Filter State
    const [filters, setFilters] = useState({
        category: '',
        sort: 'desc', // Default to High to Low
        rating: ''
    });

    useEffect(() => {
        const fetchProducts = async () => {
            try {
                setLoading(true);
                const response = await api.get('http://localhost:8000/products');
                if (response.data.success) {
                    setProducts(response.data.data);
                }
            } catch (err) {
                console.error("Fetch error:", err);
                setError("Failed to load products.");
            } finally {
                setLoading(false);
            }
        };
        fetchProducts();
    }, []);

    // 2. Filter Logic (useMemo for performance)
    const filteredProducts = useMemo(() => {
        let result = [...products];

        // Filter by Category
        if (filters.category) {
            result = result.filter(p => p.category?.toLowerCase() === filters.category.toLowerCase());
        }

        // Filter by Rating (e.g., 4 means 4 and above)
        if (filters.rating) {
            result = result.filter(p => Number(p.rating) >= parseFloat(filters.rating));
        }

        // Sort by Price
        result.sort((a, b) => {
            const priceA = Number(a.price);
            const priceB = Number(b.price);
            return filters.sort === 'asc' ? priceA - priceB : priceB - priceA;
        });

        return result;
    }, [products, filters]);

    const handleReset = () => {
        setFilters({ category: '', sort: 'desc', rating: '' });
    };

    if (loading) return <div className="text-center py-20 font-bold">Loading Store...</div>;

    return (
        <div className="max-w-7xl mx-auto px-4">
            {/* 3. Inject Filter UI */}
            <ProductFilterBar
                filters={filters}
                setFilters={setFilters}
                onReset={handleReset}
            />

            <div>
                {filteredProducts.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-20 bg-white rounded-lg border-2 border-dashed border-gray-200">
                        <h3 className="text-lg font-bold text-[#202224]">No Products Match Your Filters</h3>
                        <p className="text-gray-500 mb-6 text-sm text-center px-4">
                            Try adjusting your filters or resetting them.
                        </p>
                        <button onClick={handleReset} className="text-blue-500 underline">Reset All</button>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-8">
                        {filteredProducts.map((item) => (
                            <div key={item.id} className="bg-white rounded-lg p-6 shadow-sm border border-gray-100 relative group">
                                <div className="relative flex justify-center items-center mb-6">
                                    <button className="absolute left-0 p-1 bg-gray-100 rounded-full text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity">
                                        <FaAngleLeft size={16} />
                                    </button>

                                    <img
                                        src={item.image || "https://via.placeholder.com/200"}
                                        alt={"Product image"}
                                        className="w-48 h-48 object-contain cursor-pointer"
                                        onClick={() => navigate(`/products/${item.id}`)}
                                    />

                                    <button className="absolute right-0 p-1 bg-gray-100 rounded-full text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity">
                                        <FaAngleRight size={16} />
                                    </button>
                                </div>

                                <div className="flex justify-between items-start mb-2">
                                    <div>
                                        <h3 className="text-lg font-bold text-[#202224] truncate max-w-[150px]">
                                            {item.name}
                                        </h3>
                                        <p className="text-[#4379EE] font-bold flex items-center">
                                            <FaIndianRupeeSign />{Number(item.price).toLocaleString('en-IN')}
                                        </p>
                                    </div>
                                </div>

                                {/* <div className="flex items-center gap-1 mb-6">
                                    {[1, 2, 3, 4, 5].map((star) => (
                                        <FaStar
                                            key={star}
                                            size={14}
                                            className={star <= Math.round(item.rating) ? "fill-[#FFAD33] text-[#FFAD33]" : "text-gray-300"}
                                        />
                                    ))}
                                    <span className="text-xs text-gray-400 ml-1">
                                        ({item.rating})
                                    </span>
                                </div> */}
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    )
}

export default Products