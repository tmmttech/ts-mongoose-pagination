"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.mongoosePagination = void 0;
const defaultOptions = {
    lean: false,
    perPage: 10,
    projection: "",
    select: ""
};
function genMongooseQuery(model, conditions, options, countDocs) {
    let { collation, lean, perPage, populate, projection, select, sort, page } = options;
    const query = model
        .find(conditions, projection)
        .select(select)
        .sort(sort)
        .lean(lean);
    if (typeof collation !== "undefined") {
        if (Object.keys(collation).length > 0) {
            query.collation(collation);
        }
    }
    if (typeof populate !== "undefined") {
        query.populate(populate);
    }
    // page === 'undefined' <=> no pagination
    if (typeof page !== "undefined") {
        if (options.ignoreTotalPages === false) {
            const totalPages = Math.ceil(countDocs / perPage) || 1;
            if (page > totalPages) {
                page = totalPages;
            }
        }
        let skip = (page - 1) * perPage;
        query.skip(skip).limit(perPage);
    }
    return query;
}
function genPagination(options, count) {
    let { perPage, page } = options;
    const pagination = {
        hasPrevPage: false,
        hasNextPage: false,
        prevPage: null,
        nextPage: null,
        perPage: perPage
    };
    if (typeof page !== "undefined") {
        if (options.ignoreTotalPages === true) {
            pagination.page = page;
            if (count === options.perPage) {
                pagination.hasNextPage = true;
                pagination.nextPage = page + 1;
            }
            else {
                pagination.hasNextPage = false;
                pagination.nextPage = page;
            }
            if (page <= 1) {
                pagination.hasPrevPage = false;
                pagination.prevPage = 1;
            }
            else {
                pagination.hasPrevPage = true;
                pagination.prevPage = page - 1;
            }
        }
        else {
            const totalPages = Math.ceil(count / perPage) || 1;
            pagination.totalPages = totalPages;
            pagination.page = page;
            if (page > totalPages) {
                page = totalPages;
            }
            if (page > 1) {
                pagination.hasPrevPage = true;
                pagination.prevPage = page - 1;
            }
            if (page < totalPages) {
                pagination.hasNextPage = true;
                pagination.nextPage = page + 1;
            }
        }
    }
    return pagination;
}
async function paginate(conditions, options, callback) {
    const isCallbackSpecified = typeof callback === "function";
    try {
        options = {
            ...defaultOptions,
            ...options
        };
        conditions = conditions || {};
        let count = 0;
        if (options.ignoreTotalPages === true) {
            count = await this.countDocuments(conditions).exec();
        }
        const mongooseQuery = genMongooseQuery(this, conditions, options, count);
        const docs = await mongooseQuery.exec();
        if (docs && options.ignoreTotalPages === true) {
            count = docs.length;
        }
        const result = {
            data: docs,
            pagination: genPagination(options, count)
        };
        return isCallbackSpecified ? callback(null, result) : result;
    }
    catch (err) {
        return isCallbackSpecified ? callback(err) : err;
    }
}
function mongoosePagination(schema) {
    schema.statics.paginate = paginate;
}
exports.mongoosePagination = mongoosePagination;
