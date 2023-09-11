const express = require("express");
const { check, body } = require("express-validator");
const router = express.Router();
const authController = require("../controllers/authController");
const productController = require("../controllers/ecomm/productController");
const supplierController = require("../controllers/ecomm/supplierController");
const clientController = require("../controllers/ecomm/clientController");
const categoryController = require("../controllers/ecomm/categoryController");
const bannerController = require("../controllers/ecomm/publicity/bannerController");

const authenticate = require("../middleware/authMiddleware");
const upload = require("../middleware/fileMiddleware");

// PRODUCT ROUTES-------------------------------------------
// authenticate,upload.single('file'),

router.get(
  "/totalSold",
  authenticate,
  productController.generateTotalSoldHistogram
);
router.get(
  "/totalGain",
  authenticate,
  productController.generateTotalGainHistogram
);
router.get(
  "/totalReturned",
  authenticate,
  productController.generateReturnedProductsHistogram
);

router.get("/stock", authenticate, productController.calculateTotalQuantity);
// Create a new product
router.post(
  "/products",
  authenticate,
  upload.array("pictures", 4),
  productController.createProduct
);

// Update a product by ID
router.put(
  "/products/:id",
  authenticate,
  upload.array("pictures", 4),
  productController.updateProduct
);

// Delete a product by ID
router.delete("/products/:id", authenticate, productController.deleteProduct);

// Find a product by ID
router.get("/products/:id", authenticate, productController.findProductById);

router.get(
  "/productsbyclient/:clientId",
  authenticate,
  productController.findProductsByClient
);

// Find a product by Barcode
router.get(
  "/productsbybarcode/:barcode",
  authenticate,
  productController.searchProductByBarcode
);

// Find all products with pagination and search
router.get("/products", authenticate, productController.findAllProducts);
// PRODUCT ROUTES-------------------------------------------FIN

router.post(
  "/banners",
  upload.array("pictures", 4),
  bannerController.createBanner
);

// Update a banner by ID
router.put("/banners/:id", bannerController.updateBanner);

// Delete a banner by ID
router.delete("/banners/:id", bannerController.deleteBanner);

// Find a banner by ID
router.get("/banners/:id", bannerController.findBannerById);

// Find all banners with pagination and search
router.get("/banners", bannerController.findAllBanners);
// Banner ROUTES-------------------------------------------FIN

// CLIENT ROUTES-------------------------------------------

// Create a new client
router.post("/clients", authenticate, clientController.createClient);

// Update a client by ID
router.put("/clients/:id", authenticate, clientController.updateClient);

// Delete a client by ID
router.delete("/clients/:id", authenticate, clientController.deleteClient);

// Find a client by ID
router.get("/clients/:id", authenticate, clientController.findClientById);
// Find a client by ID
router.get(
  "/clientbyphonenumber/:phonenumber",
  authenticate,
  clientController.findClientByPhoneNumber
);

// Find all clients with pagination and search
router.get("/clients", authenticate, clientController.findAllClients);
// CLIENT ROUTES-------------------------------------------FIN

// SUPPLIER ROUTES-------------------------------------------

// Create a new supplier
router.post("/suppliers", authenticate, supplierController.createSupplier);

// Update a supplier by ID
router.put("/suppliers/:id", authenticate, supplierController.updateSupplier);

// Delete a supplier by ID
router.delete(
  "/suppliers/:id",
  authenticate,
  supplierController.deleteSupplier
);

// Find a supplier by ID
router.get("/suppliers/:id", authenticate, supplierController.findSupplierById);

// Find all suppliers with pagination and search
router.get("/suppliers", authenticate, supplierController.findAllSuppliers);

// SUPPLIER ROUTES-------------------------------------------FIN

// CATEGORIES ROUTES-------------------------------------------

// Create a new category
router.post("/categories", authenticate, categoryController.createCategory);

// Update a category by ID
router.put("/categories/:id", authenticate, categoryController.updateCategory);

// Delete a category by ID
router.delete(
  "/categories/:id",
  authenticate,
  categoryController.deleteCategory
);

// Find a category by ID
router.get(
  "/categories/:id",
  authenticate,
  categoryController.findCategoryById
);

// Find all categories with pagination and search
router.get("/categories", authenticate, categoryController.findAllCategories);

// category ROUTES-------------------------------------------FIN

// ORDER AND PROFILE ROUTES -----------------------------

router.get("/profile", authenticate, authController.profile);

// router.post(
//   "/order",
//   [
//     body("product").notEmpty().withMessage("Product is required"),
//     body("quantity").notEmpty().withMessage("Quantity is required"),
//     body("phoneNumber").notEmpty().withMessage("Phone number is required"),
//     body("firstName").notEmpty().withMessage("First name is required"),
//     body("lastName").notEmpty().withMessage("Last name is required"),
//     body("wilaya").notEmpty().withMessage("Wilaya is required"),
//     body("address").notEmpty().withMessage("Address is required"),
//   ],
//   orderController.createOrder
// );

// ORDER AND PROFILE ROUTES -----------------------------FIN

// AUTH ROUTES-------------------------------------------

router.post("/auth/logout", authenticate, authController.logout);

router.post(
  "/auth/register",
  [
    check("username", "Username is required").not().isEmpty(),
    check("email", "Please include a valid email").isEmail(),
    check(
      "password",
      "Please enter a password with 6 or more characters"
    ).isLength({ min: 6 }),
  ],
  authController.register
);

// Login
router.post(
  "/auth/login",
  [
    check("email", "Please include a valid email").isEmail(),
    check("password", "Password is required").exists(),
  ],
  authController.login
);

//UpdateUser
router.put(
  "/auth/update",
  [
    check("email", "Please include a valid email").optional().isEmail(),
    check("password", "Password must be at least 8 characters long")
      .optional()
      .isLength({ min: 8 })
      .matches(/^(?=.*[0-9])(?=.*[!@#$%^&*])[a-zA-Z0-9!@#$%^&*]+$/, "i")
      .withMessage(
        "Password must contain at least one special character and one number"
      ),
  ],
  authenticate,
  authController.updateUser
);

// AUTH ROUTES-------------------------------------------FIN

module.exports = router;
