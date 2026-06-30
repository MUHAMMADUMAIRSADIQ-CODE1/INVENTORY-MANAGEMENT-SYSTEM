import Product from "../models/Product.js";

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

        if (price < 0 || quantity < 0) {
            return res.status(400).json({
                message: "Price and Quantity must be greater than or equal to 0",
            });
        }
        const product = await Product.create({
            ...req.body,
            user: req.user.id,
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
        const product = await Product.findOneAndUpdate(
            {
                _id: req.params.id,
                user: req.user.id,
            },
            req.body,
            {
                new: true,
            }
        );

        if (!product) {
            return res.status(404).json({
                message: "Product not found",
            });
        }

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