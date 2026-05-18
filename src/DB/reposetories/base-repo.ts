import { PopulateOptions, UpdateQuery } from 'mongoose';
import { HydratedDocument, ProjectionType, QueryFilter, QueryOptions, Types } from 'mongoose';
import { Model } from 'mongoose';

abstract class BaseRepo<TDocument> {
    constructor(protected readonly model: Model<TDocument>) { }

    public async create(data: Partial<TDocument>): Promise<HydratedDocument<TDocument>> {
        return this.model.create(data)
    }

    public async findById(id: Types.ObjectId): Promise<HydratedDocument<TDocument> | null> {
        return this.model.findById(id)
    }

    public async findOne({ filter, projection, options }:
        {
            filter: QueryFilter<TDocument>,
            projection?: ProjectionType<TDocument> | null | undefined,
            options?: QueryOptions<TDocument> | null | undefined
        }): Promise<HydratedDocument<TDocument> | null> {
        return this.model.findOne(filter, projection, options)
    }

    public async find({ filter, projection, options }:
        {
            filter: QueryFilter<TDocument>,
            projection?: ProjectionType<TDocument> | null | undefined,
            options?: QueryOptions<TDocument> | null | undefined
        }): Promise<HydratedDocument<TDocument>[] | []> {
        return this.model.find(filter, projection)
            .sort(options?.sort)
            .limit(options?.limit!)
            .skip(options?.skip!)
            .populate(options?.populate as PopulateOptions)
    }

    async findOneAndUpdate({ filter, update, options }:
        {
            filter: QueryFilter<TDocument>,
            update: UpdateQuery<TDocument>,
            options?: QueryOptions<TDocument>
        }): Promise<HydratedDocument<TDocument> | null> {
        return this.model.findOneAndUpdate(filter, update, { new: true, ...options })
    }

    async findByIdAndUpdate({ id, update, options }:
        {
            id: Types.ObjectId,
            update: UpdateQuery<TDocument>,
            options?: QueryOptions<TDocument>
        }): Promise<HydratedDocument<TDocument> | null> {
        return this.model.findByIdAndUpdate(id, update, { new: true, ...options })
    }

    async findOneAndDelete({ filter, options }:
        {
            filter: QueryFilter<TDocument>,
            options?: QueryOptions<TDocument>
        }): Promise<HydratedDocument<TDocument> | null> {
        return this.model.findOneAndDelete(filter, options)
    }

    async paginate({ page, limit, sort, populate, search }: {
        page?: number,
        limit?: number,
        sort?: any,
        populate?: any,
        search?: QueryFilter<TDocument>
    }) {
        page = +page! || 1
        limit = +limit! || 2

        if (page < 1) { page = 1 }
        if (limit < 1) { limit = 2 }

        const skip = (page - 1) * limit

        const [data, totalDoc] = await Promise.all([
            this.model.find({ ...(search ?? {}) })
                .limit(limit)
                .skip(skip)
                .sort(sort)
                .populate(populate)
                .exec(),

            this.model.countDocuments({ ...(search ?? {}) })
        ]);
        const totalPages = Math.ceil(totalDoc / limit)

        return {
            meta: {
                currentPage: page,
                totalPages,
                limit,
                totalDoc
            },
            data
        }
    }


}


export default BaseRepo