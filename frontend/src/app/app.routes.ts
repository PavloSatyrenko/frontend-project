import { Routes } from "@angular/router";
import { adminGuard } from "@core/admin-guard";
import { userGuard } from "@core/user-guard";

export const routes: Routes = [
    {
        path: "",
        loadComponent: () => import("@layout/layout").then((m) => m.Layout),
        children: [
            {
                path: "",
                loadComponent: () => import("@pages/main/main").then((m) => m.Main),
            },
            {
                path: "category",
                loadComponent: () => import("@pages/category-list/category-list").then((m) => m.CategoryList),
            },
            {
                path: "category/:categoryId",
                loadComponent: () => import("@pages/category/category").then((m) => m.Category),
            },
            {
                path: "products",
                loadComponent: () => import("@pages/category/category").then((m) => m.Category),
            },
            {
                path: "product/:productId",
                loadComponent: () => import("@pages/product/product").then((m) => m.Product),
            },
            {
                path: "about",
                loadComponent: () => import("@pages/about/about").then((m) => m.About),
            },
            {
                path: "cabinet",
                loadComponent: () => import("@pages/cabinet/cabinet").then((m) => m.CabinetPage),
                children: [
                    {
                        path: "profile",
                        canActivate: [userGuard],
                        loadComponent: () => import("@components/cabinet/profile/profile").then((m) => m.Profile),
                    },
                    {
                        path: "shopping-cart",
                        loadComponent: () =>
                            import("@components/cabinet/shopping-cart/shopping-cart").then((m) => m.ShopingCart),
                    },
                    {
                        path: "favorites",
                        loadComponent: () => import("@components/cabinet/favorites/favorites").then((m) => m.Favorites),
                    },
                    {
                        path: "orders",
                        canActivate: [userGuard],
                        loadComponent: () => import("@components/cabinet/orders/orders").then((m) => m.Orders),
                    },
                    {
                        path: "",
                        redirectTo: "profile",
                        pathMatch: "full",
                    },
                ],
            },
            {
                path: "order-create",
                loadComponent: () => import("@pages/order-create/order-create").then((m) => m.OrderCreate),
            },
            {
                path: "auth",
                loadComponent: () => import("@pages/auth/auth").then((m) => m.Auth),
                children: [
                    {
                        path: "login",
                        loadComponent: () => import("@components/auth/login/login").then((m) => m.Login),
                    },
                    {
                        path: "signup",
                        loadComponent: () => import("@components/auth/signup/signup").then((m) => m.Signup),
                    },
                    {
                        path: "",
                        redirectTo: "login",
                        pathMatch: "full",
                    },
                ],
            },
            {
                path: "admin",
                canActivate: [adminGuard],
                loadComponent: () => import("@pages/admin/admin").then((m) => m.Admin),
                children: [
                    {
                        path: "products",
                        loadComponent: () => import("@components/admin/products/products").then((m) => m.Products),
                    },
                    {
                        path: "categories",
                        loadComponent: () =>
                            import("@components/admin/categories/categories").then((m) => m.Categories),
                    },
                    {
                        path: "orders",
                        loadComponent: () => import("@components/admin/orders/orders").then((m) => m.Orders),
                    },
                    {
                        path: "clients",
                        loadComponent: () => import("@components/admin/clients/clients").then((m) => m.Clients),
                    },
                    {
                        path: "vin",
                        loadComponent: () => import("@components/admin/vin/vin").then((m) => m.Vin),
                    },
                    {
                        path: "gallery",
                        loadComponent: () => import("@components/admin/gallery/gallery").then((m) => m.Gallery),
                    },
                    {
                        path: "config",
                        loadComponent: () => import("@components/admin/config/config").then((m) => m.Config),
                    },
                    {
                        path: "",
                        redirectTo: "products",
                        pathMatch: "full",
                    },
                ],
            },
        ],
    },
];
