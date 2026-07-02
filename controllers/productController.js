import Product from "../models/Product.js";

const getStatusFromQuantity = (quantity, lowStockLimit) => {
    if (quantity <= 0) return "Out Of Stock";
    if (quantity <= lowStockLimit) return "Low Stock";
    return "In Stock";
};

export const addProduct = async (req, res) => {
    try {
        const {
            productName,
            sku,
            category,
            brand,
            price,
            quantity,
            supplier,
            lowStockLimit,
        } = req.body;

        if (
            !productName ||
            !sku ||
            !category ||
            !brand ||
            price === undefined ||
            quantity === undefined ||
            !supplier
        ) {
            return res.status(400).json({
                message: "Please fill all required fields",
            });
        }

        if (price < 0 || quantity < 0 || lowStockLimit < 0) {
            return res.status(400).json({
                message: "Price, Quantity, and Low Stock Limit must be greater than or equal to 0",
            });
        }

        const product = await Product.create({
            ...req.body,
            user: req.user.id,
            status: getStatusFromQuantity(Number(quantity), Number(lowStockLimit || 10)),
        });

        res.status(201).json({
            message: "Product Added Successfully",
            product,
        });
    } catch (error) {
        res.status(500).json({
            message: error.message,
        });
    }
};
export const getProducts = async (req, res) => {
    try {
        const products = await Product.find({
            user: req.user.id,
        }).sort({ createdAt: -1 });

        res.status(200).json(products);
    } catch (error) {
        res.status(500).json({
            message: error.message,
        });
    }
};

export const getProduct = async (req, res) => {
    try {
        const product = await Product.findOne({
            _id: req.params.id,
            user: req.user.id,
        })

        if (!product) {
            return res.status(404).json({
                message: "Product not found",
            });
        }

        res.status(200).json(product);
    } catch (error) {
        res.status(500).json({
            message: error.message,
        });
    }
};

export const updateProduct = async (req, res) => {
    try {
        const { price, quantity, lowStockLimit } = req.body;

        if (price !== undefined && price < 0) {
            return res.status(400).json({
                message: "Price cannot be negative",
            });
        }

        if (quantity !== undefined && quantity < 0) {
            return res.status(400).json({
                message: "Quantity cannot be negative",
            });
        }

        if (lowStockLimit !== undefined && lowStockLimit < 0) {
            return res.status(400).json({
                message: "Low stock limit cannot be negative",
            });
        }

        const existingProduct = await Product.findOne({
            _id: req.params.id,
            user: req.user.id,
        });

        if (!existingProduct) {
            return res.status(404).json({
                message: "Product not found",
            });
        }

        const nextQuantity = quantity !== undefined ? Number(quantity) : existingProduct.quantity;
        const nextLowStockLimit = lowStockLimit !== undefined ? Number(lowStockLimit) : existingProduct.lowStockLimit || 10;

        const product = await Product.findOneAndUpdate(
            {
                _id: req.params.id,
                user: req.user.id,
            },
            {
                ...req.body,
                status: getStatusFromQuantity(nextQuantity, nextLowStockLimit),
            },
            {
                new: true,
            }
        );

        res.json({
            message: "Product Updated Successfully",
            product,
        });
    } catch (error) {
        res.status(500).json({
            message: error.message,
        });
    }
};

export const deleteProduct = async (req, res) => {
    try {
        const product = await Product.findOneAndDelete({
            _id: req.params.id,
            user: req.user.id,
        });

        if (!product) {
            return res.status(404).json({
                message: "Product not found",
            });
        }

        res.json({
            message: "Product Deleted Successfully",
        });
    } catch (error) {
        res.status(500).json({
            message: error.message,
        });
    }
};
export const searchProducts = async (req, res) => {
    try {
        const { keyword } = req.query;

        const products = await Product.find({
            user: req.user.id,
            productName: {
                $regex: keyword,
                $options: "i",
            },
        });

        res.status(200).json(products);
    } catch (error) {
        res.status(500).json({
            message: error.message,
        });
    }
};
export const filterByCategory = async (req, res) => {
    try {
        const { category } = req.query;

        const products = await Product.find({
            user: req.user.id,
            category: {
                $regex: `^${category}$`,
                $options: "i",
            },
        });

        res.status(200).json(products);
    } catch (error) {
        res.status(500).json({
            message: error.message,
        });
    }
};
export const getPaginatedProducts = async (req, res) => {
    try {
        const page = Number(req.query.page) || 1;
        const limit = Number(req.query.limit) || 5;

        const skip = (page - 1) * limit;

        const totalProducts = await Product.countDocuments({
            user: req.user.id,
        });

        const products = await Product.find({
            user: req.user.id,
        })
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit);

        res.status(200).json({
            currentPage: page,
            totalPages: Math.ceil(totalProducts / limit),
            totalProducts,
            products,
        });
    } catch (error) {
        res.status(500).json({
            message: error.message,
        });
    }
};
export const sortProducts = async (req, res) => {
    try {
        const { sortBy = "createdAt", order = "desc" } = req.query;

        const sortOrder = order === "asc" ? 1 : -1;

        const products = await Product.find({
            user: req.user.id,
        }).sort({
            [sortBy]: sortOrder,
        });

        res.status(200).json(products);
    } catch (error) {
        res.status(500).json({
            message: error.message,
        });
    }
};
export const getLowStockProducts = async (req, res) => {
    try {
        const threshold = Number(req.query.threshold) || 10;

        const products = await Product.find({
            user: req.user.id,
            quantity: { $lte: threshold },
        }).sort({ quantity: 1 });

        res.status(200).json({
            count: products.length,
            products,
        });
    } catch (error) {
        res.status(500).json({
            message: error.message,
        });
    }
};

export const getRecentProducts = async (req, res) => {
    try {
        const products = await Product.find({
            user: req.user.id,
        })
            .sort({ createdAt: -1 })
            .limit(5);

        res.status(200).json({
            count: products.length,
            products,
        });
    } catch (error) {
        res.status(500).json({
            message: error.message,
        });
    }
};