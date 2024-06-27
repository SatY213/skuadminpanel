const { check } = require("express-validator");
// USER & ATUH VALIDATIONS //
exports.registerValidation = [
  check("first_name", "Le prénom est requis.").not().isEmpty(),
  check("last_name", "Le nom est requis.").not().isEmpty(),
  check("email", "Veuillez inclure un email valide").isEmail(),
  check("password", "Le mot de passe doit comporter au moins 8 caractères.")
    .isLength({ min: 8 })
    .matches(/^(?=.*[0-9])(?=.*[!@#$%^&*])[a-zA-Z0-9!@#$%^&*]+$/, "i")
    .withMessage(
      "Le mot de passe doit contenir au moins un caractère spécial et un chiffre."
    ),
];

exports.loginValidation = [
  check("email", "Veuillez inclure un email valide.").isEmail(),
  check("password", "Password is required.").exists(),
];

exports.updateValidation = [
  check("email", "Veuillez inclure un email valide.").optional().isEmail(),
  check("password", "Le mot de passe doit comporter au moins 8 caractères.")
    .isLength({ min: 8 })
    .matches(/^(?=.*[0-9])(?=.*[!@#$%^&*])[a-zA-Z0-9!@#$%^&*]+$/, "i")
    .withMessage(
      "Le mot de passe doit contenir au moins un caractère spécial et un chiffre."
    )
    .optional(),
];

exports.createUser = [
  check("first_name", "Le prénom est requis.").not().isEmpty(),
  check("last_name", "Last name is required.").not().isEmpty(),
  check("email", "Veuillez inclure un email valide.").isEmail(),
  check("password", "Le mot de passe doit comporter au moins 8 caractères.")
    .isLength({ min: 8 })
    .matches(/^(?=.*[0-9])(?=.*[!@#$%^&*])[a-zA-Z0-9!@#$%^&*]+$/, "i")
    .withMessage(
      "Le mot de passe doit contenir au moins un caractère spécial et un chiffre."
    ),
  check("role", "Rôle invalide.").custom((value) => {
    const validRoles = ["Administrateur", "Utilisateur", "Assistant"];
    if (!validRoles.includes(value)) {
      throw new Error(
        "Le rôle doit être soit Administrateur, Utilisateur ou Assistant."
      );
    }
    return true;
  }),
];

exports.updateUser = [
  check("phone_number")
    .optional()
    .notEmpty()
    .withMessage("Le numéro de téléphone est requis."),
  check("first_name")
    .optional()
    .notEmpty()
    .withMessage("Le prénom est requis."),
  check("last_name").optional().notEmpty().withMessage("Le nom est requis."),
  check("email")
    .optional()
    .isEmail()
    .withMessage("Veuillez inclure un email valide."),
  check("password")
    .optional()
    .isLength({ min: 8 })
    .withMessage("Le mot de passe doit comporter au moins 8 caractères.")
    .matches(/^(?=.*[0-9])(?=.*[!@#$%^&*])[a-zA-Z0-9!@#$%^&*]+$/, "i")
    .withMessage(
      "Le mot de passe doit contenir au moins un caractère spécial et un chiffre."
    ),
  check("role")
    .optional()
    .custom((value) => {
      if (
        value &&
        !["Administrateur", "Utilisateur", "Assistant"].includes(value)
      ) {
        throw new Error(
          "Le rôle doit être soit Administrateur, Utilisateur ou Assistant."
        );
      }
      return true;
    }),
];
// ----------- //

// SUBSCRIPTION VALIDATION  //
exports.createSubscription = [
  check("type")
    .notEmpty()
    .withMessage("Le type est obligatoire.")
    .custom((value) => {
      if (value && !["Résidana", "Annuelle"].includes(value)) {
        throw new Error("Le type doit être Annuel ou Résendence.");
      }
      return true;
    }),
  check("expiration_date")
    .optional()
    .notEmpty()
    .withMessage("La date d'expiration est requise."),
  check("access_years")
    .optional()
    .notEmpty()
    .withMessage("Une année d’accès est requise.")
    .custom((value) => {
      if (
        value &&
        ![
          "Année 1",
          "Année 2",
          "Année 3",
          "Année 4",
          "Année 5",
          "Année 6",
          "Années",
        ].includes(value)
      ) {
        throw new Error(
          "L`'année d'accès doit être l'une des Année 1 .. Années"
        );
      }
      return true;
    }),
  check("generated_code").notEmpty().withMessage("Generated code is required"),
];
