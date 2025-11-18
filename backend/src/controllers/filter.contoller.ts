import { Filter, FilterValue } from "@prisma/client";
import { Request, Response } from "express";
import { validationResult } from "express-validator";
import { filterService } from "services/filter.service";

type FullFilter = Filter & { filterValues: (Pick<FilterValue, "name">)[] };

export const filterController = {
    async getFilters(request: Request, response: Response): Promise<void> {
        try {
            const categoryId: string | undefined = request.query.categoryId ? request.query.categoryId as string : undefined;
            const subcategoryIds: string[] | undefined = request.query.subcategoryIds ? (Array.isArray(request.query.subcategoryIds) ? request.query.subcategoryIds : [request.query.subcategoryIds]) as string[] : undefined;
            const minPrice: number | undefined = request.query.minPrice ? Number(request.query.minPrice) : undefined;
            const maxPrice: number | undefined = request.query.maxPrice ? Number(request.query.maxPrice) : undefined;
            const manufacturers: string[] | undefined = request.query.manufacturers ? (Array.isArray(request.query.manufacturers) ? request.query.manufacturers : [request.query.manufacturers]) as string[] : undefined;
            const discounts: string[] | undefined = request.query.discounts ? (Array.isArray(request.query.discounts) ? request.query.discounts : [request.query.discounts]) as string[] : undefined;
            const search: string | undefined = request.query.search ? request.query.search as string : undefined;

            const filters: FullFilter[] = await filterService.getFilters(categoryId, subcategoryIds, minPrice, maxPrice, manufacturers, discounts, search);

            response.status(200).json(filters);
        }
        catch (error) {
            console.error(error);
            response.status(500).json({ message: "Internal server error" });
        }
    }
}