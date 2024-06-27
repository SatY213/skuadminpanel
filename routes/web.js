const express = require("express");
const router = express.Router();
const authController = require("../controllers/authController");
const userController = require("../controllers/userController");
const collectionController = require("../controllers/collectionController");
const supplierController = require("../controllers/supplierController");
const cartController = require("../controllers/cartController");
const productController = require("../controllers/productController");
const orderController = require("../controllers/orderController");

const shopController = require("../controllers/shopController");

const upload = require("../middleware/fileMiddleware");

const authenticate = require("../middleware/authMiddleware");

/////////////////////// VALIDATION IMPORTS ///////////////////////////
const { check, body } = require("express-validator");
const validations = require("../validations/validation");

const roleMiddleware = require("../middleware/roleMiddleware");
////////////////////// VALIDATION IMPORTS - END /////////////////////
router.post(
  "/cart/place-order",
  authenticate,
  upload.single("picture"),
  cartController.placeOrder
);

router.get("/cart/shop/:id", authenticate, cartController.findLastCart);
router.patch(
  "/carts/:id",
  authenticate,
  upload.single("picture"),
  cartController.updateCart
);

/**/ router.post("/auth/logout", authenticate, authController.logout);
/**/ router.post(
  "/auth/registerCommercant",
  validations.registerValidation,
  authController.registerCommercant
);
/**/ router.post(
  "/auth/registerClient",
  validations.registerValidation,
  authController.registerClient
);
/**/ router.post(
  "/auth/loginClient",
  validations.loginValidation,
  authController.loginClient
);
/**/ router.post(
  "/auth/login",
  validations.loginValidation,
  authController.login
);
/**/ router.get(
  "/refresh",
  authenticate,
  upload.single("picture"),
  authController.tokenRefresh
);

// AUTH ROUTES-------------------------------------------FIN
//////////////////////////////////////////////

router.post(
  "/products",
  authenticate,

  upload.single("picture"),
  productController.createProduct
);
router.get(
  "/products/shop",
  authenticate,
  roleMiddleware("Commercant"),
  productController.findAllShopProducts
);
router.patch(
  "/products/shop/:id",
  authenticate,

  upload.single("picture"),
  productController.updateProduct
);
router.get(
  "/product-reduced/:id",

  productController.findProductByIdReduced
);

router.delete(
  "/products/:id",
  authenticate,
  roleMiddleware("Commercant"),
  productController.deleteProduct
);

router.get("/products/:id", authenticate, productController.findProductById);
router.get("/products/user");
router.get("/products/shop/:id", productController.findAllViewProducts);

//////////////////////////////////////////////////////////////////////////////////////////

//////////////////////////////////////////////////////////////////////////////////////////
router.patch(
  "/orders/cancel/:id",
  authenticate,
  upload.single("picture"),
  orderController.cancelOrder
);
router.get("/orders/user", authenticate, orderController.findAllUserOrders);

router.get(
  "/orders/shop",
  authenticate,
  roleMiddleware("Commercant"),
  orderController.findAllShopOrders
);
router.get(
  "/orders/:id",
  authenticate,
  roleMiddleware("Commercant"),
  orderController.findOrderById
);

router.delete(
  "/orders/:id",
  authenticate,
  roleMiddleware("Commercant"),
  orderController.deleteOrder
);
router.patch(
  "/orders/:id",
  authenticate,
  roleMiddleware("Commercant"),
  upload.single("picture"),

  orderController.updateOrder
);
//////////////////////////////////////////////////////////////////////////////////////////

//////////////////////////////////////////////

router.post(
  "/collections",
  authenticate,
  upload.single("picture"),
  collectionController.createCollection
);
router.get(
  "/collections/shop-reduced/:id",
  collectionController.findAllShopCollectionsReduced
);
router.get(
  "/collections/shop",
  authenticate,
  roleMiddleware("Commercant"),
  collectionController.findAllShopCollections
);
router.patch(
  "/collections/shop/:id",
  authenticate,
  roleMiddleware("Commercant"),
  upload.single("picture"),

  collectionController.updateCollection
);
router.delete(
  "/collections/:id",
  authenticate,
  roleMiddleware("Commercant"),
  collectionController.deleteCollection
);
router.get(
  "/collections/:id",
  authenticate,
  roleMiddleware("Commercant"),

  collectionController.findCollectionById
);
router.get(
  "/collections/sub_collections/:id",
  authenticate,
  collectionController.findSubCollections
);

router.get(
  "/collections/shop/:id",
  collectionController.findAllShopCollections
);

//////////////////////////////////////

//////////////////////////////////////////////

router.post(
  "/suppliers",
  authenticate,
  upload.single("picture"),
  supplierController.createSupplier
);
router.get(
  "/suppliers/shop",
  authenticate,
  roleMiddleware("Commercant"),
  supplierController.findAllShopSuppliers
);

router.patch(
  "/suppliers/shop/:id",
  authenticate,
  upload.single("picture"),

  supplierController.updateSupplier
);
router.delete(
  "/suppliers/:id",
  authenticate,
  supplierController.deleteSupplier
);
router.get("/suppliers/:id", authenticate, supplierController.findSupplierById);

router.get("/suppliers/user");
//////////////////////////////////////

//////////////////////////////////////////////

router.post(
  "/shops",
  authenticate,
  upload.single("logo"),
  shopController.createShop
);

router.patch(
  "/shops/:id",
  authenticate,
  upload.fields([
    { name: "logo", maxCount: 1 },
    { name: "banner", maxCount: 1 },
  ]),

  shopController.updateShop
);
router.delete("/shops/:id", authenticate, shopController.deleteShop);
router.get("/shops/:id", shopController.findShopById);

router.get("/shops/user");
router.get("/shops", authenticate, shopController.findAllShops);
//////////////////////////////////////

router.post(
  "/users",
  upload.single("picture"),
  authenticate,
  validations.createUser,
  userController.createUser
);
router.get(
  "/users/shop",
  authenticate,
  upload.single("picture"),
  userController.findAllShopUsers
);
router.patch(
  "/users/:id",
  upload.single("picture"),
  authenticate,
  validations.updateUser,
  userController.updateUser
);

router.delete(
  "/users/:id",
  authenticate,
  upload.single("picture"),
  userController.deleteUser
);

router.get(
  "/users/:id",
  authenticate,
  upload.single("picture"),
  userController.findUserById
);
router.get(
  "/users",
  authenticate,
  upload.single("picture"),
  userController.findAllUsers
);

//////////////////////////////////////////////
//////////////////////////////////////////////

module.exports = router;
